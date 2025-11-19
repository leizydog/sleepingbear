from pydantic import BaseModel, validator
from datetime import datetime
from typing import Optional
from models import BookingStatus

class BookingBase(BaseModel):
    property_id: int
    start_date: datetime
    end_date: datetime
    
    @validator('end_date')
    def validate_dates(cls, v, values):
        if 'start_date' in values and v <= values['start_date']:
            raise ValueError('End date must be after start date')
        return v

class BookingCreate(BookingBase):
    pass

class BookingResponse(BookingBase):
    id: int
    user_id: int
    total_amount: float
    status: BookingStatus
    created_at: datetime
    
    class Config:
        from_attributes = True

class BookingWithDetails(BookingResponse):
    property: dict
    user: dict

class BookingUpdate(BaseModel):
    status: Optional[BookingStatus] = None

class AvailabilityCheck(BaseModel):
    property_id: int
    start_date: datetime
    end_date: datetime
    
class AvailabilityResponse(BaseModel):
    available: bool
    message: str