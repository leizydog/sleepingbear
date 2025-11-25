from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime
from typing import List
from app.models import all_models as models
from app.schemas import schemas_booking
from app.core import security as auth
from app.db.session import get_db
from app.services.audit_service import AuditService
import math

router = APIRouter(prefix="/bookings", tags=["Bookings"])

# --- HELPER: Resolve URLs (Duplicate from properties.py to avoid circular imports) ---
def resolve_image_urls(prop, base_url: str):
    if not prop: return prop
    
    # Thumbnail
    if prop.image_url and not prop.image_url.startswith("http"):
        prop.image_url = f"{base_url}/{prop.image_url}"
        
    # Images List
    if prop.images:
        resolved = []
        for img in prop.images:
             if img and not img.startswith("http"): resolved.append(f"{base_url}/{img}")
             else: resolved.append(img)
        prop.images = resolved

    # ✅ QR Code Resolution
    if hasattr(prop, 'gcash_qr_image_url') and prop.gcash_qr_image_url and not prop.gcash_qr_image_url.startswith("http"):
        prop.gcash_qr_image_url = f"{base_url}/{prop.gcash_qr_image_url}"
        
    return prop

def calculate_total_amount(property_price: float, start_date: datetime, end_date: datetime) -> float:
    delta = end_date - start_date
    days = delta.days
    if days <= 0: months = 1
    else: months = math.ceil(days / 30)
    return round(property_price * months, 2)

def check_availability(db: Session, property_id: int, start_date: datetime, end_date: datetime, exclude_booking_id: int = None) -> bool:
    print(f"\n--- Checking Availability for Property {property_id} ---")
    print(f"Request: {start_date} to {end_date}")

    query = db.query(models.Booking).filter(
        models.Booking.property_id == property_id,
        models.Booking.status.in_([models.BookingStatus.PENDING, models.BookingStatus.CONFIRMED]),
        or_(
            and_(models.Booking.start_date <= start_date, models.Booking.end_date > start_date),
            and_(models.Booking.start_date < end_date, models.Booking.end_date >= end_date),
            and_(models.Booking.start_date >= start_date, models.Booking.end_date <= end_date)
        )
    )
    
    if exclude_booking_id:
        query = query.filter(models.Booking.id != exclude_booking_id)
    
    conflicts = query.all()
    if conflicts:
        print(f"❌ CONFLICT: Found {len(conflicts)} blocking bookings.")
        return False
        
    print("✅ No conflicts. Dates are free.")
    return True

@router.get("/property/{property_id}/occupied", response_model=List[schemas_booking.BookingBase])
def get_property_occupied_dates(property_id: int, db: Session = Depends(get_db)):
    return db.query(models.Booking).filter(
        models.Booking.property_id == property_id,
        models.Booking.status.in_([models.BookingStatus.PENDING, models.BookingStatus.CONFIRMED])
    ).all()

@router.post("/check-availability", response_model=schemas_booking.AvailabilityResponse)
def check_property_availability(availability_data: schemas_booking.AvailabilityCheck, db: Session = Depends(get_db)):
    property = db.query(models.Property).filter(models.Property.id == availability_data.property_id).first()
    if not property: raise HTTPException(status_code=404, detail="Property not found")
    if not property.is_available: return {"available": False, "message": "Property is not currently available for booking"}
    
    is_available = check_availability(db, availability_data.property_id, availability_data.start_date, availability_data.end_date)
    
    if is_available: return {"available": True, "message": "Property is available"}
    else: return {"available": False, "message": "Dates overlap with an existing booking"}

@router.post("/", response_model=schemas_booking.BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_data: schemas_booking.BookingCreate,
    request: Request, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    property = db.query(models.Property).filter(models.Property.id == booking_data.property_id).first()
    if not property: raise HTTPException(status_code=404, detail="Property not found")
    if not property.is_available: raise HTTPException(status_code=400, detail="Property is disabled")
    
    if not check_availability(db, booking_data.property_id, booking_data.start_date, booking_data.end_date):
        raise HTTPException(status_code=400, detail="These dates are already booked. Please choose other dates.")
    
    total_amount = calculate_total_amount(property.price_per_month, booking_data.start_date, booking_data.end_date)
    
    db_booking = models.Booking(
        user_id=current_user.id,
        property_id=booking_data.property_id,
        start_date=booking_data.start_date,
        end_date=booking_data.end_date,
        total_amount=total_amount,
        status=models.BookingStatus.PENDING
    )
    
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)

    try:
        AuditService.log(
            db=db,
            action=models.AuditAction.BOOKING,
            user_id=current_user.id,
            entity_type="booking",
            entity_id=db_booking.id,
            description=f"Created booking #{db_booking.id}",
            metadata={"amount": total_amount},
            request=request
        )
    except:
        pass

    return db_booking

# ✅ NEW: Get Bookings RECEIVED by Owner (for their properties)
@router.get("/owner-bookings", response_model=List[schemas_booking.BookingResponse])
def get_owner_bookings(
    request: Request, # Added request to resolve URLs
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    bookings = db.query(models.Booking).join(models.Property).filter(
        models.Property.owner_id == current_user.id
    ).order_by(models.Booking.created_at.desc()).all()

    # Resolve property URLs for each booking
    base_url = str(request.base_url).rstrip("/")
    for b in bookings:
        if b.property:
            resolve_image_urls(b.property, base_url)
            
    return bookings

@router.get("/", response_model=List[schemas_booking.BookingResponse])
def get_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role == models.UserRole.ADMIN:
        return db.query(models.Booking).all()
    return db.query(models.Booking).filter(models.Booking.user_id == current_user.id).all()

@router.get("/my-bookings", response_model=List[schemas_booking.BookingResponse])
def get_my_bookings(
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    bookings = db.query(models.Booking).filter(
        models.Booking.user_id == current_user.id
    ).order_by(models.Booking.created_at.desc()).all()
    
    # Resolve URLs
    base_url = str(request.base_url).rstrip("/")
    for b in bookings:
        if b.property:
            resolve_image_urls(b.property, base_url)
            
    return bookings

@router.get("/{booking_id}", response_model=schemas_booking.BookingResponse)
def get_booking(
    booking_id: int,
    request: Request, # ✅ Needed for resolution
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking: raise HTTPException(status_code=404, detail="Not found")
    
    # ✅ Resolve URLs
    if booking.property:
        base_url = str(request.base_url).rstrip("/")
        resolve_image_urls(booking.property, base_url)
        
    return booking

@router.put("/{booking_id}", response_model=schemas_booking.BookingResponse)
def update_booking_status(
    booking_id: int,
    booking_update: schemas_booking.BookingUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN, models.UserRole.OWNER]))
):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking: raise HTTPException(status_code=404, detail="Not found")
    
    if booking_update.status:
        booking.status = booking_update.status
    
    db.commit()
    db.refresh(booking)
    return booking

@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking: raise HTTPException(status_code=404, detail="Not found")
    
    booking.status = models.BookingStatus.CANCELLED
    db.commit()
    return None