import schedule
import time
from sqlalchemy.orm import Session
from database import SessionLocal
from services.notification_service import NotificationService
from services.ml_data_service import MLDataService
from services.ml_prediction_service import MLPredictionService
import models
 
notification_service = NotificationService()
ml_service = MLPredictionService()

def send_daily_retention_alerts():
    """
    Send daily retention alerts to at-risk tenants
    """
    print(f"\n{'='*50}")
    print(f"Running Daily Retention Alert Task")
    print(f"Time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*50}\n")
    
    db = SessionLocal()
    
    try:
        # Get all tenant users
        tenants = db.query(models.User).filter(
            models.User.role == models.UserRole.TENANT
        ).all()
        
        alerts_sent = 0
        high_risk_tenants = []
        
        for tenant in tenants:
            bookings = db.query(models.Booking).filter(
                models.Booking.user_id == tenant.id
            ).all()
            
            if not bookings:
                continue
            
            # Calculate features and predict
            features = MLDataService._calculate_user_features(db, tenant, bookings)
            features_for_prediction = {k: v for k, v in features.items() 
                                      if k not in ['user_id', 'retained']}
            
            prediction = ml_service.predict_retention(features_for_prediction)
            
            # Send alert if high risk
            if prediction['risk_score'] >= 70:
                success = notification_service.send_retention_alert(
                    tenant.email,
                    tenant.full_name or tenant.username,
                    prediction['risk_score']
                )
                
                if success:
                    alerts_sent += 1
                
                high_risk_tenants.append({
                    'name': tenant.full_name or tenant.username,
                    'email': tenant.email,
                    'risk_score': prediction['risk_score']
                })
        
        # Send summary to admins
        admins = db.query(models.User).filter(
            models.User.role == models.UserRole.ADMIN
        ).all()
        
        for admin in admins:
            notification_service.send_admin_notification(
                admin.email,
                len(high_risk_tenants),
                high_risk_tenants
            )
        
        print(f"✅ Task completed:")
        print(f"   - Alerts sent to tenants: {alerts_sent}")
        print(f"   - Admins notified: {len(admins)}")
        print(f"   - High-risk tenants: {len(high_risk_tenants)}\n")
        
    except Exception as e:
        print(f"❌ Error in daily task: {str(e)}\n")
    finally:
        db.close()

def run_scheduler():
    """
    Run the scheduler
    """
    # Schedule daily at 9:00 AM
    schedule.every().day.at("09:00").do(send_daily_retention_alerts)
    
    print("🕐 Scheduler started")
    print("   Daily alerts scheduled for 09:00 AM")
    print("   Press Ctrl+C to stop\n")
    
    # For testing: run immediately
    # send_daily_retention_alerts()
    
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute

if __name__ == "__main__":
    run_scheduler()