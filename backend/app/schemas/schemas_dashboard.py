from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TenantRiskProfile(BaseModel):
    user_id: int
    username: str
    email: str
    full_name: Optional[str]
    risk_score: int
    risk_level: str
    retention_probability: Optional[float]
    churn_probability: Optional[float]
    recommendation: str
    key_factors: List[dict]
    total_bookings: int
    last_booking_date: Optional[datetime]
    
class RetentionDashboardData(BaseModel):
    overview: dict
    at_risk_tenants: List[TenantRiskProfile]
    risk_distribution: dict
    trends: dict
    recommendations: List[dict]