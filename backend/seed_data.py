# ============================================================================
# DATABASE SEEDING SCRIPT FOR SLEEPING BEAR CONDOMINIUM
# Place this file in: backend/seed_data.py
# Run with: python seed_data.py
# ============================================================================

import sys
import os
from datetime import datetime, timedelta
import random

# Add parent directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal, engine
from app.models import all_models as models
from app.core import security as auth
from sqlalchemy import text

# ============================================================================
# CONFIGURATION
# ============================================================================

# Create all tables
models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

print("="*80)
print("SLEEPING BEAR CONDOMINIUM - DATABASE SEEDING SCRIPT")
print("="*80)
print()

# ============================================================================
# CLEAR EXISTING DATA (Optional - Comment out if you want to keep data)
# ============================================================================

def clear_database():
    """Clear all existing data"""
    print("🗑️  Clearing existing data...")
    try:
        db.execute(text("TRUNCATE TABLE payments, bookings, properties, users RESTART IDENTITY CASCADE;"))
        db.commit()
        print("✅ Database cleared successfully\n")
    except Exception as e:
        print(f"⚠️  Error clearing database: {e}")
        db.rollback()

def check_existing_data():
    """Check if we should clear data"""
    user_count = db.query(models.User).count()
    
    if user_count > 0:
        print(f"⚠️  Found {user_count} existing users in database")
        response = input("Do you want to clear all data and start fresh? (yes/no): ").lower()
        
        if response in ['yes', 'y']:
            clear_database()
            return True
        else:
            print("❌ Seeding cancelled. Please clear data manually or use different usernames.")
            db.close()
            exit(0)
    return False

# Check for existing data
check_existing_data()

# ============================================================================
# SEED USERS
# ============================================================================

print("👥 Creating Users...")

# Admin User
admin = models.User(
    email="admin@sleepingbear.com",
    username="admin",
    hashed_password=auth.get_password_hash("admin123"),
    full_name="Admin User",
    phone="09171234567",
    role=models.UserRole.ADMIN,
    is_active=True
)
db.add(admin)

# Property Owners
owners_data = [
    {"email": "owner1@gmail.com", "username": "owner_juan", "name": "Juan Dela Cruz", "phone": "09171111111"},
    {"email": "owner2@gmail.com", "username": "owner_maria", "name": "Maria Santos", "phone": "09172222222"},
    {"email": "owner3@gmail.com", "username": "owner_pedro", "name": "Pedro Reyes", "phone": "09173333333"},
]

owners = []
for o in owners_data:
    owner = models.User(
        email=o["email"],
        username=o["username"],
        hashed_password=auth.get_password_hash("owner123"),
        full_name=o["name"],
        phone=o["phone"],
        role=models.UserRole.OWNER,
        is_active=True
    )
    db.add(owner)
    owners.append(owner)

# Tenants with varied profiles for ML testing
tenants_data = [
    # HIGH RISK TENANTS (Will likely churn)
    {"email": "tenant1@gmail.com", "username": "tenant_carlos", "name": "Carlos Martinez", "phone": "09181111111", "profile": "high_risk"},
    {"email": "tenant2@gmail.com", "username": "tenant_rosa", "name": "Rosa Fernandez", "phone": "09182222222", "profile": "high_risk"},
    {"email": "tenant3@gmail.com", "username": "tenant_miguel", "name": "Miguel Torres", "phone": "09183333333", "profile": "high_risk"},
    
    # MEDIUM RISK TENANTS
    {"email": "tenant4@gmail.com", "username": "tenant_ana", "name": "Ana Garcia", "phone": "09184444444", "profile": "medium_risk"},
    {"email": "tenant5@gmail.com", "username": "tenant_jose", "name": "Jose Ramirez", "phone": "09185555555", "profile": "medium_risk"},
    {"email": "tenant6@gmail.com", "username": "tenant_linda", "name": "Linda Cruz", "phone": "09186666666", "profile": "medium_risk"},
    {"email": "tenant7@gmail.com", "username": "tenant_robert", "name": "Robert Mendoza", "phone": "09187777777", "profile": "medium_risk"},
    
    # LOW RISK TENANTS (Loyal, will retain)
    {"email": "tenant8@gmail.com", "username": "tenant_sofia", "name": "Sofia Rodriguez", "phone": "09188888888", "profile": "low_risk"},
    {"email": "tenant9@gmail.com", "username": "tenant_daniel", "name": "Daniel Lopez", "phone": "09189999999", "profile": "low_risk"},
    {"email": "tenant10@gmail.com", "username": "tenant_carmen", "name": "Carmen Gonzalez", "phone": "09180000000", "profile": "low_risk"},
    {"email": "tenant11@gmail.com", "username": "tenant_lucas", "name": "Lucas Morales", "phone": "09181111112", "profile": "low_risk"},
    {"email": "tenant12@gmail.com", "username": "tenant_isabella", "name": "Isabella Flores", "phone": "09182222223", "profile": "low_risk"},
]

