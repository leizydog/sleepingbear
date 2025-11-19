from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.models import all_models as models
from app.core import security as auth
from app.db.session import get_db
from services.ml_data_service import MLDataService
import os

router = APIRouter(prefix="/ml-data", tags=["ML Data"])

@router.get("/export")
def export_training_data(
    include_synthetic: bool = False,
    synthetic_count: int = 500,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN]))
):
    """
    Export training data for ML model (Admin only)
    """
    try:
        # Collect real data
        real_df = MLDataService.collect_retention_features(db)
        
        # Add synthetic data if requested
        if include_synthetic:
            synthetic_df = MLDataService.generate_synthetic_data(db, synthetic_count)
            import pandas as pd
            df = pd.concat([real_df, synthetic_df], ignore_index=True)
        else:
            df = real_df
        
        # Save to file
        filepath = 'backend/data/retention_training_data.csv'
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        df.to_csv(filepath, index=False)
        
        return {
            'success': True,
            'filepath': filepath,
            'total_records': len(df),
            'real_records': len(real_df),
            'synthetic_records': len(df) - len(real_df) if include_synthetic else 0,
            'features': list(df.columns),
            'target_variable': 'retained',
            'download_url': '/ml-data/download'
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export data: {str(e)}"
        )

@router.get("/download")
def download_training_data(
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN]))
):
    """
    Download the exported training data CSV
    """
    filepath = 'backend/data/retention_training_data.csv'
    
    if not os.path.exists(filepath):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training data not found. Please export first."
        )
    
    return FileResponse(
        filepath,
        media_type='text/csv',
        filename='retention_training_data.csv'
    )

@router.get("/features")
def get_feature_descriptions(
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN]))
):
    """
    Get descriptions of all features used in the ML model
    """
    return {
        'features': [
            {
                'name': 'account_age_days',
                'description': 'Number of days since user account creation',
                'type': 'numeric',
                'importance': 'medium'
            },
            {
                'name': 'total_bookings',
                'description': 'Total number of bookings made by user',
                'type': 'numeric',
                'importance': 'high'
            },
            {
                'name': 'confirmed_bookings',
                'description': 'Number of confirmed bookings',
                'type': 'numeric',
                'importance': 'high'
            },
            {
                'name': 'cancelled_bookings',
                'description': 'Number of cancelled bookings',
                'type': 'numeric',
                'importance': 'medium'
            },
            {
                'name': 'cancellation_rate',
                'description': 'Ratio of cancelled to total bookings',
                'type': 'numeric',
                'range': [0, 1],
                'importance': 'high'
            },
            {
                'name': 'total_payments',
                'description': 'Total number of payment transactions',
                'type': 'numeric',
                'importance': 'medium'
            },
            {
                'name': 'completed_payments',
                'description': 'Number of successfully completed payments',
                'type': 'numeric',
                'importance': 'high'
            },
            {
                'name': 'total_amount_paid',
                'description': 'Total amount paid by user in PHP',
                'type': 'numeric',
                'importance': 'medium'
            },
            {
                'name': 'late_payments',
                'description': 'Number of late payments',
                'type': 'numeric',
                'importance': 'high'
            },
            {
                'name': 'on_time_payments',
                'description': 'Number of on-time payments',
                'type': 'numeric',
                'importance': 'high'
            },
            {
                'name': 'late_payment_rate',
                'description': 'Ratio of late to total payments',
                'type': 'numeric',
                'range': [0, 1],
                'importance': 'high'
            },
            {
                'name': 'avg_booking_interval',
                'description': 'Average days between consecutive bookings',
                'type': 'numeric',
                'importance': 'medium'
            },
            {
                'name': 'days_since_last_booking',
                'description': 'Number of days since user\'s last booking',
                'type': 'numeric',
                'importance': 'high'
            },
            {
                'name': 'avg_booking_length',
                'description': 'Average duration of bookings in days',
                'type': 'numeric',
                'importance': 'medium'
            },
            {
                'name': 'avg_rating',
                'description': 'Average rating given by user',
                'type': 'numeric',
                'range': [1, 5],
                'importance': 'medium'
            },
            {
                'name': 'total_feedbacks',
                'description': 'Total number of feedback submissions',
                'type': 'numeric',
                'importance': 'low'
            }
        ],
        'target_variable': {
            'name': 'retained',
            'description': 'Whether user will return (1) or churn (0)',
            'type': 'binary',
            'definition': 'User is retained if they made a booking in the last 90 days'
        }
    }

@router.get("/statistics")
def get_data_statistics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN]))
):
    """
    Get statistics about the training data
    """
    try:
        df = MLDataService.collect_retention_features(db)
        
        if len(df) == 0:
            return {
                'message': 'No data available yet. Generate synthetic data or wait for real user activity.'
            }
        
        # Calculate statistics
        retained_count = df['retained'].sum()
        churned_count = len(df) - retained_count
        
        return {
            'total_records': len(df),
            'retained_users': int(retained_count),
            'churned_users': int(churned_count),
            'retention_rate': round(retained_count / len(df) * 100, 2),
            'feature_statistics': {
                'avg_total_bookings': round(df['total_bookings'].mean(), 2),
                'avg_cancellation_rate': round(df['cancellation_rate'].mean(), 3),
                'avg_late_payment_rate': round(df['late_payment_rate'].mean(), 3),
                'avg_days_since_last_booking': round(df['days_since_last_booking'].mean(), 1),
                'avg_rating': round(df['avg_rating'].mean(), 2)
            },
            'class_balance': {
                'retained': f"{retained_count / len(df) * 100:.1f}%",
                'churned': f"{churned_count / len(df) * 100:.1f}%"
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get statistics: {str(e)}"
        )