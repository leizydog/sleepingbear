from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request, Query
from sqlalchemy.orm import Session
from typing import List
from app.models import all_models as models
from app.schemas import schemas_payment
from app.core import security as auth
from app.db.session import get_db
from app.services.payment_service import PaymentService
from datetime import datetime
import secrets
import shutil
import os
import uuid

router = APIRouter(prefix="/payments", tags=["Payments"])

# --- HELPER: Resolve Receipt URLs ---
def resolve_payment_urls(payment, base_url: str):
    if not payment: return payment
    if payment.receipt_url and not payment.receipt_url.startswith("http"):
        payment.receipt_url = f"{base_url}/{payment.receipt_url}"
    return payment

@router.get("/", response_model=List[schemas_payment.PaymentResponse])
def get_all_payments(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN]))
):
    """Get all payments with resolved URLs"""
    payments = db.query(models.Payment).order_by(models.Payment.created_at.desc()).offset(skip).limit(limit).all()
    
    base_url = str(request.base_url).rstrip("/")
    for p in payments:
        resolve_payment_urls(p, base_url)
        
    return payments

@router.get("/methods")
def get_payment_methods():
    return PaymentService.get_payment_methods()

@router.post("/create-intent", response_model=schemas_payment.PaymentIntentResponse)
def create_payment_intent(
    payment_data: schemas_payment.PaymentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    booking = db.query(models.Booking).filter(models.Booking.id == payment_data.booking_id).first()
    if not booking: 
        raise HTTPException(status_code=404, detail="Booking not found")
    
    method = payment_data.payment_method.lower()

    # --- CASE A: GCASH (Manual Flow) ---
    if method == 'gcash':
        return {
            'client_secret': "manual_flow_gcash", 
            'payment_intent_id': "manual_pending",
            'amount': booking.total_amount,
        }

    # --- CASE B: CASH (Mock) ---
    if method == 'cash':
        payment = models.Payment(
            booking_id=booking.id,
            amount=booking.total_amount,
            payment_method='cash',
            status=models.PaymentStatus.PENDING,
            receipt_number=f"CASH-{secrets.token_hex(4).upper()}"
        )
        db.add(payment)
        db.commit()
        return {
            'client_secret': "cash_payment",
            'payment_intent_id': f"cash_{payment.id}",
            'amount': payment.amount,
        }

    # --- CASE C: BPI/Card (Stripe Test) ---
    if method == 'bpi' or method == 'card':
        try:
            result = PaymentService.create_payment_intent(
                amount=booking.total_amount,
                payment_method_type='card', 
                metadata={'booking_id': booking.id}
            )
            
            if not result['success']: raise Exception(result.get('error'))

            payment = models.Payment(
                booking_id=booking.id,
                amount=booking.total_amount,
                payment_method=method,
                payment_intent_id=result['payment_intent_id'],
                status=models.PaymentStatus.PENDING,
                receipt_number=f"REF-{secrets.token_hex(4).upper()}"
            )
            db.add(payment)
            db.commit()
            
            return {
                'client_secret': result['client_secret'],
                'payment_intent_id': result['payment_intent_id'],
                'amount': booking.total_amount,
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Card Payment Failed: {str(e)}")

    raise HTTPException(status_code=400, detail="Invalid payment method")

# --- Upload Receipt for Manual GCash ---
@router.post("/upload-receipt")
async def upload_payment_receipt(
    booking_id: int = Form(...),
    payment_method: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # 1. Save File
    upload_dir = "static/uploads/receipts"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"receipt_{booking.id}_{uuid.uuid4()}.{file_ext}"
    file_path = f"{upload_dir}/{filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 2. Create Payment Record (Status: PENDING)
    payment = models.Payment(
        booking_id=booking.id,
        amount=booking.total_amount,
        payment_method=payment_method,
        payment_intent_id=f"manual_{uuid.uuid4()}",
        status=models.PaymentStatus.PENDING,
        receipt_url=file_path,
        receipt_number=f"MANUAL-{secrets.token_hex(4).upper()}"
    )
    db.add(payment)
    db.commit()

    return {"success": True, "message": "Receipt submitted for review"}

@router.post("/confirm")
def confirm_payment(
    confirm_data: schemas_payment.PaymentConfirm, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    if confirm_data.payment_intent_id.startswith("cash_"):
        payment_id = int(confirm_data.payment_intent_id.split("_")[1])
        payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    else:
        payment = db.query(models.Payment).filter(models.Payment.payment_intent_id == confirm_data.payment_intent_id).first()

    if not payment: 
        raise HTTPException(status_code=404, detail="Payment not found")
    
    booking = db.query(models.Booking).filter(models.Booking.id == payment.booking_id).first()
    
    payment.status = models.PaymentStatus.COMPLETED
    payment.paid_at = datetime.utcnow()
    
    if booking:
        booking.status = models.BookingStatus.CONFIRMED
    
    db.commit()
    
    return {'success': True, 'message': 'Payment confirmed', 'receipt_number': payment.receipt_number}

# --- ✅ UPDATED: Review Endpoint ---
@router.put("/{payment_id}/review")
def review_payment(
    payment_id: int,
    action: str = Query(..., regex="^(approve|reject)$"),
    db: Session = Depends(get_db),
    # ✅ FIX: Added TENANT to the allowed roles list
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN, models.UserRole.OWNER, models.UserRole.TENANT]))
):
    payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    if not payment: raise HTTPException(status_code=404, detail="Payment not found")
    
    booking = db.query(models.Booking).filter(models.Booking.id == payment.booking_id).first()
    if not booking: raise HTTPException(status_code=404, detail="Associated booking not found")

    # ✅ SECURITY CHECK: If not Admin, ensure the user OWNS the property
    if current_user.role != models.UserRole.ADMIN:
        # Ensure booking.property is loaded and check owner_id
        if not booking.property or booking.property.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="You are not authorized to review this payment")

    if action == "approve":
        payment.status = models.PaymentStatus.COMPLETED
        payment.paid_at = datetime.utcnow()
        booking.status = models.BookingStatus.CONFIRMED
        message = "Payment approved. Booking confirmed."

    elif action == "reject":
        payment.status = models.PaymentStatus.FAILED
        booking.status = models.BookingStatus.CANCELLED
        message = "Payment rejected. Booking cancelled and dates are now free."
        
    db.commit()
    return {"success": True, "message": message}

@router.get("/my-payments", response_model=List[schemas_payment.PaymentResponse])
def get_my_payments(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Payment).join(models.Booking).filter(models.Booking.user_id == current_user.id).order_by(models.Payment.created_at.desc()).all()

@router.get("/booking/{booking_id}", response_model=List[schemas_payment.PaymentResponse])
def get_booking_payments(
    booking_id: int, 
    request: Request,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    payments = db.query(models.Payment).filter(models.Payment.booking_id == booking_id).all()
    base_url = str(request.base_url).rstrip("/")
    for p in payments: resolve_payment_urls(p, base_url)
    return payments

@router.get("/{payment_id}", response_model=schemas_payment.PaymentResponse)
def get_payment(payment_id: int, db: Session = Depends(get_db)):
    return db.query(models.Payment).filter(models.Payment.id == payment_id).first()