from sqlalchemy.orm import Session
from sqlalchemy import func
import models
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict

class MLDataService:
    
    @staticmethod
    def collect_retention_features(db: Session) -> pd.DataFrame:
        """
        Collect features for retention prediction model
        """
        
        # Get all users with their booking history
        users = db.query(models.User).filter(
            models.User.role == models.UserRole.TENANT
        ).all()
        
        data = []
        
        for user in users:
            # Get user's bookings
            bookings = db.query(models.Booking).filter(
                models.Booking.user_id == user.id
            ).all()
            
            if not bookings:
                continue
            
            # Calculate features
            features = MLDataService._calculate_user_features(db, user, bookings)
            data.append(features)
        
        df = pd.DataFrame(data)
        return df
    
    @staticmethod
    def _calculate_user_features(
        db: Session,
        user: models.User,
        bookings: List[models.Booking]
    ) -> Dict:
        """
        Calculate retention features for a user
        """
        
        now = datetime.utcnow()
        
        # Basic user features
        account_age_days = (now - user.created_at).days
        
        # Booking features
        total_bookings = len(bookings)
        confirmed_bookings = len([b for b in bookings if b.status == models.BookingStatus.CONFIRMED])
        cancelled_bookings = len([b for b in bookings if b.status == models.BookingStatus.CANCELLED])
        
        # Payment features
        payments = db.query(models.Payment).join(models.Booking).filter(
            models.Booking.user_id == user.id
        ).all()
        
        total_payments = len(payments)
        completed_payments = len([p for p in payments if p.status == models.PaymentStatus.COMPLETED])
        total_amount_paid = sum([p.amount for p in payments if p.status == models.PaymentStatus.COMPLETED])
        
        # Payment behavior
        late_payments = 0
        on_time_payments = 0
        
        for payment in payments:
            if payment.status == models.PaymentStatus.COMPLETED and payment.paid_at:
                booking = payment.booking
                # Consider payment late if paid after booking start date
                if payment.paid_at > booking.start_date:
                    late_payments += 1
                else:
                    on_time_payments += 1
        
        late_payment_rate = (late_payments / total_payments) if total_payments > 0 else 0.0
        
        # Booking frequency
        if len(bookings) > 1:
            booking_dates = sorted([b.created_at for b in bookings])
            intervals = [(booking_dates[i+1] - booking_dates[i]).days 
                        for i in range(len(booking_dates)-1)]
            avg_booking_interval = sum(intervals) / len(intervals) if intervals else 0
        else:
            avg_booking_interval = 0
        
        # Recency
        last_booking = max(bookings, key=lambda b: b.created_at)
        days_since_last_booking = (now - last_booking.created_at).days
        
        # Average booking length
        avg_booking_length = sum([
            (b.end_date - b.start_date).days for b in bookings
        ]) / len(bookings) if bookings else 0
        
        # Feedback features
        feedbacks = db.query(models.Feedback).filter(
            models.Feedback.user_id == user.id
        ).all()
        
        avg_rating = sum([f.rating for f in feedbacks]) / len(feedbacks) if feedbacks else 0.0
        total_feedbacks = len(feedbacks)
        
        # Cancellation rate
        cancellation_rate = (cancelled_bookings / total_bookings) if total_bookings > 0 else 0.0
        
        # Target variable: Will return (stayed for another booking)
        # Consider "retained" if user has booked in last 90 days
        retained = 1 if days_since_last_booking <= 90 else 0
        
        return {
            'user_id': user.id,
            'account_age_days': account_age_days,
            'total_bookings': total_bookings,
            'confirmed_bookings': confirmed_bookings,
            'cancelled_bookings': cancelled_bookings,
            'cancellation_rate': cancellation_rate,
            'total_payments': total_payments,
            'completed_payments': completed_payments,
            'total_amount_paid': total_amount_paid,
            'late_payments': late_payments,
            'on_time_payments': on_time_payments,
            'late_payment_rate': late_payment_rate,
            'avg_booking_interval': avg_booking_interval,
            'days_since_last_booking': days_since_last_booking,
            'avg_booking_length': avg_booking_length,
            'avg_rating': avg_rating,
            'total_feedbacks': total_feedbacks,
            'retained': retained  # Target variable
        }
    
    @staticmethod
    def export_training_data(db: Session, filepath: str = 'training_data.csv'):
        """
        Export training data to CSV for ML model
        """
        df = MLDataService.collect_retention_features(db)
        df.to_csv(filepath, index=False)
        return {
            'success': True,
            'filepath': filepath,
            'records': len(df),
            'features': list(df.columns)
        }
    
    @staticmethod
    def generate_synthetic_data(db: Session, num_records: int = 500):
        """
        Generate synthetic data for ML training (if real data is insufficient)
        """
        import random
        import numpy as np
        
        data = []
        
        for i in range(num_records):
            # Generate random but realistic features
            account_age_days = random.randint(30, 1095)  # 1 month to 3 years
            total_bookings = random.randint(1, 20)
            
            # Correlated features
            cancellation_rate = random.uniform(0, 0.5) if total_bookings > 3 else random.uniform(0, 0.8)
            cancelled_bookings = int(total_bookings * cancellation_rate)
            confirmed_bookings = total_bookings - cancelled_bookings
            
            total_payments = confirmed_bookings
            completed_payments = int(total_payments * random.uniform(0.7, 1.0))
            
            late_payment_rate = random.uniform(0, 0.4)
            late_payments = int(total_payments * late_payment_rate)
            on_time_payments = total_payments - late_payments
            
            total_amount_paid = completed_payments * random.uniform(10000, 50000)
            
            avg_booking_interval = random.randint(30, 180) if total_bookings > 1 else 0
            days_since_last_booking = random.randint(0, 365)
            avg_booking_length = random.randint(7, 90)
            
            avg_rating = random.uniform(2.5, 5.0)
            total_feedbacks = random.randint(0, total_bookings)
            
            # Target: Higher likelihood of retention if:
            # - Low cancellation rate
            # - Low late payment rate
            # - Recent activity
            # - High rating
            retention_score = (
                (1 - cancellation_rate) * 0.3 +
                (1 - late_payment_rate) * 0.2 +
                (1 - min(days_since_last_booking / 365, 1)) * 0.3 +
                (avg_rating / 5) * 0.2
            )
            
            retained = 1 if retention_score > 0.6 and random.random() > 0.2 else 0
            
            data.append ({
                'user_id': f'synthetic_{i}',
                'account_age_days': account_age_days,
                'total_bookings': total_bookings,
                'confirmed_bookings': confirmed_bookings,
                'cancelled_bookings': cancelled_bookings,
                'cancellation_rate': round(cancellation_rate, 3),
                'total_payments': total_payments,
                'completed_payments': completed_payments,
                'total_amount_paid': round(total_amount_paid, 2),
                'late_payments': late_payments,
                'on_time_payments': on_time_payments,
                'late_payment_rate': round(late_payment_rate, 3),
                'avg_booking_interval': avg_booking_interval,
                'days_since_last_booking': days_since_last_booking,
                'avg_booking_length': avg_booking_length,
                'avg_rating': round(avg_rating, 2),
                'total_feedbacks': random.randint(0, total_bookings),
                'retained': retained
            })
        
        df = pd.DataFrame(data)
        return df