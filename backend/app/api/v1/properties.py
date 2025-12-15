from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Request, Body
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

# --- HELPER: Dynamic URL Resolution ---
def resolve_image_urls(prop, base_url: str):
    """
    Converts relative paths (static/uploads/...) to full URLs based on the current server IP.
    Ignores external URLs (e.g., https://unsplash.com/...).
    """
    if not prop:
        return prop
    
    # 0. Fallback: If image_url is missing but images list has data, use the first image
    if not prop.image_url and prop.images and len(prop.images) > 0:
        prop.image_url = prop.images[0]

    # 1. Handle Thumbnail
    if prop.image_url and not prop.image_url.startswith("http"):
        prop.image_url = f"{base_url}/{prop.image_url}"
        
    # 2. Handle Image List
    if prop.images:
        resolved_images = []
        for img in prop.images:
            if img and not img.startswith("http"):
                resolved_images.append(f"{base_url}/{img}")
            else:
                resolved_images.append(img)
        prop.images = resolved_images

    # 3. Handle GCash QR Code Image
    if hasattr(prop, 'gcash_qr_image_url') and prop.gcash_qr_image_url and not prop.gcash_qr_image_url.startswith("http"):
        prop.gcash_qr_image_url = f"{base_url}/{prop.gcash_qr_image_url}"
        
    return prop

# --- UPDATED: Image Upload Endpoint (Using Cloudinary) ---
@router.post("/upload")
async def upload_property_images(files: List[UploadFile] = File(...)):
    """
    Upload images to Cloudinary and return the URLs.
    """
    from app.core.cloudinary_upload import upload_image_to_cloudinary
    
    image_urls = []
    
    for file in files:
        try:
            # Upload to Cloudinary
            url = await upload_image_to_cloudinary(file, folder="sleepingbear/properties")
            image_urls.append(url)
        except Exception as e:
            print(f"Upload failed for {file.filename}: {e}")
            # Continue with other files even if one fails
            continue
            
    return {"images": image_urls}

@router.post("/", response_model=schemas_property.PropertyResponse, status_code=status.HTTP_201_CREATED)
def create_property(
    property_data: schemas_property.PropertyCreate,
    request: Request, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN, models.UserRole.OWNER, models.UserRole.TENANT]))
):
    """Create a new property"""
    data = property_data.dict()
    
    # ✅ FIX: Use enum value for proper database comparison
    # Force status to PENDING so Admins must approve it
    data['status'] = models.PropertyStatus.PENDING

    # Handle Images (Set first as thumbnail)
    if "images" in data and data["images"] and isinstance(data["images"], list):
        if len(data["images"]) > 0:
            data["image_url"] = data["images"][0]
            
    db_property = models.Property(
        **data,
        owner_id=current_user.id
    )
    db.add(db_property)
    db.commit()
    db.refresh(db_property)
    
    base_url = str(request.base_url).rstrip("/")
    return resolve_image_urls(db_property, base_url)

# Get Properties Owned by Current User
@router.get("/my-listings", response_model=List[schemas_property.PropertyResponse])
def get_my_listings(
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    properties = db.query(models.Property).filter(models.Property.owner_id == current_user.id).order_by(models.Property.created_at.desc()).all()
    
    base_url = str(request.base_url).rstrip("/")
    for p in properties:
        resolve_image_urls(p, base_url)
        
    return properties

@router.get("/", response_model=schemas_property.PropertyListResponse)
def get_properties(
    request: Request, 
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    bedrooms: Optional[int] = None,
    available_only: bool = False,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Property)
    
    # ✅ FIX: Default to APPROVED if no filter provided. Pass "all" to see everything.
    if status_filter is None:
        query = query.filter(models.Property.status == models.PropertyStatus.APPROVED)
    elif status_filter.lower() == "pending":
        query = query.filter(models.Property.status == models.PropertyStatus.PENDING)
    elif status_filter.lower() == "approved":
        query = query.filter(models.Property.status == models.PropertyStatus.APPROVED)
    elif status_filter.lower() == "rejected":
        query = query.filter(models.Property.status == models.PropertyStatus.REJECTED)
    # If status_filter is "all", don't add any status filter

    if available_only:
        query = query.filter(models.Property.is_available == True)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (models.Property.name.ilike(search_term)) |
            (models.Property.address.ilike(search_term))
        )
    
    if min_price is not None:
        query = query.filter(models.Property.price_per_month >= min_price)
    if max_price is not None:
        query = query.filter(models.Property.price_per_month <= max_price)
    if bedrooms is not None:
        query = query.filter(models.Property.bedrooms >= bedrooms)
    
    total = query.count()
    offset = (page - 1) * per_page
    properties = query.order_by(models.Property.created_at.desc()).offset(offset).limit(per_page).all()
    
    base_url = str(request.base_url).rstrip("/")
    for p in properties:
        resolve_image_urls(p, base_url)
    
    return {"properties": properties, "total": total, "page": page, "per_page": per_page}

@router.get("/{property_id}", response_model=schemas_property.PropertyResponse)
def get_property(
    property_id: int, 
    request: Request, 
    db: Session = Depends(get_db)
):
    property = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    base_url = str(request.base_url).rstrip("/")
    return resolve_image_urls(property, base_url)

@router.put("/{property_id}/status", response_model=schemas_property.PropertyResponse)
def update_property_status(
    property_id: int,
    request: Request,
    payload: dict = Body(...), # ✅ Changed to Body: Expects {"status": "approved"}
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN]))
):
    status_update = payload.get("status")
    if not status_update or status_update not in ["approved", "rejected", "pending"]:
         raise HTTPException(status_code=400, detail="Invalid status")

    property = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not property: raise HTTPException(status_code=404, detail="Property not found")
    
    # ✅ FIX: Map string to enum for proper database storage
    status_enum_map = {
        "pending": models.PropertyStatus.PENDING,
        "approved": models.PropertyStatus.APPROVED,
        "rejected": models.PropertyStatus.REJECTED
    }
    property.status = status_enum_map[status_update]
    db.commit()
    db.refresh(property)
    
    base_url = str(request.base_url).rstrip("/")
    return resolve_image_urls(property, base_url)

@router.put("/{property_id}", response_model=schemas_property.PropertyResponse)
def update_property(
    property_id: int,
    property_data: schemas_property.PropertyUpdate,
    request: Request,
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
    
    base_url = str(request.base_url).rstrip("/")
    return resolve_image_urls(property, base_url)

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