import joblib
import pandas as pd
import numpy as np
import os
from datetime import datetime

print(f"🔍 Current working directory: {os.getcwd()}")
print(f"🔍 Files in current dir: {os.listdir('.')}")
print(f"🔍 Checking if 'ml' exists: {os.path.exists('ml')}")
print(f"🔍 Checking if 'app' exists: {os.path.exists('app')}")

class MLPredictionService:
    def __init__(self):
        # ✅ FIX: Use relative path from where FastAPI runs
        # When running "uvicorn main:app" from backend/, the cwd is already backend/
        self.model_dir = "ml/models"  # NOT "backend/ml/models"
        
        self.model_path = os.path.join(self.model_dir, "random_forest_model.pkl")
        self.encoders_path = os.path.join(self.model_dir, "label_encoders.pkl")
        
        self.model = None
        self.label_encoders = None
        self._load_artifacts()

    def _load_artifacts(self):
        """Load the trained model and label encoders"""
        try:
            print(f"🔍 Looking for model at: {os.path.abspath(self.model_path)}")
            
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
                print(f"✅ ML Model loaded from {self.model_path}")
            else:
                print(f"❌ Model file not found at: {os.path.abspath(self.model_path)}")
            
            if os.path.exists(self.encoders_path):
                self.label_encoders = joblib.load(self.encoders_path)
                print(f"✅ Label Encoders loaded from {self.encoders_path}")
            else:
                print(f"❌ Encoders file not found at: {os.path.abspath(self.encoders_path)}")
                
        except Exception as e:
            print(f"❌ Error loading ML artifacts: {str(e)}")
            import traceback
            traceback.print_exc()

    def predict_retention(self, raw_data: dict) -> dict:
        """
        Preprocesses raw DB data and generates a prediction.
        """
        if not self.model or not self.label_encoders:
            return {"error": "Model not loaded", "risk_score": 0, "will_retain": True}

        try:
            # 1. Convert dict to DataFrame
            df = pd.DataFrame([raw_data])
            
            # 2. FEATURE ENGINEERING (Must match your training script)
            
            # Total Stay Duration
            if 'total_stay_nights' not in df.columns:
                df['total_stay_nights'] = df.get('stays_in_weekend_nights', 0) + df.get('stays_in_week_nights', 1)

            # Booking Lead Time Categories
            lead_val = df['lead_time'].iloc[0]
            if lead_val <= 7: cat = 'Last_Minute'
            elif lead_val <= 30: cat = 'Short_Term'
            elif lead_val <= 90: cat = 'Medium_Term'
            else: cat = 'Long_Term'
            df['lead_time_category'] = cat

            # ADR Per Person
            adults = df.get('adults', 1).iloc[0]
            children = df.get('children', 0).iloc[0]
            df['adr_per_person'] = df['adr'] / (adults + children + 0.1)

            # Boolean Flags
            df['has_special_requests'] = (df['total_of_special_requests'] > 0).astype(int)
            df['has_booking_changes'] = (df['booking_changes'] > 0).astype(int)
            df['is_repeated_guest'] = df['is_repeated_guest'].astype(int)
            
            # Previous Bookings
            df['previous_bookings_total'] = df.get('previous_cancellations', 0) + df.get('previous_bookings_not_canceled', 0)

            # Guest Type
            def get_guest_type(row):
                if row.get('children', 0) > 0 or row.get('babies', 0) > 0: return 'Family'
                if row.get('adults', 1) >= 2: return 'Couple'
                return 'Single'
            df['guest_type'] = df.apply(get_guest_type, axis=1)

            # Deposit Given
            df['deposit_given'] = (df['deposit_type'] != 'No Deposit').astype(int)
            
            # 3. FEATURE SELECTION (Must match training)
            selected_features = [
                'lead_time', 'total_stay_nights', 'is_repeated_guest',
                'previous_bookings_total', 'booking_changes',
                'adr', 'adr_per_person', 'deposit_given',
                'total_of_special_requests', 'has_special_requests',
                'adults', 'children', 'babies',
                # Categorical
                'hotel', 'arrival_date_month', 'meal', 'market_segment',
                'distribution_channel', 'customer_type', 'guest_type'
            ]
            
            # Ensure all columns exist
            for col in selected_features:
                if col not in df.columns:
                    df[col] = 0 if col not in ['hotel', 'meal', 'market_segment', 'distribution_channel', 'customer_type', 'guest_type'] else 'Undefined'

            X = df[selected_features].copy()

            # 4. ENCODING
            categorical_cols = ['hotel', 'arrival_date_month', 'meal', 'market_segment',
                               'distribution_channel', 'customer_type', 'guest_type']
                               
            for col in categorical_cols:
                le = self.label_encoders.get(col)
                if le:
                    val = str(X[col].iloc[0])
                    if val in le.classes_:
                        X[col] = le.transform([val])[0]
                    else:
                        X[col] = 0  # Unknown category

            # 5. PREDICTION
            prediction_class = self.model.predict(X)[0]
            probabilities = self.model.predict_proba(X)[0]
            
            churn_prob = probabilities[1]
            retain_prob = probabilities[0]
            
            risk_score = int(churn_prob * 100)
            
            return {
                'will_retain': bool(prediction_class == 0),
                'churn_probability': float(churn_prob),
                'retention_probability': float(retain_prob),
                'risk_score': risk_score,
                'risk_level': 'High' if risk_score > 70 else 'Medium' if risk_score > 40 else 'Low',
                'recommendation': self._get_recommendation(risk_score)
            }
            
        except Exception as e:
            print(f"❌ ERROR in predict_retention: {str(e)}")
            import traceback
            traceback.print_exc()
            return {"error": str(e), "risk_score": 0, "will_retain": True}

    def _get_recommendation(self, risk_score):
        if risk_score > 70:
            return "Urgent: Contact tenant. Offer discount or loyalty perk."
        elif risk_score > 40:
            return "Monitor: Send automated engagement email."
        return "Safe: Tenant likely to renew."