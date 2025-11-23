from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional, List
import shutil
import os
import uuid
from app.models import all_models as models
from app.schemas import schemas_property
from app.core import security as auth
from app.db.session import get_db

router = APIRouter(prefix="/properties", tags=["Properties"])

# --- NEW: Image Upload Endpoint ---
@router.post("/upload")
async def upload_property_images(files: List[UploadFile] = File(...)):
    """Upload images and return URLs"""
    image_urls = []
    
    # Ensure directory exists
    upload_dir = "static/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    for file in files:
        # Generate unique filename
        file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        unique_filename = f"{uuid.uuid4()}.{file_ext}"
        file_path = f"{upload_dir}/{unique_filename}"
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Create URL (Assumes localhost for dev, update domain for prod)
        # The frontend will use this URL to display the image
        full_url = f"http://127.0.0.1:8000/{file_path}"
        image_urls.append(full_url)
        
    return {"images": image_urls}

@router.post("/", response_model=schemas_property.PropertyResponse, status_code=status.HTTP_201_CREATED)
def create_property(
    property_data: schemas_property.PropertyCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN, models.UserRole.OWNER]))
):
    """Create a new property"""
    initial_status = models.PropertyStatus.APPROVED if current_user.role == models.UserRole.ADMIN else models.PropertyStatus.PENDING
    
    data = property_data.dict()
    
    # --- FIX: Remove 'status' from data to avoid "multiple values" error ---
    if 'status' in data:
        del data['status']

    # Handle Images (Set first as thumbnail)
    if "images" in data and data["images"] and isinstance(data["images"], list):
        if len(data["images"]) > 0:
            data["image_url"] = data["images"][0]
            
    db_property = models.Property(
        **data,
        owner_id=current_user.id,
        status=initial_status
    )
    db.add(db_property)
    db.commit()
    db.refresh(db_property)
    return db_property

@router.get("/", response_model=schemas_property.PropertyListResponse)
def get_properties(
    db: Session = Depends(get_db)
):
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    bedrooms: Optional[int] = None,
    available_only: bool = False,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db)

    query = db.query(models.Property)
    
    if available_only:
        query = query.filter(models.Property.is_available == True)
    if status_filter:
        query = query.filter(models.Property.status == status_filter)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (models.Property.name.ilike(search_term)) |
            (models.Property.address.ilike(search_term))
        )
    
    total = query.count()
    offset = (page - 1) * per_page
    properties = query.order_by(models.Property.created_at.desc()).offset(offset).limit(per_page).all()
    
    return {"properties": properties, "total": total, "page": page, "per_page": per_page}

@router.get("/{property_id}", response_model=schemas_property.PropertyResponse)
def get_property(property_id: int, db: Session = Depends(get_db)):
    property = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    return property

@router.put("/{property_id}/status", response_model=schemas_property.PropertyResponse)
def update_property_status(
    property_id: int,
    status_update: str = Query(..., regex="^(approved|rejected|pending)$"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN]))
):
    property = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not property: raise HTTPException(status_code=404, detail="Property not found")
    property.status = status_update
    db.commit()
    db.refresh(property)
    return property

@router.put("/{property_id}", response_model=schemas_property.PropertyResponse)
def update_property(
    property_id: int,
    property_data: schemas_property.PropertyUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN, models.UserRole.OWNER]))
):
    property = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not property: raise HTTPException(status_code=404, detail="Property not found")
    
    if current_user.role == models.UserRole.OWNER and property.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = property_data.dict(exclude_unset=True)
    if 'status' in update_data: del update_data['status']

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
    property = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not property: raise HTTPException(status_code=404, detail="Property not found")
    db.delete(property)
    db.commit()
    return None