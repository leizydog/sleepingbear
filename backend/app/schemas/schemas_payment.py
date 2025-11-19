from pydantic import BaseModel, validator
from datetime import datetime
from typing import Optional
from app.models.all_models import PaymentStatus  # Import PaymentStatus here

class PaymentCreate(BaseModel):
    booking_id: int
    payment_method: str
    
    @validator('payment_method')
    def validate_payment_method(cls, v):
        allowed = ['card', 'gcash', 'bank_transfer']
        if v not in allowed:
            raise ValueError(f'Payment method must be one of {allowed}')
        return v

class PaymentIntentResponse(BaseModel):
    client_secret: str
    payment_intent_id: str
    amount: float

class PaymentConfirm(BaseModel):
    payment_intent_id: str

class PaymentResponse(BaseModel):
    id: int
    booking_id: int
    amount: float
    payment_method: str
    transaction_id: Optional[str]
    status: PaymentStatus
    paid_at: Optional[datetime]
    receipt_url: Optional[str]
    receipt_number: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class RefundRequest(BaseModel):
    payment_id: int
    amount: Optional[float] = None
    reason: Optional[str] = None