from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class RevenueReport(BaseModel):
    total_revenue: float
    total_bookings: int
    confirmed_bookings: int
    pending_bookings: int
    cancelled_bookings: int
    average_booking_value: float
    period_start: datetime
    period_end: datetime

class OccupancyReport(BaseModel):
    property_id: int
    property_name: str
    total_days_in_period: int
    booked_days: int
    occupancy_rate: float
    revenue: float

class MonthlyRevenueData(BaseModel):
    month: str
    year: int
    revenue: float
    bookings: int

class PropertyPerformance(BaseModel):
    property_id: int
    property_name: str
    total_bookings: int
    total_revenue: float
    # average_rating removed as requested
    occupancy_rate: float

class DashboardStats(BaseModel):
    total_properties: int
    available_properties: int
    total_users: int
    total_bookings: int
    confirmed_bookings: int
    pending_bookings: int
    total_revenue: float
    revenue_this_month: float
    bookings_this_month: int