from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.models import all_models as models
from app.schemas import schemas_payment
from app.core import security as auth
from app.db.session import get_db
from app.services.payment_service import PaymentService
from datetime import datetime
import secrets

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.get("/", response_model=List[schemas_payment.PaymentResponse])
def get_all_payments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN]))
):
    """Get all payments (Admin only)"""
    return db.query(models.Payment).order_by(models.Payment.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/methods")
def get_payment_methods():
    return PaymentService.get_payment_methods()

@router.post("/create-intent", response_model=schemas_payment.PaymentIntentResponse)
def create_payment_intent(
    payment_data: schemas_payment.PaymentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # 1. Verify Booking
    booking = db.query(models.Booking).filter(models.Booking.id == payment_data.booking_id).first()
    if not booking: 
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != current_user.id: 
        raise HTTPException(status_code=403, detail="Not authorized")
    
    method = payment_data.payment_method.lower()

    # --- CASE A: CASH ---
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

    # --- CASE B: GCASH (Strict Mock) ---
    if method == 'gcash':
        mock_id = f"pi_mock_gcash_{secrets.token_hex(8)}"
        payment = models.Payment(
            booking_id=booking.id,
            amount=booking.total_amount,
            payment_method='gcash',
            payment_intent_id=mock_id,
            status=models.PaymentStatus.PENDING,
            receipt_number=f"GCASH-{secrets.token_hex(4).upper()}"
        )
        db.add(payment)
        db.commit()
        return {
            'client_secret': "mock_secret_gcash",
            'payment_intent_id': mock_id,
            'amount': booking.total_amount,
        }

    # --- CASE C: BPI / CARD (Try Real Stripe, Fallback to Mock) ---
    try:
        result = PaymentService.create_payment_intent(
            amount=booking.total_amount,
            payment_method_type='card',
            metadata={'booking_id': booking.id, 'user_email': current_user.email}
        )
        
        if not result['success']:
            raise Exception(result.get('error', 'Unknown Stripe error'))

        payment_intent_id = result['payment_intent_id']
        client_secret = result['client_secret']

    except Exception as e:
        print(f"⚠️ Stripe Failed ({e}). Switching to Mock for Demo.")
        payment_intent_id = f"pi_fallback_{secrets.token_hex(8)}"
        client_secret = "mock_secret_fallback"

    # Save Payment Record
    payment = models.Payment(
        booking_id=booking.id,
        amount=booking.total_amount,
        payment_method=method,
        payment_intent_id=payment_intent_id,
        status=models.PaymentStatus.PENDING,
        receipt_number=f"REF-{secrets.token_hex(4).upper()}"
    )
    db.add(payment)
    db.commit()
    
    return {
        'client_secret': client_secret,
        'payment_intent_id': payment_intent_id,
        'amount': booking.total_amount,
    }

@router.post("/confirm")
def confirm_payment(
    confirm_data: schemas_payment.PaymentConfirm, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    # 1. Find the payment
    if confirm_data.payment_intent_id.startswith("cash_"):
        payment_id = int(confirm_data.payment_intent_id.split("_")[1])
        payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    else:
        payment = db.query(models.Payment).filter(models.Payment.payment_intent_id == confirm_data.payment_intent_id).first()

    if not payment: 
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # 2. Explicitly Find the Booking
    booking = db.query(models.Booking).filter(models.Booking.id == payment.booking_id).first()
    
    # --- FORCE SUCCESS ---
    payment.status = models.PaymentStatus.COMPLETED
    payment.paid_at = datetime.utcnow()
    
    if booking:
        print(f"✅ Converting Booking {booking.id} to CONFIRMED")
        booking.status = models.BookingStatus.CONFIRMED
    
    db.commit()
    
    return {'success': True, 'message': f'{payment.payment_method.upper()} payment confirmed'}

@router.get("/my-payments", response_model=List[schemas_payment.PaymentResponse])
def get_my_payments(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Payment).join(models.Booking).filter(models.Booking.user_id == current_user.id).order_by(models.Payment.created_at.desc()).all()

@router.get("/booking/{booking_id}", response_model=List[schemas_payment.PaymentResponse])
def get_booking_payments(booking_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Payment).filter(models.Payment.booking_id == booking_id).all()

@router.get("/{payment_id}", response_model=schemas_payment.PaymentResponse)
def get_payment(payment_id: int, db: Session = Depends(get_db)):
    return db.query(models.Payment).filter(models.Payment.id == payment_id).first()