from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, and_
from datetime import datetime, timedelta
from typing import Optional
from app.models import all_models as models
from app.schemas import schemas_reports
from app.core import security as auth
from app.db.session import get_db

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/dashboard", response_model=schemas_reports.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN, models.UserRole.OWNER]))
):
    """Get dashboard statistics (Admin/Owner only)"""
    
    # Get current month start
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)
    
    # Total properties
    total_properties = db.query(models.Property).count()
    available_properties = db.query(models.Property).filter(
        models.Property.is_available == True
    ).count()
    
    # Total users
    total_users = db.query(models.User).count()
    
    # Bookings
    total_bookings = db.query(models.Booking).count()
    confirmed_bookings = db.query(models.Booking).filter(
        models.Booking.status == models.BookingStatus.CONFIRMED
    ).count()
    pending_bookings = db.query(models.Booking).filter(
        models.Booking.status == models.BookingStatus.PENDING
    ).count()
    
    # Revenue
    total_revenue = db.query(
        func.sum(models.Payment.amount)
    ).filter(
        models.Payment.status == models.PaymentStatus.COMPLETED
    ).scalar() or 0.0
    
    revenue_this_month = db.query(
        func.sum(models.Payment.amount)
    ).filter(
        models.Payment.status == models.PaymentStatus.COMPLETED,
        models.Payment.paid_at >= month_start
    ).scalar() or 0.0
    
    bookings_this_month = db.query(models.Booking).filter(
        models.Booking.created_at >= month_start
    ).count()
    
    return {
        "total_properties": total_properties,
        "available_properties": available_properties,
        "total_users": total_users,
        "total_bookings": total_bookings,
        "confirmed_bookings": confirmed_bookings,
        "pending_bookings": pending_bookings,
        "total_revenue": total_revenue,
        "revenue_this_month": revenue_this_month,
        "bookings_this_month": bookings_this_month,
    }

@router.get("/revenue", response_model=schemas_reports.RevenueReport)
def get_revenue_report(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN, models.UserRole.OWNER]))
):
    """Get revenue report for a period"""
    
    # Default to last 30 days
    if not end_date:
        end_date = datetime.utcnow()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    # Query payments in period
    payments_query = db.query(models.Payment).filter(
        models.Payment.status == models.PaymentStatus.COMPLETED,
        models.Payment.paid_at >= start_date,
        models.Payment.paid_at <= end_date
    )
    
    total_revenue = db.query(
        func.sum(models.Payment.amount)
    ).filter(
        models.Payment.status == models.PaymentStatus.COMPLETED,
        models.Payment.paid_at >= start_date,
        models.Payment.paid_at <= end_date
    ).scalar() or 0.0
    
    # Query bookings in period
    bookings_query = db.query(models.Booking).filter(
        models.Booking.created_at >= start_date,
        models.Booking.created_at <= end_date
    )
    
    total_bookings = bookings_query.count()
    confirmed_bookings = bookings_query.filter(
        models.Booking.status == models.BookingStatus.CONFIRMED
    ).count()
    pending_bookings = bookings_query.filter(
        models.Booking.status == models.BookingStatus.PENDING
    ).count()
    cancelled_bookings = bookings_query.filter(
        models.Booking.status == models.BookingStatus.CANCELLED
    ).count()
    
    average_booking_value = total_revenue / total_bookings if total_bookings > 0 else 0.0
    
    return {
        "total_revenue": total_revenue,
        "total_bookings": total_bookings,
        "confirmed_bookings": confirmed_bookings,
        "pending_bookings": pending_bookings,
        "cancelled_bookings": cancelled_bookings,
        "average_booking_value": average_booking_value,
        "period_start": start_date,
        "period_end": end_date,
    }

@router.get("/occupancy")
def get_occupancy_report(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN, models.UserRole.OWNER]))
):
    """Get occupancy report by property"""
    
    # Default to last 30 days
    if not end_date:
        end_date = datetime.utcnow()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    total_days = (end_date - start_date).days
    
    properties = db.query(models.Property).all()
    report = []
    
    for property in properties:
        # Get bookings for this property in the period
        bookings = db.query(models.Booking).filter(
            models.Booking.property_id == property.id,
            models.Booking.status.in_([models.BookingStatus.CONFIRMED, models.BookingStatus.COMPLETED]),
            models.Booking.start_date <= end_date,
            models.Booking.end_date >= start_date
        ).all()
        
        # Calculate booked days
        booked_days = 0
        for booking in bookings:
            overlap_start = max(booking.start_date, start_date)
            overlap_end = min(booking.end_date, end_date)
            booked_days += (overlap_end - overlap_start).days
        
        # Calculate revenue
        revenue = db.query(
            func.sum(models.Payment.amount)
        ).join(models.Booking).filter(
            models.Booking.property_id == property.id,
            models.Payment.status == models.PaymentStatus.COMPLETED,
            models.Payment.paid_at >= start_date,
            models.Payment.paid_at <= end_date
        ).scalar() or 0.0
        
        occupancy_rate = (booked_days / total_days * 100) if total_days > 0 else 0.0
        
        report.append({
            "property_id": property.id,
            "property_name": property.name,
            "total_days_in_period": total_days,
            "booked_days": booked_days,
            "occupancy_rate": round(occupancy_rate, 2),
            "revenue": revenue,
        })
    
    return report

