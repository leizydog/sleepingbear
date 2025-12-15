# Load environment variables FIRST before any other imports
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles  # Import StaticFiles
import os
from app.db.session import engine
from app.models import all_models as models
from app.api.v1 import (
    auth, properties, bookings, payments, reports, 
    audit, notifications, ml_predictions  
)

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sleeping Bear Rental API",
    description="API for condominium rental management system",
    version="1.0.0"
)

# --- NEW: Create static directory for images ---
os.makedirs("static/uploads", exist_ok=True)
# Mount the static directory to serve images at /static
app.mount("/static", StaticFiles(directory="static"), name="static")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(properties.router)
app.include_router(bookings.router)
app.include_router(payments.router)
app.include_router(reports.router)
app.include_router(audit.router)
app.include_router(notifications.router)
app.include_router(ml_predictions.router)  # ← ADD THIS

@app.get("/")
def read_root():
    return {
        "message": "Sleeping Bear Rental API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Debug endpoint to check database status
@app.get("/debug/db-status")
def check_db_status():
    from app.db.session import SessionLocal
    try:
        db = SessionLocal()
        user_count = db.query(models.User).count()
        property_count = db.query(models.Property).count()
        booking_count = db.query(models.Booking).count()
        payment_count = db.query(models.Payment).count()
        
        # Check for pending properties
        pending_props = db.query(models.Property).filter(
            models.Property.status == models.PropertyStatus.PENDING
        ).count()
        
        db.close()
        return {
            "status": "connected",
            "users": user_count,
            "properties": property_count,
            "pending_properties": pending_props,
            "bookings": booking_count,
            "payments": payment_count
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Seed endpoint to populate database (call once, then remove)
@app.get("/seed-database")
def seed_database():
    from app.db.session import SessionLocal
    from app.core import security as auth
    from datetime import datetime, timedelta
    import random
    
    try:
        db = SessionLocal()
        
        # Check if already seeded
        existing_users = db.query(models.User).count()
        if existing_users > 0:
            db.close()
            return {"status": "already_seeded", "message": f"Database already has {existing_users} users. Clear database first if you want to re-seed."}
        
        # Create Admin
        admin = models.User(
            email="admin@sleepingbear.com",
            username="admin",
            hashed_password=auth.get_password_hash("admin123"),
            full_name="Super Administrator",
            phone="09171234567",
            role=models.UserRole.ADMIN,
            is_active=True
        )
        db.add(admin)
        
        # Create Owners
        owners = []
        for i, (email, name) in enumerate([
            ("owner1@gmail.com", "Juan Dela Cruz"),
            ("owner2@gmail.com", "Maria Santos"),
        ]):
            owner = models.User(
                email=email,
                username=f"owner{i+1}",
                hashed_password=auth.get_password_hash("owner123"),
                full_name=name,
                phone=f"0917111111{i}",
                role=models.UserRole.OWNER,
                is_active=True
            )
            db.add(owner)
            owners.append(owner)
        
        # Create Tenants
        tenants = []
        for i, (email, name) in enumerate([
            ("tenant1@gmail.com", "Carlos Martinez"),
            ("tenant2@gmail.com", "Rosa Fernandez"),
            ("tenant3@gmail.com", "Ana Garcia"),
        ]):
            tenant = models.User(
                email=email,
                username=f"tenant{i+1}",
                hashed_password=auth.get_password_hash("tenant123"),
                full_name=name,
                phone=f"0918111111{i}",
                role=models.UserRole.TENANT,
                is_active=True
            )
            db.add(tenant)
            tenants.append(tenant)
        
        db.commit()
        
        # Create Properties
        properties = []
        props_data = [
            ("SMDC Grass Residences - Studio", "Modern studio unit", "Quezon City", 15000, 1, 1, 25),
            ("The Columns Makati - 1BR", "Spacious 1BR in Makati", "Makati City", 25000, 1, 1, 35),
            ("Azure Urban Resort - 2BR", "Resort-style living", "Parañaque", 35000, 2, 2, 50),
        ]
        
        for i, (name, desc, addr, price, beds, baths, size) in enumerate(props_data):
            prop = models.Property(
                name=name,
                description=desc,
                address=addr,
                price_per_month=price,
                bedrooms=beds,
                bathrooms=baths,
                size_sqm=size,
                is_available=True,
                status=models.PropertyStatus.APPROVED,
                owner_id=owners[i % len(owners)].id,
                accepts_gcash=True,
                accepts_bpi=True,
                accepts_cash=True,
                gcash_number="09171234567",
                bpi_number="1234567890"
            )
            db.add(prop)
            properties.append(prop)
        
        # Add one pending property for testing
        pending_prop = models.Property(
            name="New Listing - Pending Approval",
            description="This is a test pending listing",
            address="Manila City",
            price_per_month=20000,
            bedrooms=1,
            bathrooms=1,
            size_sqm=30,
            is_available=True,
            status=models.PropertyStatus.PENDING,
            owner_id=owners[0].id,
            accepts_gcash=True
        )
        db.add(pending_prop)
        
        db.commit()
        
        # Create Bookings
        today = datetime.now()
        bookings = []
        
        for tenant in tenants:
            prop = properties[tenants.index(tenant) % len(properties)]
            
            # Create a few bookings per tenant
            for j in range(2):
                start = today - timedelta(days=30 + j*60)
                end = start + timedelta(days=30)
                
                booking = models.Booking(
                    user_id=tenant.id,
                    property_id=prop.id,
                    start_date=start,
                    end_date=end,
                    total_amount=prop.price_per_month,
                    status=models.BookingStatus.COMPLETED
                )
                db.add(booking)
                bookings.append(booking)
        
        # Add a pending booking for testing
        pending_booking = models.Booking(
            user_id=tenants[0].id,
            property_id=properties[0].id,
            start_date=today + timedelta(days=5),
            end_date=today + timedelta(days=35),
            total_amount=properties[0].price_per_month,
            status=models.BookingStatus.PENDING
        )
        db.add(pending_booking)
        
        db.commit()
        
        # Create Payments
        for booking in bookings:
            payment = models.Payment(
                booking_id=booking.id,
                amount=booking.total_amount,
                payment_method=random.choice(['gcash', 'bpi', 'cash']),
                status=models.PaymentStatus.COMPLETED,
                paid_at=booking.start_date,
                receipt_number=f"REC-{random.randint(10000, 99999)}"
            )
            db.add(payment)
        
        db.commit()
        db.close()
        
        return {
            "status": "success",
            "message": "Database seeded successfully!",
            "data": {
                "users": 1 + len(owners) + len(tenants),
                "properties": len(properties) + 1,
                "bookings": len(bookings) + 1,
                "payments": len(bookings)
            },
            "credentials": {
                "admin": "admin@sleepingbear.com / admin123",
                "owner": "owner1@gmail.com / owner123",
                "tenant": "tenant1@gmail.com / tenant123"
            }
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}