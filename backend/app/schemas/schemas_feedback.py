from ast import List
from http.client import HTTPException
from django import db
from fastapi import Depends, Query
from pydantic import BaseModel, validator
from datetime import datetime
from typing import Optional

from requests import Session
from scipy import stats

from backend import models
from backend.database import get_db
from backend.routers import auth
from backend.services.audit_service import AuditService

class FeedbackCreate(BaseModel):
    property_id: int
    rating: int
    comment: Optional[str] = None
    
    @validator('rating')
    def validate_rating(cls, v):
        if v < 1 or v > 5:
            raise ValueError('Rating must be between 1 and 5')
        return v

class FeedbackResponse(BaseModel):
    id: int
    user_id: int
    property_id: int
    rating: int
    comment: Optional[str]
    created_at: datetime
    user_name: Optional[str]
    
    class Config:
        from_attributes = True

class FeedbackStats(BaseModel):
    property_id: int
    total_feedbacks: int
    average_rating: float
    rating_distribution: dict

    class Config:
        from_attributes = True
@db.router.get("/property/{property_id}", response_model=List[FeedbackResponse])
def get_property_feedback(
    property_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Get all feedback for a property
    """
    property = db.query(models.Property).filter(models.Property.id == property_id).first()
    
    if not property:
        raise HTTPException(
            status_code=stats.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Query feedback with pagination
    offset = (page - 1) * per_page
    feedbacks = db.query(models.Feedback).join(models.User).filter(
        models.Feedback.property_id == property_id
    ).order_by(models.Feedback.created_at.desc()).offset(offset).limit(per_page).all()
    
    # Format response
    results = []
    for feedback in feedbacks:
        results.append({
            **feedback.__dict__,
            'user_name': feedback.user.full_name or feedback.user.username
        })
    
    return results

@db.router.get("/property/{property_id}/stats", response_model=FeedbackStats)
def get_property_feedback_stats(
    property_id: int,
    db: Session = Depends(get_db)
):
    """
    Get feedback statistics for a property
    """
    property = db.query(models.Property).filter(models.Property.id == property_id).first()
    
    if not property:
        raise HTTPException(
            status_code=stats.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Get all feedback
    feedbacks = db.query(models.Feedback).filter(
        models.Feedback.property_id == property_id
    ).all()
    
    total_feedbacks = len(feedbacks)
    
    if total_feedbacks == 0:
        return {
            "property_id": property_id,
            "total_feedbacks": 0,
            "average_rating": 0.0,
            "rating_distribution": {
                "5": 0, "4": 0, "3": 0, "2": 0, "1": 0
            }
        }
    
    # Calculate average rating
    average_rating = sum([f.rating for f in feedbacks]) / total_feedbacks
    
    # Calculate rating distribution
    rating_distribution = {
        "5": len([f for f in feedbacks if f.rating == 5]),
        "4": len([f for f in feedbacks if f.rating == 4]),
        "3": len([f for f in feedbacks if f.rating == 3]),
        "2": len([f for f in feedbacks if f.rating == 2]),
        "1": len([f for f in feedbacks if f.rating == 1]),
    }
    
    return {
        "property_id": property_id,
        "total_feedbacks": total_feedbacks,
        "average_rating": round(average_rating, 2),
        "rating_distribution": rating_distribution
    }

@db.router.get("/my-feedback", response_model=List[FeedbackResponse])
def get_my_feedback(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Get current user's feedback
    """
    feedbacks = db.query(models.Feedback).filter(
        models.Feedback.user_id == current_user.id
    ).order_by(models.Feedback.created_at.desc()).all()
    
    results = []
    for feedback in feedbacks:
        results.append({
            **feedback.__dict__,
            'user_name': current_user.full_name or current_user.username
        })
    
    return results

@db.router.delete("/{feedback_id}", status_code=stats.HTTP_204_NO_CONTENT)
def delete_feedback(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Delete feedback (own feedback or admin)
    """
    feedback = db.query(models.Feedback).filter(models.Feedback.id == feedback_id).first()
    
    if not feedback:
        raise HTTPException(
            status_code=stats.HTTP_404_NOT_FOUND,
            detail="Feedback not found"
        )
    
    # Check permissions
    if current_user.role != models.UserRole.ADMIN and feedback.user_id != current_user.id:
        raise HTTPException(
            status_code=stats.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this feedback"
        )
    
    db.delete(feedback)
    db.commit()
    
    return None