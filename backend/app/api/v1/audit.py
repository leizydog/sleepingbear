from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
import models
import auth
from database import get_db
from pydantic import BaseModel

router = APIRouter(prefix="/audit", tags=["Audit Logs"])

class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    username: Optional[str]
    action: str
    entity_type: Optional[str]
    entity_id: Optional[int]
    description: str
    ip_address: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.get("/logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    user_id: Optional[int] = None,
    action: Optional[str] = None,
    entity_type: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN]))
):
    """Get audit logs (Admin only)"""
    
    query = db.query(models.AuditLog).join(
        models.User, models.AuditLog.user_id == models.User.id, isouter=True
    )
    
    # Apply filters
    if user_id:
        query = query.filter(models.AuditLog.user_id == user_id)
    if action:
        query = query.filter(models.AuditLog.action == action)
    if entity_type:
        query = query.filter(models.AuditLog.entity_type == entity_type)
    if start_date:
        query = query.filter(models.AuditLog.created_at >= start_date)
    if end_date:
        query = query.filter(models.AuditLog.created_at <= end_date)
    
    # Order by most recent first
    query = query.order_by(models.AuditLog.created_at.desc())
    
    # Pagination
    offset = (page - 1) * per_page
    logs = query.offset(offset).limit(per_page).all()
    
    # Format response
    results = []
    for log in logs:
        results.append({
            "id": log.id,
            "user_id": log.user_id,
            "username": log.user.username if log.user else "System",
            "action": log.action.value,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "description": log.description,
            "ip_address": log.ip_address,
            "created_at": log.created_at,
        })
    
    return results

@router.get("/user/{user_id}")
def get_user_activity(
    user_id: int,
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN]))
):
    """Get activity history for a specific user"""
    
    logs = db.query(models.AuditLog).filter(
        models.AuditLog.user_id == user_id
    ).order_by(models.AuditLog.created_at.desc()).limit(limit).all()
    
    return {
        "user_id": user_id,
        "total_activities": len(logs),
        "activities": [
            {
                "action": log.action.value,
                "description": log.description,
                "entity": f"{log.entity_type}#{log.entity_id}" if log.entity_type else None,
                "timestamp": log.created_at,
            }
            for log in logs
        ]
    }