from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models import all_models as models
from app.core import security as auth
from app.db.session import get_db
from services.ml_prediction_service import MLPredictionService
from services.ml_data_service import MLDataService
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
    features_used: dict

@router.get("/model-info")
def get_model_info(
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN]))
):
    """Get information about the deployed model"""
    try:
        return ml_service.get_model_info()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get model info: {str(e)}"
        )

@router.get("/feature-importance")
def get_feature_importance(
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN]))
):
    """Get feature importance from the model"""
    try:
        return ml_service.get_feature_importance()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get feature importance: {str(e)}"
        )

@router.post("/predict", response_model=PredictionResponse)
def predict_retention(
    request: PredictionRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN, models.UserRole.OWNER]))
):
    """
    Predict retention for a specific user
    """
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
        
        # Get user's bookings
        bookings = db.query(models.Booking).filter(
            models.Booking.user_id == user.id
        ).all()
        
        if not bookings:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User has no booking history for prediction"
            )
        
        # Calculate features
        features = MLDataService._calculate_user_features(db, user, bookings)
        
        # Remove user_id and target variable
        features_for_prediction = {k: v for k, v in features.items() 
                                   if k not in ['user_id', 'retained']}
        
        # Make prediction
        prediction = ml_service.predict_retention(features_for_prediction)
        
        return {
            'user_id': user.id,
            'username': user.username,
            'will_retain': prediction['will_retain'],
            'retention_probability': prediction['retention_probability'],
            'churn_probability': prediction['churn_probability'],
            'risk_score': prediction['risk_score'],
            'risk_level': prediction['risk_level'],
            'recommendation': prediction['recommendation'],
            'features_used': features_for_prediction
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )

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
        # Get all tenant users with bookings
        tenants = db.query(models.User).filter(
            models.User.role == models.UserRole.TENANT
        ).all()
        
        predictions = []
        
        for tenant in tenants:
            bookings = db.query(models.Booking).filter(
                models.Booking.user_id == tenant.id
            ).all()
            
            if not bookings:
                continue
            
            # Calculate features
            features = MLDataService._calculate_user_features(db, tenant, bookings)
            features_for_prediction = {k: v for k, v in features.items() 
                                      if k not in ['user_id', 'retained']}
            
            # Make prediction
            prediction = ml_service.predict_retention(features_for_prediction)
            
            # Add user info
            prediction_result = {
                'user_id': tenant.id,
                'username': tenant.username,
                'email': tenant.email,
                'full_name': tenant.full_name,
                **prediction
            }
            
            # Filter by risk level if specified
            if risk_level is None or prediction['risk_level'] == risk_level:
                predictions.append(prediction_result)
        
        # Sort by risk score (highest first)
        predictions.sort(key=lambda x: x['risk_score'], reverse=True)
        
        return {
            'total_tenants': len(predictions),
            'filter': risk_level,
            'predictions': predictions
        }
        
    except Exception as e:
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
                'high_risk': len([p for p in at_risk if p['risk_level'] == 'high']),
                'medium_risk': len([p for p in at_risk if p['risk_level'] == 'medium']),
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
                'message': 'No tenant data available for statistics'
            }
        
        total = len(predictions)
        high_risk = len([p for p in predictions if p['risk_level'] == 'high'])
        medium_risk = len([p for p in predictions if p['risk_level'] == 'medium'])
        low_risk = len([p for p in predictions if p['risk_level'] == 'low'])
        
        avg_risk_score = sum(p['risk_score'] for p in predictions) / total
        avg_retention_prob = sum(p['retention_probability'] or 0 for p in predictions) / total
        
        return {
            'total_tenants': total,
            'risk_distribution': {
                'high_risk': {
                    'count': high_risk,
                    'percentage': round(high_risk / total * 100, 1)
                },
                'medium_risk': {
                    'count': medium_risk,
                    'percentage': round(medium_risk / total * 100, 1)
                },
                'low_risk': {
                    'count': low_risk,
                    'percentage': round(low_risk / total * 100, 1)
                }
            },
            'averages': {
                'risk_score': round(avg_risk_score, 2),
                'retention_probability': round(avg_retention_prob, 4)
            },
            'predicted_to_churn': len([p for p in predictions if not p['will_retain']]),
            'predicted_to_retain': len([p for p in predictions if p['will_retain']])
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get retention statistics: {str(e)}"
        )