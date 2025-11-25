from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class PropertyBase(BaseModel):
    name: str
    description: Optional[str] = None
    address: str
    price_per_month: float
    bedrooms: Optional[int] = 1
    bathrooms: Optional[int] = 1
    size_sqm: Optional[float] = 0
    is_available: Optional[bool] = True
    image_url: Optional[str] = None
    images: Optional[List[str]] = [] 
    
    # ✅ Payment Fields
    accepts_bpi: Optional[bool] = False
    accepts_gcash: Optional[bool] = False
    accepts_cash: Optional[bool] = False
    
    # ✅ Account Info
    gcash_number: Optional[str] = None
    bpi_number: Optional[str] = None
    
    # ✅ NEW: QR Image
    gcash_qr_image_url: Optional[str] = None

class PropertyCreate(PropertyBase):
    pass

class PropertyUpdate(PropertyBase):
    name: Optional[str] = None
    address: Optional[str] = None
    price_per_month: Optional[float] = None
    status: Optional[str] = None
    # Update payment methods too
    accepts_bpi: Optional[bool] = None
    accepts_gcash: Optional[bool] = None
    accepts_cash: Optional[bool] = None
    # Update account numbers
    gcash_number: Optional[str] = None
    bpi_number: Optional[str] = None
    gcash_qr_image_url: Optional[str] = None

class PropertyResponse(PropertyBase):
    id: int
    owner_id: Optional[int]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class PropertyListResponse(BaseModel):
    properties: List[PropertyResponse]
    total: int
    page: int
    per_page: int