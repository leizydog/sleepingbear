from pydantic import BaseModel, validator
from datetime import datetime
from typing import Optional

class PropertyBase(BaseModel):
    name: str
    description: Optional[str] = None
    address: str
    price_per_month: float
    bedrooms: int
    bathrooms: int
    size_sqm: float
    image_url: Optional[str] = None
    
    @validator('price_per_month')
    def validate_price(cls, v):
        if v <= 0:
            raise ValueError('Price must be greater than 0')
        return v
    
    @validator('bedrooms', 'bathrooms')
    def validate_rooms(cls, v):
        if v < 0:
            raise ValueError('Number of rooms cannot be negative')
        return v

class PropertyCreate(PropertyBase):
    pass

class PropertyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    price_per_month: Optional[float] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    size_sqm: Optional[float] = None
    image_url: Optional[str] = None
    is_available: Optional[bool] = None

class PropertyResponse(PropertyBase):
    id: int
    is_available: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class PropertyListResponse(BaseModel):
    properties: list[PropertyResponse]
    total: int
    page: int
    per_page: int