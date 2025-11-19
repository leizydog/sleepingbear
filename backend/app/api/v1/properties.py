from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.models import all_models as models
from app.schemas import schemas_property
from app.core import security as auth
from app.db.session import get_db

router = APIRouter(prefix="/properties", tags=["Properties"])

@router.post("/", response_model=schemas_property.PropertyResponse, status_code=status.HTTP_201_CREATED)
def create_property(
    property_data: schemas_property.PropertyCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN, models.UserRole.OWNER]))
):
    """Create a new property (Admin/Owner only)"""
    db_property = models.Property(**property_data.dict())
    db.add(db_property)
    db.commit()
    db.refresh(db_property)
    return db_property

@router.get("/", response_model=schemas_property.PropertyListResponse)
def get_properties(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    bedrooms: Optional[int] = None,
    available_only: bool = True,
    db: Session = Depends(get_db)
):
    """Get all properties with filters and pagination"""
    query = db.query(models.Property)
    
    # Apply filters
    if available_only:
        query = query.filter(models.Property.is_available == True)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (models.Property.name.ilike(search_term)) |
            (models.Property.address.ilike(search_term)) |
            (models.Property.description.ilike(search_term))
        )
    
    if min_price is not None:
        query = query.filter(models.Property.price_per_month >= min_price)
    
    if max_price is not None:
        query = query.filter(models.Property.price_per_month <= max_price)
    
    if bedrooms is not None:
        query = query.filter(models.Property.bedrooms == bedrooms)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * per_page
    properties = query.offset(offset).limit(per_page).all()
    
    return {
        "properties": properties,
        "total": total,
        "page": page,
        "per_page": per_page
    }

@router.get("/{property_id}", response_model=schemas_property.PropertyResponse)
def get_property(property_id: int, db: Session = Depends(get_db)):
    """Get a specific property by ID"""
    property = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    return property

@router.put("/{property_id}", response_model=schemas_property.PropertyResponse)
def update_property(
    property_id: int,
    property_data: schemas_property.PropertyUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN, models.UserRole.OWNER]))
):
    """Update a property (Admin/Owner only)"""
    property = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Update only provided fields
    update_data = property_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(property, key, value)
    
    db.commit()
    db.refresh(property)
    return property

@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_property(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN]))
):
    """Delete a property (Admin only)"""
    property = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    db.delete(property)
    db.commit()
    return None