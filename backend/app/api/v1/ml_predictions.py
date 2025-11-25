from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.models import all_models as models
from app.core import security as auth
from app.db.session import get_db
from app.services.ml_prediction_service import MLPredictionService
from app.services.ml_data_service import MLDataService
from pydantic import BaseModel

router = APIRouter(prefix="/ml-predictions", tags=["ML Predictions"])

# Initialize ML service
ml_service = MLPredictionService()

class PredictionRequest(BaseModel):
    user_id: int

class PredictionResponse(BaseModel):
    user_id: int
    username: str
    will_retain: bool
    retention_probability: Optional[float]
    churn_probability: Optional[float]
    risk_score: int
    risk_level: str
    recommendation: str
    features_used: Dict[str, Any]

@router.get("/model-info")
def get_model_info(
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN]))
):
    """Get information about the deployed model"""
    try:
        return ml_service.get_model_info() if hasattr(ml_service, 'get_model_info') else {"status": "active"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get model info: {str(e)}"
        )

@router.post("/predict", response_model=PredictionResponse)
def predict_retention(self, raw_data: dict) -> dict:
    """
    Preprocesses raw DB data and generates a prediction.
    """
    # ✅ ADD THIS DEBUG LOGGING
    print(f"🔍 DEBUG: Starting prediction with data: {list(raw_data.keys())}")
    
    if not self.model or not self.label_encoders:
        error_msg = "Model not loaded"
        print(f"❌ ERROR: {error_msg}")
        return {"error": error_msg, "risk_score": 0, "will_retain": True}
    try:
        # Get user
        user = db.query(models.User).filter(models.User.id == request.user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if user.role != models.UserRole.TENANT:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only predict retention for tenant users"
            )
        
        # ✅ UPDATED: Call the new Data Service method
        # This maps the DB data to the features required by your Random Forest model
        features = MLDataService.prepare_features_for_user(db, user)
        
        if not features:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient data: Tenant needs at least one booking history to generate a prediction."
            )
        
        # Make prediction
        prediction = ml_service.predict_retention(features)
        
        return {
            'user_id': user.id,
            'username': user.username,
            'will_retain': prediction['will_retain'],
            'retention_probability': prediction['retention_probability'],
            'churn_probability': prediction['churn_probability'],
            'risk_score': prediction['risk_score'],
            'risk_level': prediction['risk_level'],
            'recommendation': prediction['recommendation'],
            'features_used': features
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ ERROR in predict_retention: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": str(e), "risk_score": 0, "will_retain": True}

# Replace your predict_all_tenants function in ml_predictions.py with this fixed version:

@router.get("/predict-all")
def predict_all_tenants(
    risk_level: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN, models.UserRole.OWNER]))
):
    """
    Predict retention for all tenants
    Filter by risk level: 'high', 'medium', 'low'
    """
    try:
        # Get all tenant users
        tenants = db.query(models.User).filter(
            models.User.role == models.UserRole.TENANT
        ).all()
        
        predictions = []
        
        for tenant in tenants:
            try:
                # ✅ Calculate features using new method
                features = MLDataService.prepare_features_for_user(db, tenant)
                
                # Skip users with insufficient data (no bookings)
                if not features:
                    continue
                
                # Make prediction
                prediction = ml_service.predict_retention(features)
                
                # ✅ FIX: Check if prediction was successful
                if not prediction or 'error' in prediction:
                    error_msg = prediction.get('error', 'Unknown error') if prediction else 'No prediction returned'
                    print(f"⚠️ Skipping tenant {tenant.id} ({tenant.username}): {error_msg}")
                    continue
                
                # ✅ FIX: Ensure all required keys exist
                if 'risk_level' not in prediction:
                    print(f"⚠️ Skipping tenant {tenant.id}: Missing risk_level in prediction")
                    continue
                
                # Add user info
                prediction_result = {
                    'user_id': tenant.id,
                    'username': tenant.username,
                    'email': tenant.email,
                    'full_name': tenant.full_name,
                    'will_retain': prediction.get('will_retain', True),
                    'retention_probability': prediction.get('retention_probability', 0),
                    'churn_probability': prediction.get('churn_probability', 0),
                    'risk_score': prediction.get('risk_score', 0),
                    'risk_level': prediction.get('risk_level', 'Low'),
                    'recommendation': prediction.get('recommendation', 'No recommendation available')
                }
                
                # Filter by risk level if specified (case-insensitive)
                if risk_level is None or prediction_result['risk_level'].lower() == risk_level.lower():
                    predictions.append(prediction_result)
                    
            except Exception as e:
                # ✅ FIX: Catch individual tenant errors, don't fail entire request
                print(f"⚠️ Error predicting for tenant {tenant.id}: {str(e)}")
                import traceback
                traceback.print_exc()
                continue
        
        # Sort by risk score (highest first)
        predictions.sort(key=lambda x: x['risk_score'], reverse=True)
        
        return {
            'total_tenants': len(predictions),
            'filter': risk_level,
            'predictions': predictions
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch prediction failed: {str(e)}"
        )

