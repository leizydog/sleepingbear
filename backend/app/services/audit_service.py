from sqlalchemy.orm import Session
from fastapi import Request
from app.models import all_models as models
import json
from typing import Optional

class AuditService:
    
    @staticmethod
    def log(
        db: Session,
        action: models.AuditAction,
        user_id: Optional[int],
        entity_type: Optional[str] = None,
        entity_id: Optional[int] = None,
        description: str = "",
        metadata: dict = None,
        request: Request = None
    ):
        """Create an audit log entry"""
        
        ip_address = None
        user_agent = None
        
        if request:
            ip_address = request.client.host if request.client else None
            user_agent = request.headers.get("user-agent")
        
        audit_log = models.AuditLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            description=description,
            ip_address=ip_address,
            user_agent=user_agent,
            metadata=json.dumps(metadata) if metadata else None
        )
        
        db.add(audit_log)
        db.commit()
        
        return audit_log