tenants = []
for t in tenants_data:
    tenant = models.User(
        email=t["email"],
        username=t["username"],
        hashed_password=auth.get_password_hash("tenant123"),
        full_name=t["name"],
        phone=t["phone"],
        role=models.UserRole.TENANT,
        is_active=True
    )
    tenant.risk_profile = t["profile"]  # Custom attribute for seeding logic
    db.add(tenant)
    tenants.append(tenant)

db.commit()
print(f"✅ Created {len(tenants)} tenants, {len(owners)} owners, and 1 admin\n")

# ============================================================================
# SEED PROPERTIES
# ============================================================================

print("🏢 Creating Properties...")

properties_data = [
    {
        "name": "SMDC Grass Residences Tower 4 - Studio",
        "description": "Modern studio unit with city view. Fully furnished with WiFi, AC, and kitchen appliances.",
        "address": "Grass Residences, Quezon City",
        "price": 15000,
        "bedrooms": 1,
        "bathrooms": 1,
        "size": 25,
        "owner": owners[0]
    },
    {
        "name": "The Columns Makati - 1BR",
        "description": "Spacious 1-bedroom condo in the heart of Makati CBD. Near MRT, malls, and offices.",
        "address": "The Columns, Ayala Avenue, Makati",
        "price": 25000,
        "bedrooms": 1,
        "bathrooms": 1,
        "size": 35,
        "owner": owners[0]
    },
    {
        "name": "Azure Urban Resort - 2BR",
        "description": "Resort-style living with pool, gym, and beach access. Perfect for families.",
        "address": "Azure Urban Resort, Parañaque",
        "price": 35000,
        "bedrooms": 2,
        "bathrooms": 2,
        "size": 50,
        "owner": owners[1]
    },
    {
        "name": "One Shangri-La Place - Studio",
        "description": "Luxury studio in EDSA. Walking distance to Shangri-La Mall.",
        "address": "One Shangri-La Place, Mandaluyong",
        "price": 18000,
        "bedrooms": 1,
        "bathrooms": 1,
        "size": 28,
        "owner": owners[1]
    },
    {
        "name": "One Central Makati - 1BR",
        "description": "Premium condo with skyline view. Near Ayala Triangle and business district.",
        "address": "One Central, Makati Avenue",
        "price": 30000,
        "bedrooms": 1,
        "bathrooms": 1,
        "size": 40,
        "owner": owners[2]
    },
    {
        "name": "Pioneer Woodlands - 2BR",
        "description": "Family-friendly condo with playground and park. Quiet neighborhood.",
        "address": "Pioneer Woodlands, Mandaluyong",
        "price": 28000,
        "bedrooms": 2,
        "bathrooms": 1,
        "size": 45,
        "owner": owners[2]
    },
]

properties = []
for p in properties_data:
    prop = models.Property(
        name=p["name"],
        description=p["description"],
        address=p["address"],
        price_per_month=p["price"],
        bedrooms=p["bedrooms"],
        bathrooms=p["bathrooms"],
        size_sqm=p["size"],
        is_available=True,
        status=models.PropertyStatus.APPROVED,
        owner_id=p["owner"].id,
        accepts_gcash=True,
        accepts_bpi=True,
        accepts_cash=True,
        gcash_number="09171234567",
        bpi_number="1234567890"
    )
    db.add(prop)
    properties.append(prop)

db.commit()
print(f"✅ Created {len(properties)} properties\n")

# ============================================================================
# SEED BOOKINGS (With varied patterns for ML)
# ============================================================================

print("📅 Creating Bookings...")

today = datetime.now()
bookings = []

