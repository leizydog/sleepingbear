import sys
import os

# Add the current directory to Python path so we can find 'app'
sys.path.append(os.getcwd())

from app.db.session import engine
from app.models.all_models import Base

def reset_database():
    print("🗑️  Dropping all tables...")
    # This deletes the 'properties' table and everything else
    Base.metadata.drop_all(bind=engine)
    print("✅ Tables dropped.")
    
    print("🏗️  Creating new tables...")
    # This recreates them with the new 'status' and 'images' columns
    Base.metadata.create_all(bind=engine)
    print("✅ Database schema updated successfully!")

if __name__ == "__main__":
    reset_database()