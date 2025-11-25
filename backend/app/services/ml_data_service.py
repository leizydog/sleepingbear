from sqlalchemy.orm import Session
from app.models import all_models as models
from datetime import datetime
import pandas as pd
import numpy as np

class MLDataService:

    @staticmethod
    def prepare_features_for_user(db: Session, user: models.User):
        """
        Maps real DB data to the Hotel Booking Dataset schema required by the Random Forest model.
        """
        # 1. Get the user's most recent booking to predict if they will retain NEXT time
        last_booking = db.query(models.Booking).filter(
            models.Booking.user_id == user.id
        ).order_by(models.Booking.created_at.desc()).first()
        
        # If no booking history, we can't predict based on this specific model
        if not last_booking:
            return None 

        # 2. Get historical counts
        total_bookings_count = db.query(models.Booking).filter(models.Booking.user_id == user.id).count()
        
        # 3. Calculate Derived Features
        
        # Lead Time: Days between booking creation and check-in
        lead_time = (last_booking.start_date - last_booking.created_at).days
        lead_time = max(0, lead_time) # Ensure non-negative
        
        # Length of Stay
        total_stay_nights = (last_booking.end_date - last_booking.start_date).days
        total_stay_nights = max(1, total_stay_nights)
        
        # ADR (Average Daily Rate): Total Price / Nights
        # Assuming last_booking.total_price exists. If not, estimate or use 0.
        adr = 0.0
        if hasattr(last_booking, 'total_price') and last_booking.total_price:
            adr = float(last_booking.total_price) / total_stay_nights
            
        # Arrival Month (e.g., "August")
        arrival_month = last_booking.start_date.strftime("%B")
        
        # 4. Construct the dictionary matching the TRAINED MODEL'S features exactly
        # We fill missing "hotel-specific" fields with logical defaults for a condo system
        feature_data = {
            # --- Quantitative Features ---
            'lead_time': lead_time,
            'total_stay_nights': total_stay_nights,
            'stays_in_weekend_nights': total_stay_nights // 3, # Approximation
            'stays_in_week_nights': total_stay_nights - (total_stay_nights // 3),
            'adults': 1, # Default to 1 if not tracked
            'children': 0,
            'babies': 0,
            'is_repeated_guest': 1 if total_bookings_count > 1 else 0,
            'previous_cancellations': 0, # Update if you track cancellations in DB
            'previous_bookings_not_canceled': max(0, total_bookings_count - 1),
            'booking_changes': 0, # Update if you track modifications
            'adr': adr,
            'total_of_special_requests': 0, # Update if you have a requests field
            'required_car_parking_spaces': 0,
            'days_in_waiting_list': 0,
            
            # --- Categorical Features (Strings) ---
            'hotel': 'City Hotel', # Default mapping
            'arrival_date_month': arrival_month,
            'meal': 'SC', # Self Catering (common for condos)
            'country': 'PHL', # Default to Philippines
            'market_segment': 'Direct', # Since they use your app
            'distribution_channel': 'Direct',
            'reserved_room_type': 'A', # Dummy default
            'assigned_room_type': 'A', # Dummy default
            'deposit_type': 'No Deposit',
            'customer_type': 'Transient',
            'agent': 0,
            'company': 0,
        }
        
        return feature_data

    @staticmethod
    def collect_retention_features(db: Session) -> pd.DataFrame:
        """
        Batch collection for the 'predict-all' endpoint
        """
        users = db.query(models.User).filter(
            models.User.role == models.UserRole.TENANT
        ).all()
        
        data = []
        for user in users:
            features = MLDataService.prepare_features_for_user(db, user)
            if features:
                # Add user_id to track who this row belongs to (removed before prediction)
                features['user_id'] = user.id 
                data.append(features)
        
        return pd.DataFrame(data)