@router.get("/at-risk-tenants")
def get_at_risk_tenants(
    threshold: int = 70,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN, models.UserRole.OWNER]))
):
    """
    Get list of tenants at risk of churning
    threshold: Risk score threshold (default 70)
    """
    try:
        # Get all predictions
        result = predict_all_tenants(db=db, current_user=current_user)
        
        # Filter by threshold
        at_risk = [p for p in result['predictions'] if p['risk_score'] >= threshold]
        
        return {
            'threshold': threshold,
            'at_risk_count': len(at_risk),
            'total_tenants': result['total_tenants'],
            'at_risk_tenants': at_risk,
            'summary': {
                'high_risk': len([p for p in at_risk if p['risk_level'].lower() == 'high']),
                'medium_risk': len([p for p in at_risk if p['risk_level'].lower() == 'medium']),
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get at-risk tenants: {str(e)}"
        )

@router.get("/retention-stats")
def get_retention_statistics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN, models.UserRole.OWNER]))
):
    """
    Get overall retention statistics
    """
    try:
        result = predict_all_tenants(db=db, current_user=current_user)
        predictions = result['predictions']
        
        if not predictions:
            return {
                'message': 'No tenant data available for statistics',
                'total_tenants': 0,
                'risk_distribution': {
                    'high_risk': {'count': 0, 'percentage': 0}, 
                    'medium_risk': {'count': 0, 'percentage': 0}, 
                    'low_risk': {'count': 0, 'percentage': 0}
                },
                'averages': {'risk_score': 0, 'retention_probability': 0},
                'predicted_to_churn': 0,
                'predicted_to_retain': 0
            }
        
        total = len(predictions)
        high_risk = len([p for p in predictions if p.get('risk_level', '').lower() == 'high'])
        medium_risk = len([p for p in predictions if p.get('risk_level', '').lower() == 'medium'])
        low_risk = len([p for p in predictions if p.get('risk_level', '').lower() == 'low'])
        
        # ✅ FIX: Safely handle risk_score and retention_probability
        total_risk_score = 0
        total_retention_prob = 0
        valid_predictions = 0
        
        for p in predictions:
            # Safely get risk_score with default
            risk_score = p.get('risk_score', 0)
            if risk_score is not None:
                total_risk_score += risk_score
                valid_predictions += 1
            
            # Safely get retention_probability with default
            retention_prob = p.get('retention_probability', 0)
            if retention_prob is not None:
                total_retention_prob += retention_prob
        
        # Avoid division by zero
        avg_risk_score = total_risk_score / valid_predictions if valid_predictions > 0 else 0
        avg_retention_prob = total_retention_prob / total if total > 0 else 0
        
        return {
            'total_tenants': total,
            'risk_distribution': {
                'high_risk': {
                    'count': high_risk,
                    'percentage': round(high_risk / total * 100, 1) if total > 0 else 0
                },
                'medium_risk': {
                    'count': medium_risk,
                    'percentage': round(medium_risk / total * 100, 1) if total > 0 else 0
                },
                'low_risk': {
                    'count': low_risk,
                    'percentage': round(low_risk / total * 100, 1) if total > 0 else 0
                }
            },
            'averages': {
                'risk_score': round(avg_risk_score, 2),
                'retention_probability': round(avg_retention_prob, 4)
            },
            'predicted_to_churn': len([p for p in predictions if not p.get('will_retain', True)]),
            'predicted_to_retain': len([p for p in predictions if p.get('will_retain', True)])
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()  # This will print the full error to your backend logs
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get retention statistics: {str(e)}"
        )