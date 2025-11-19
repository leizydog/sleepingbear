from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime
from typing import List
import models
import schemas_booking
import schemas_property
from schemas import UserResponse
import auth
from database import get_db
from services.audit_service import AuditService
from fastapi import Request

router = APIRouter(prefix="/bookings", tags=["Bookings"])

def calculate_total_amount(property_price: float, start_date: datetime, end_date: datetime) -> float:
    """Calculate total amount based on monthly rate"""
    days = (end_date - start_date).days
    months = days / 30  # Approximate months
    return round(property_price * months, 2)

def check_availability(db: Session, property_id: int, start_date: datetime, end_date: datetime, exclude_booking_id: int = None) -> bool:
    """Check if property is available for the given date range"""
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
    
    return query.count() == 0

@router.post("/check-availability", response_model=schemas_booking.AvailabilityResponse)
def check_property_availability(
    availability_data: schemas_booking.AvailabilityCheck,
    db: Session = Depends(get_db)
):
    """Check if a property is available for booking"""
    # Check if property exists
    property = db.query(models.Property).filter(models.Property.id == availability_data.property_id).first()
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    if not property.is_available:
        return {
            "available": False,
            "message": "Property is not currently available for booking"
        }
    
    is_available = check_availability(
        db,
        availability_data.property_id,
        availability_data.start_date,
        availability_data.end_date
    )
    
    if is_available:
        return {
            "available": True,
            "message": "Property is available for the selected dates"
        }
    else:
        return {
            "available": False,
            "message": "Property is already booked for the selected dates"
        }

@router.post("/", response_model=schemas_booking.BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_data: schemas_booking.BookingCreate,
    request: Request, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Create a new booking"""
    # Check if property exists
    property = db.query(models.Property).filter(models.Property.id == booking_data.property_id).first()
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    if not property.is_available:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Property is not available for booking"
        )
    
    # Check availability
    if not check_availability(db, booking_data.property_id, booking_data.start_date, booking_data.end_date):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Property is not available for the selected dates"
        )
    
    # Calculate total amount
    total_amount = calculate_total_amount(
        property.price_per_month,
        booking_data.start_date,
        booking_data.end_date
    )
    
    # Create booking
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
    return db_booking

    AuditService.log(
        db=db,
        action=models.AuditAction.BOOKING,
        user_id=current_user.id,
        entity_type="booking",
        entity_id=db_booking.id,
        description=f"Created booking for property #{booking_data.property_id}",
        metadata={
            "property_id": booking_data.property_id,
            "start_date": booking_data.start_date.isoformat(),
            "end_date": booking_data.end_date.isoformat(),
            "amount": total_amount
        },
        request=request
    )
    return db_booking

@router.get("/", response_model=List[schemas_booking.BookingResponse])
def get_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get all bookings (Admin sees all, users see their own)"""
    if current_user.role == models.UserRole.ADMIN:
        bookings = db.query(models.Booking).all()
    else:
        bookings = db.query(models.Booking).filter(models.Booking.user_id == current_user.id).all()
    
    return bookings

@router.get("/my-bookings", response_model=List[schemas_booking.BookingResponse])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get current user's bookings"""
    bookings = db.query(models.Booking).filter(
        models.Booking.user_id == current_user.id
    ).order_by(models.Booking.created_at.desc()).all()
    
    return bookings

@router.get("/{booking_id}", response_model=schemas_booking.BookingResponse)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get a specific booking"""
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
            detail="Not authorized to view this booking"
        )
    
    return booking

@router.put("/{booking_id}", response_model=schemas_booking.BookingResponse)
def update_booking_status(
    booking_id: int,
    booking_update: schemas_booking.BookingUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN]))
):
    """Update booking status (Admin only)"""
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
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
    """Cancel a booking"""
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
            detail="Not authorized to cancel this booking"
        )
    
    # Only pending or confirmed bookings can be cancelled
    if booking.status not in [models.BookingStatus.PENDING, models.BookingStatus.CONFIRMED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending or confirmed bookings can be cancelled"
        )
    
    booking.status = models.BookingStatus.CANCELLED
    db.commit()
    return None