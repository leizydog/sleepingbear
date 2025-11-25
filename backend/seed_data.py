import sys
import os
from datetime import datetime, timedelta

# Add the current directory to Python path
sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.models import all_models as models
from app.core.security import get_password_hash

def seed_database():
    db = SessionLocal()
    print("🌱 Seeding database...")

    # ==========================================
    # 1. CREATE USERS (Admin, Owner, Tenant)
    # ==========================================
    
    # --- Admin ---
    admin_email = "admin@sleepingbear.com"
    admin = db.query(models.User).filter(models.User.email == admin_email).first()
    if not admin:
        admin = models.User(
            email=admin_email,
            username="admin",
            hashed_password=get_password_hash("admin123"),
            full_name="System Administrator",
            role=models.UserRole.ADMIN,
            is_active=True
        )
        db.add(admin)
        print(f"✅ Admin created: {admin_email}")
    
    # --- Owner ---
    owner_email = "owner@sleepingbear.com"
    owner = db.query(models.User).filter(models.User.email == owner_email).first()
    if not owner:
        owner = models.User(
            email=owner_email,
            username="owner_joe",
            hashed_password=get_password_hash("owner123"),
            full_name="Joe Sardoma",
            phone="0917-123-4567",
            role=models.UserRole.OWNER,
            is_active=True
        )
        db.add(owner)
        print(f"✅ Owner created: {owner_email}")

    # --- Tenant ---
    tenant_email = "tenant@sleepingbear.com"
    tenant = db.query(models.User).filter(models.User.email == tenant_email).first()
    if not tenant:
        tenant = models.User(
            email=tenant_email,
            username="tenant_maria",
            hashed_password=get_password_hash("tenant123"),
            full_name="Maria Santos",
            phone="0999-888-7777",
            role=models.UserRole.TENANT,
            is_active=True
        )
        db.add(tenant)
        print(f"✅ Tenant created: {tenant_email}")

    # Commit users to get IDs
    db.commit()
    
    # Refresh objects to ensure IDs are available
    if owner: db.refresh(owner)
    if tenant: db.refresh(tenant)

    # ==========================================
    # 2. CREATE PROPERTIES
    # ==========================================
    
    if db.query(models.Property).count() == 0:
        properties = [
            models.Property(
                owner_id=owner.id, # Link to Owner
                name="Luxury Studio Unit",
                description="Modern studio apartment with city view. Fully furnished with contemporary amenities.",
                address="Baguio City, Benguet",
                price_per_month=15000.00,
                bedrooms=1,
                bathrooms=1,
                size_sqm=25.0,
                is_available=True,
                status=models.PropertyStatus.APPROVED,
                image_url="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
                images=[
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
                    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"
                ]
            ),
            models.Property(
                owner_id=owner.id,
                name="Spacious 2BR Condo",
                description="Perfect for small families. Located near schools and shopping centers.",
                address="Session Road, Baguio City",
                price_per_month=25000.00,
                bedrooms=2,
                bathrooms=2,
                size_sqm=45.0,
                is_available=True,
                status=models.PropertyStatus.APPROVED,
                image_url="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
                images=["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"]
            ),
            models.Property(
                owner_id=owner.id,
                name="Penthouse Suite",
                description="Premium penthouse with panoramic mountain views. Includes parking and gym access.",
                address="Upper Session Road, Baguio City",
                price_per_month=45000.00,
                bedrooms=3,
                bathrooms=3,
                size_sqm=85.0,
                is_available=True,
                status=models.PropertyStatus.APPROVED,
                image_url="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
                images=["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"]
            )
        ]
        
        for prop in properties:
            db.add(prop)
        
        db.commit()
        print(f"✅ Added {len(properties)} sample properties")
    else:
        print("ℹ️  Properties already exist. Skipping.")

    # ==========================================
    # 3. CREATE SAMPLE BOOKINGS & PAYMENTS
    # ==========================================
    
    # Only seed if no bookings exist
    if db.query(models.Booking).count() == 0:
        # Get the first property and tenant
        prop = db.query(models.Property).first()
        
        # 1. A Completed Past Booking (For Revenue Charts)
        past_start = datetime.utcnow() - timedelta(days=60)
        past_end = datetime.utcnow() - timedelta(days=30)
        
        booking_past = models.Booking(
            user_id=tenant.id,
            property_id=prop.id,
            start_date=past_start,
            end_date=past_end,
            total_amount=prop.price_per_month, # 1 Month
            status=models.BookingStatus.COMPLETED,
            created_at=past_start
        )
        db.add(booking_past)
        db.commit()

        # Payment for past booking
        payment_past = models.Payment(
            booking_id=booking_past.id,
            amount=prop.price_per_month,
            payment_method="card",
            status=models.PaymentStatus.COMPLETED,
            paid_at=past_start,
            transaction_id="txn_seed_123"
        )
        db.add(payment_past)

        # 2. An Active/Upcoming Booking
        future_start = datetime.utcnow() + timedelta(days=5)
        future_end = datetime.utcnow() + timedelta(days=35)
        
        booking_future = models.Booking(
            user_id=tenant.id,
            property_id=prop.id,
            start_date=future_start,
            end_date=future_end,
            total_amount=prop.price_per_month,
            status=models.BookingStatus.CONFIRMED
        )
        db.add(booking_future)
        
        print("✅ Added sample bookings and payments")
        db.commit()

    db.close()
    print("✨ Database seeding completed!")

if __name__ == "__main__":
    seed_database()