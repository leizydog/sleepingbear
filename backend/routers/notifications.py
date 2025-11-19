from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
import models
import auth
from database import get_db
from services.notification_service import NotificationService
from services.ml_data_service import MLDataService

router = APIRouter(prefix="/notifications", tags=["Notifications"])

notification_service = NotificationService()

@router.post("/send-retention-alerts")
async def send_retention_alerts(
    background_tasks: BackgroundTasks,
    risk_threshold: int = 70,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN]))
):
    """
    Send retention alerts to at-risk tenants
    """
    try:
        # Get at-risk tenants
        tenants = db.query(models.User).filter(
            models.User.role == models.UserRole.TENANT
        ).all()
        
        alerts_sent = []
        
        for tenant in tenants:
            bookings = db.query(models.Booking).filter(
                models.Booking.user_id == tenant.id
            ).all()
            
            if not bookings:
                continue
            
            # Get prediction
            features = MLDataService._calculate_user_features(db, tenant, bookings)
            features_for_prediction = {k: v for k, v in features.items() 
                                      if k not in ['user_id', 'retained']}
            
            prediction = ml_service.predict_retention(features_for_prediction)
            
            if prediction['risk_score'] >= risk_threshold:
                # Send email in background
                background_tasks.add_task(
                    notification_service.send_retention_alert,
                    tenant.email,
                    tenant.full_name or tenant.username,
                    prediction['risk_score']
                )
                
                alerts_sent.append({
                    'tenant_id': tenant.id,
                    'email': tenant.email,
                    'risk_score': prediction['risk_score']
                })
        
        return {
            'success': True,
            'alerts_sent': len(alerts_sent),
            'tenants': alerts_sent
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send alerts: {str(e)}"
        )

@router.post("/send-admin-summary")
async def send_admin_summary(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN]))
):
    """
    Send daily summary to admin
    """
    try:
        # Get admin users
        admins = db.query(models.User).filter(
            models.User.role == models.UserRole.ADMIN
        ).all()
        
        # Get at-risk tenants
        tenants = db.query(models.User).filter(
            models.User.role == models.UserRole.TENANT
        ).all()
        
        at_risk_tenants = []
        
        for tenant in tenants:
            bookings = db.query(models.Booking).filter(
                models.Booking.user_id == tenant.id
            ).all()
            
            if not bookings:
                continue
            
            features = MLDataService._calculate_user_features(db, tenant, bookings)
            features_for_prediction = {k: v for k, v in features.items() 
                                      if k not in ['user_id', 'retained']}
            
            prediction = ml_service.predict_retention(features_for_prediction)
            
            if prediction['risk_level'] == 'high':
                at_risk_tenants.append({
                    'name': tenant.full_name or tenant.username,
                    'email': tenant.email,
                    'risk_score': prediction['risk_score']
                })
        
        # Send to all admins
        for admin in admins:
            background_tasks.add_task(
                notification_service.send_admin_notification,
                admin.email,
                len(at_risk_tenants),
                at_risk_tenants
            )
        
        return {
            'success': True,
            'admins_notified': len(admins),
            'at_risk_count': len(at_risk_tenants)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send admin summary: {str(e)}"
        )