def create_booking_pattern(tenant, property, profile):
    """Create booking patterns based on risk profile"""
    bookings_list = []
    
    if profile == "high_risk":
        # High risk: Few bookings, short stays, long gaps
        num_bookings = random.randint(1, 2)
        for i in range(num_bookings):
            days_ago = random.randint(90, 180)  # Long time since last booking
            start = today - timedelta(days=days_ago)
            end = start + timedelta(days=random.randint(7, 14))  # Short stays
            
            booking = models.Booking(
                user_id=tenant.id,
                property_id=property.id,
                start_date=start,
                end_date=end,
                total_amount=property.price_per_month,
                status=models.BookingStatus.COMPLETED if i == 0 else models.BookingStatus.CANCELLED
            )
            bookings_list.append(booking)
    
    elif profile == "medium_risk":
        # Medium risk: Moderate activity, some cancellations
        num_bookings = random.randint(3, 5)
        for i in range(num_bookings):
            days_ago = random.randint(30, 90)
            start = today - timedelta(days=days_ago + (i * 30))
            end = start + timedelta(days=random.randint(20, 35))
            
            status = models.BookingStatus.COMPLETED
            if random.random() < 0.3:  # 30% cancellation rate
                status = models.BookingStatus.CANCELLED
            
            booking = models.Booking(
                user_id=tenant.id,
                property_id=property.id,
                start_date=start,
                end_date=end,
                total_amount=property.price_per_month,
                status=status
            )
            bookings_list.append(booking)
    
    else:  # low_risk
        # Low risk: Frequent bookings, long stays, no cancellations
        num_bookings = random.randint(6, 10)
        for i in range(num_bookings):
            days_ago = random.randint(5, 30)
            start = today - timedelta(days=days_ago + (i * 40))
            end = start + timedelta(days=random.randint(40, 60))  # Long stays
            
            booking = models.Booking(
                user_id=tenant.id,
                property_id=property.id,
                start_date=start,
                end_date=end,
                total_amount=property.price_per_month * 2,  # Pay more (loyal customers)
                status=models.BookingStatus.COMPLETED
            )
            bookings_list.append(booking)
    
    return bookings_list

# Create bookings for each tenant
for tenant in tenants:
    # Assign each tenant to 1-2 properties
    assigned_properties = random.sample(properties, random.randint(1, 2))
    
    for prop in assigned_properties:
        tenant_bookings = create_booking_pattern(tenant, prop, tenant.risk_profile)
        bookings.extend(tenant_bookings)
        
        for booking in tenant_bookings:
            db.add(booking)

db.commit()
print(f"✅ Created {len(bookings)} bookings\n")

# ============================================================================
# SEED PAYMENTS (Matching bookings)
# ============================================================================

print("💳 Creating Payments...")

payments = []
for booking in bookings:
    if booking.status in [models.BookingStatus.COMPLETED, models.BookingStatus.CONFIRMED]:
        # Get tenant's risk profile
        tenant = db.query(models.User).filter(models.User.id == booking.user_id).first()
        
        # High risk tenants: late payments
        if tenant.risk_profile == "high_risk":
            paid_date = booking.start_date + timedelta(days=random.randint(5, 15))  # Late
            status = models.PaymentStatus.COMPLETED if random.random() > 0.3 else models.PaymentStatus.PENDING
        # Medium risk: some late payments
        elif tenant.risk_profile == "medium_risk":
            paid_date = booking.start_date + timedelta(days=random.randint(-2, 7))
            status = models.PaymentStatus.COMPLETED
        # Low risk: always on time
        else:
            paid_date = booking.start_date - timedelta(days=random.randint(1, 5))  # Early
            status = models.PaymentStatus.COMPLETED
        
        payment = models.Payment(
            booking_id=booking.id,
            amount=booking.total_amount,
            payment_method=random.choice(['gcash', 'bpi', 'cash']),
            status=status,
            paid_at=paid_date,
            receipt_number=f"REC-{random.randint(10000, 99999)}"
        )
        db.add(payment)
        payments.append(payment)

db.commit()
print(f"✅ Created {len(payments)} payments\n")

# ============================================================================
# SUMMARY
# ============================================================================

print("="*80)
print("✨ DATABASE SEEDING COMPLETE!")
print("="*80)
print()
print("📊 SUMMARY:")
print(f"   • Users: {len(tenants) + len(owners) + 1}")
print(f"     - Admins: 1")
print(f"     - Owners: {len(owners)}")
print(f"     - Tenants: {len(tenants)}")
print(f"       → High Risk: {len([t for t in tenants if t.risk_profile == 'high_risk'])}")
print(f"       → Medium Risk: {len([t for t in tenants if t.risk_profile == 'medium_risk'])}")
print(f"       → Low Risk: {len([t for t in tenants if t.risk_profile == 'low_risk'])}")
print(f"   • Properties: {len(properties)}")
print(f"   • Bookings: {len(bookings)}")
print(f"   • Payments: {len(payments)}")
print()
print("🔐 LOGIN CREDENTIALS:")
print("   Admin:    admin@sleepingbear.com / admin123")
print("   Owner:    owner1@gmail.com / owner123")
print("   Tenant:   tenant1@gmail.com / tenant123")
print("            (tenant2@gmail.com, tenant3@gmail.com, etc.)")
print()
print("🚀 Now you can test your ML retention model!")
print("   Visit: http://localhost:3000/admin/dashboard")
print("   Then click 'Retention Analytics' in the sidebar")
print()
print("="*80)

db.close()