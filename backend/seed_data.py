from database import SessionLocal
import models
from auth import get_password_hash

def seed_database():
    db = SessionLocal()
    
    # Check if data already exists
    if db.query(models.User).count() > 0:
        print("Database already has data. Skipping seed.")
        return
    
    # Create admin user
    admin = models.User(
        email="admin@sleepingbear.com",
        username="admin",
        hashed_password=get_password_hash("admin123"),
        full_name="System Administrator",
        role=models.UserRole.ADMIN,
        is_active=True
    )
    db.add(admin)
    
    # Create sample properties
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
        ),
        models.Property(
            name="Cozy 1BR Unit",
            description="Affordable one-bedroom unit ideal for young professionals.",
            address="La Trinidad, Benguet, Philippines",
            price_per_month=12000.00,
            bedrooms=1,
            bathrooms=1,
            size_sqm=30.0,
            is_available=True,
            image_url="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"
        ),
        models.Property(
            name="Family Home 3BR",
            description="Spacious family home with garden area. Pet-friendly.",
            address="Camp 7, Baguio City, Philippines",
            price_per_month=35000.00,
            bedrooms=3,
            bathrooms=2,
            size_sqm=75.0,
            is_available=True,
            image_url="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"
        )
    ]
    
    for prop in properties:
        db.add(prop)
    
    db.commit()
    print("✅ Database seeded successfully!")
    print(f"   - Created 1 admin user (admin@sleepingbear.com / admin123)")
    print(f"   - Created {len(properties)} sample properties")
    
    db.close()

if __name__ == "__main__":
    seed_database()