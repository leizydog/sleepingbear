from sqlalchemy import JSON, Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.session import Base
from sqlalchemy import Text

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    TENANT = "tenant"
    OWNER = "owner"

# --- UPDATED: Added REJECTED and DECLINED ---
class BookingStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    REJECTED = "rejected" 
    DECLINED = "declined"

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class PropertyStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

# --- USERS TABLE ---
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    phone = Column(String)
    role = Column(Enum(UserRole), default=UserRole.TENANT)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    bookings = relationship("Booking", back_populates="user")
    feedbacks = relationship("Feedback", back_populates="user")

# --- PROPERTIES TABLE ---
class Property(Base):
    __tablename__ = "properties"
    
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String, nullable=False)
    description = Column(String)
    address = Column(String)
    price_per_month = Column(Float, nullable=False)
    bedrooms = Column(Integer)
    bathrooms = Column(Integer)
    size_sqm = Column(Float)
    is_available = Column(Boolean, default=True)
    status = Column(Enum(PropertyStatus), default=PropertyStatus.PENDING)
    images = Column(JSON, default=[]) 
    image_url = Column(String) 
    created_at = Column(DateTime, default=datetime.utcnow)
    
    bookings = relationship("Booking", back_populates="property")
    owner = relationship("User")

# --- BOOKINGS TABLE ---
class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    property_id = Column(Integer, ForeignKey("properties.id"))
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(Enum(BookingStatus), default=BookingStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="bookings")
    property = relationship("Property", back_populates="bookings")
    payments = relationship("Payment", back_populates="booking")

# --- PAYMENTS TABLE ---
class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"))
    amount = Column(Float, nullable=False)
    payment_method = Column(String)
    transaction_id = Column(String, unique=True)
    payment_intent_id = Column(String, unique=True)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    paid_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    receipt_url = Column(String)
    receipt_number = Column(String)
    payment_metadata = Column(Text)
    
    booking = relationship("Booking", back_populates="payments")

# --- FEEDBACKS TABLE ---
class Feedback(Base):
    __tablename__ = "feedbacks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    property_id = Column(Integer, ForeignKey("properties.id"))
    rating = Column(Integer)
    comment = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="feedbacks")

# --- AUDIT LOGS TABLE ---
class AuditAction(str, enum.Enum):
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete" 
    LOGIN = "login"
    LOGOUT = "logout"
    PAYMENT = "payment"
    BOOKING = "booking"

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(Enum(AuditAction), nullable=False)
    entity_type = Column(String)
    entity_id = Column(Integer)
    description = Column(String)
    ip_address = Column(String)
    user_agent = Column(String)
    log_metadata = Column("metadata", JSON)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    user = relationship("User")