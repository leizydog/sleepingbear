from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import models
import schemas_payment
import auth
from database import get_db
from services.payment_service import PaymentService
from datetime import datetime
import secrets

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.get("/methods")
def get_payment_methods():
    """Get available payment methods"""
    return PaymentService.get_payment_methods()

@router.post("/create-intent", response_model=schemas_payment.PaymentIntentResponse)
def create_payment_intent(
    payment_data: schemas_payment.PaymentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Create a payment intent for a booking
    """
    # Get booking
    booking = db.query(models.Booking).filter(
        models.Booking.id == payment_data.booking_id
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check if user owns this booking
    if booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to pay for this booking"
        )
    
    # Check if booking is payable
    if booking.status not in [models.BookingStatus.PENDING, models.BookingStatus.CONFIRMED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking is not in a payable state"
        )
    
    # Check if already paid
    existing_payment = db.query(models.Payment).filter(
        models.Payment.booking_id == booking.id,
        models.Payment.status == models.PaymentStatus.COMPLETED
    ).first()
    
    if existing_payment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking has already been paid"
        )
    
    # Create payment intent with Stripe
    metadata = {
        'booking_id': booking.id,
        'user_id': current_user.id,
        'property_id': booking.property_id,
    }
    
    result = PaymentService.create_payment_intent(
        amount=booking.total_amount,
        metadata=metadata
    )
    
    if not result['success']:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment intent creation failed: {result.get('error')}"
        )
    
    # Create pending payment record
    payment = models.Payment(
        booking_id=booking.id,
        amount=booking.total_amount,
        payment_method=payment_data.payment_method,
        payment_intent_id=result['payment_intent_id'],
        status=models.PaymentStatus.PENDING,
        receipt_number=f"RN-{secrets.token_hex(4).upper()}"
    )
    
    db.add(payment)
    db.commit()
    db.refresh(payment)
    
    return {
        'client_secret': result['client_secret'],
        'payment_intent_id': result['payment_intent_id'],
        'amount': result['amount'],
    }

@router.post("/confirm")
def confirm_payment(
    confirm_data: schemas_payment.PaymentConfirm,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Confirm a payment after successful payment intent
    """
    # Find payment record
    payment = db.query(models.Payment).filter(
        models.Payment.payment_intent_id == confirm_data.payment_intent_id
    ).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment record not found"
        )
    
    # Verify with Stripe
    result = PaymentService.confirm_payment(confirm_data.payment_intent_id)
    
    if not result['success']:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment confirmation failed: {result.get('error')}"
        )
    
    # Update payment record
    if result['status'] == 'succeeded':
        payment.status = models.PaymentStatus.COMPLETED
        payment.paid_at = datetime.utcnow()
        payment.transaction_id = result.get('payment_method')
        payment.receipt_url = result.get('receipt_url')
        
        # Update booking status
        booking = payment.booking
        booking.status = models.BookingStatus.CONFIRMED
        
        db.commit()
        
        return {
            'success': True,
            'message': 'Payment confirmed successfully',
            'payment_id': payment.id,
            'booking_status': booking.status.value,
        }
    else:
        payment.status = models.PaymentStatus.FAILED
        db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payment not successful. Status: {result['status']}"
        )

@router.get("/booking/{booking_id}", response_model=List[schemas_payment.PaymentResponse])
def get_booking_payments(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get all payments for a booking"""
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check permissions
    if current_user.role != models.UserRole.ADMIN and booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view these payments"
        )
    
    payments = db.query(models.Payment).filter(
        models.Payment.booking_id == booking_id
    ).all()
    
    return payments

@router.get("/my-payments", response_model=List[schemas_payment.PaymentResponse])
def get_my_payments(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get all payments by current user"""
    payments = db.query(models.Payment).join(models.Booking).filter(
        models.Booking.user_id == current_user.id
    ).order_by(models.Payment.created_at.desc()).all()
    
    return payments

@router.post("/refund", dependencies=[Depends(auth.require_role([models.UserRole.ADMIN]))])
def request_refund(
    refund_data: schemas_payment.RefundRequest,
    db: Session = Depends(get_db)
):
    """
    Process a refund (Admin only)
    """
    payment = db.query(models.Payment).filter(
        models.Payment.id == refund_data.payment_id
    ).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    if payment.status != models.PaymentStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only refund completed payments"
        )
    
    # Process refund with Stripe
    result = PaymentService.create_refund(
        payment.payment_intent_id,
        refund_data.amount
    )
    
    if not result['success']:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Refund failed: {result.get('error')}"
        )
    
    # Update payment status
    payment.status = models.PaymentStatus.REFUNDED
    
    # Update booking status
    payment.booking.status = models.BookingStatus.CANCELLED
    
    db.commit()
    
    return {
        'success': True,
        'message': 'Refund processed successfully',
        'refund_id': result['refund_id'],
        'amount': result['amount'],
    }

@router.get("/{payment_id}", response_model=schemas_payment.PaymentResponse)
def get_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get payment details"""
    payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Check permissions
    if current_user.role != models.UserRole.ADMIN and payment.booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this payment"
        )
    
    return payment