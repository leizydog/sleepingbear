import sys
import os

# Add the current directory to Python path so we can import 'app'
sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.models import all_models as models
from app.core.security import get_password_hash

def seed_database():
    db = SessionLocal()
    
    print("🌱 Seeding database...")

    # 1. Create Admin User
    admin_email = "admin@sleepingbear.com"
    existing_admin = db.query(models.User).filter(models.User.email == admin_email).first()
    
    if not existing_admin:
        admin = models.User(
            email=admin_email,
            username="admin",
            hashed_password=get_password_hash("admin123"), # Default Password
            full_name="System Administrator",
            role=models.UserRole.ADMIN,
            is_active=True
        )
        db.add(admin)
        print(f"✅ Admin created: {admin_email} / admin123")
    else:
        print(f"ℹ️  Admin already exists: {admin_email}")

    # 2. Create Sample Properties (Only if none exist)
    if db.query(models.Property).count() == 0:
        properties = [
            models.Property(
                name="Luxury Studio Unit",
                description="Modern studio apartment with city view. Fully furnished with contemporary amenities.",
                address="Baguio City, Benguet, Philippines",
                price_per_month=15000.00,
                bedrooms=1,
                bathrooms=1,
                size_sqm=25.0,
                is_available=True,
                image_url="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"
            ),
            models.Property(
                name="Spacious 2BR Condo",
                description="Perfect for small families. Located near schools and shopping centers.",
                address="Session Road, Baguio City, Philippines",
                price_per_month=25000.00,
                bedrooms=2,
                bathrooms=2,
                size_sqm=45.0,
                is_available=True,
                image_url="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"
            ),
            models.Property(
                name="Penthouse Suite",
                description="Premium penthouse with panoramic mountain views. Includes parking and gym access.",
                address="Upper Session Road, Baguio City, Philippines",
                price_per_month=45000.00,
                bedrooms=3,
                bathrooms=3,
                size_sqm=85.0,
                is_available=True,
                image_url="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"
            )
        ]
        for prop in properties:
            db.add(prop)
        print(f"✅ Added {len(properties)} sample properties")
    else:
        print("ℹ️  Properties already exist. Skipping property seed.")

    db.commit()
    db.close()
    print("✨ Database seeding completed!")

if __name__ == "__main__":
    seed_database()