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
    booking = db.query(models.Booking).filter(models.Booking.id == payment_data.booking_id).first()
    if not booking: raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != current_user.id: raise HTTPException(status_code=403, detail="Not authorized")
    
    # Mock payment creation for now
    payment = models.Payment(
        booking_id=booking.id,
        amount=booking.total_amount,
        payment_method=payment_data.payment_method,
        payment_intent_id=f"pi_{secrets.token_hex(12)}",
        status=models.PaymentStatus.PENDING,
        receipt_number=f"RN-{secrets.token_hex(4).upper()}"
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    
    return {
        'client_secret': "mock_secret",
        'payment_intent_id': payment.payment_intent_id,
        'amount': payment.amount,
    }

@router.post("/confirm")
def confirm_payment(confirm_data: schemas_payment.PaymentConfirm, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    payment = db.query(models.Payment).filter(models.Payment.payment_intent_id == confirm_data.payment_intent_id).first()
    if not payment: raise HTTPException(status_code=404, detail="Payment not found")
    
    payment.status = models.PaymentStatus.COMPLETED
    payment.paid_at = datetime.utcnow()
    payment.booking.status = models.BookingStatus.CONFIRMED
    db.commit()
    
    return {'success': True, 'message': 'Payment confirmed'}

@router.get("/my-payments", response_model=List[schemas_payment.PaymentResponse])
def get_my_payments(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Payment).join(models.Booking).filter(models.Booking.user_id == current_user.id).order_by(models.Payment.created_at.desc()).all()

@router.get("/booking/{booking_id}", response_model=List[schemas_payment.PaymentResponse])
def get_booking_payments(booking_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Payment).filter(models.Payment.booking_id == booking_id).all()

@router.post("/refund")
def request_refund(refund_data: schemas_payment.RefundRequest, db: Session = Depends(get_db)):
    # Logic placeholder
    return {'success': True}

@router.get("/{payment_id}", response_model=schemas_payment.PaymentResponse)
def get_payment(payment_id: int, db: Session = Depends(get_db)):
    return db.query(models.Payment).filter(models.Payment.id == payment_id).first()