@router.get("/monthly-revenue")
def get_monthly_revenue(
    months: int = Query(12, ge=1, le=24),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN, models.UserRole.OWNER]))
):
    """Get monthly revenue for the last N months"""
    
    results = db.query(
        extract('year', models.Payment.paid_at).label('year'),
        extract('month', models.Payment.paid_at).label('month'),
        func.sum(models.Payment.amount).label('revenue'),
        func.count(models.Payment.id).label('bookings')
    ).filter(
        models.Payment.status == models.PaymentStatus.COMPLETED,
        models.Payment.paid_at.isnot(None)
    ).group_by('year', 'month').order_by('year', 'month').all()
    
    # Format results
    month_names = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]
    
    formatted_results = []
    for result in results[-months:]:  # Get last N months
        formatted_results.append({
            "month": month_names[int(result.month) - 1],
            "year": int(result.year),
            "revenue": float(result.revenue),
            "bookings": result.bookings,
        })
    
    return formatted_results

@router.get("/property-performance")
def get_property_performance(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN, models.UserRole.OWNER]))
):
    """Get performance metrics for all properties"""
    
    properties = db.query(models.Property).all()
    performance = []
    
    for property in properties:
        # Total bookings
        total_bookings = db.query(models.Booking).filter(
            models.Booking.property_id == property.id
        ).count()
        
        # Total revenue
        total_revenue = db.query(
            func.sum(models.Payment.amount)
        ).join(models.Booking).filter(
            models.Booking.property_id == property.id,
            models.Payment.status == models.PaymentStatus.COMPLETED
        ).scalar() or 0.0
        
        # Average rating (if feedback exists)
        avg_rating = db.query(
            func.avg(models.Feedback.rating)
        ).filter(
            models.Feedback.property_id == property.id
        ).scalar()
        
        # Occupancy rate (last 90 days)
        ninety_days_ago = datetime.utcnow() - timedelta(days=90)
        booked_days = 0
        
        bookings = db.query(models.Booking).filter(
            models.Booking.property_id == property.id,
            models.Booking.status.in_([models.BookingStatus.CONFIRMED, models.BookingStatus.COMPLETED]),
            models.Booking.start_date <= datetime.utcnow(),
            models.Booking.end_date >= ninety_days_ago
        ).all()
        
        for booking in bookings:
            overlap_start = max(booking.start_date, ninety_days_ago)
            overlap_end = min(booking.end_date, datetime.utcnow())
            booked_days += (overlap_end - overlap_start).days
        
        occupancy_rate = (booked_days / 90 * 100)
        
        performance.append({
            "property_id": property.id,
            "property_name": property.name,
            "total_bookings": total_bookings,
            "total_revenue": total_revenue,
            "average_rating": float(avg_rating) if avg_rating else None,
            "occupancy_rate": round(occupancy_rate, 2),
        })
    
    # Sort by revenue
    performance.sort(key=lambda x: x['total_revenue'], reverse=True)
    
    return performance

@router.get("/export/revenue")
def export_revenue_report(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN]))
):
    """Export revenue report as CSV"""
    from fastapi.responses import StreamingResponse
    import io
    import csv
    
    # Default to last 30 days
    if not end_date:
        end_date = datetime.utcnow()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    # Query payments
    payments = db.query(models.Payment).join(models.Booking).filter(
        models.Payment.status == models.PaymentStatus.COMPLETED,
        models.Payment.paid_at >= start_date,
        models.Payment.paid_at <= end_date
    ).all()
    
    # Create CSV
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        'Payment ID', 'Booking ID', 'Amount', 'Payment Method',
        'Transaction ID', 'Paid At', 'Receipt Number'
    ])
    
    for payment in payments:
        writer.writerow([
            payment.id,
            payment.booking_id,
            payment.amount,
            payment.payment_method,
            payment.transaction_id or 'N/A',
            payment.paid_at.strftime('%Y-%m-%d %H:%M:%S'),
            payment.receipt_number or 'N/A',
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=revenue_report_{start_date.date()}_to_{end_date.date()}.csv"
        }
    )