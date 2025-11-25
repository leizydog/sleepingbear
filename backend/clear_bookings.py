import sys, os
sys.path.append(os.getcwd())
from app.db.session import SessionLocal
from app.models import all_models as models

db = SessionLocal()
db.query(models.Payment).delete()
db.query(models.Booking).delete()
db.commit()
print("✅ All bookings/payments cleared. Properties are open.")
db.close()