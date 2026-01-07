"""
Cloudinary Upload Utility
Handles image uploads to Cloudinary cloud storage
"""
import cloudinary
import cloudinary.uploader
import os
from fastapi import UploadFile, HTTPException

# Validate Cloudinary credentials on startup
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

def validate_cloudinary_config():
    """Validate that all required Cloudinary credentials are present."""
    missing = []
    if not CLOUDINARY_CLOUD_NAME:
        missing.append("CLOUDINARY_CLOUD_NAME")
    if not CLOUDINARY_API_KEY:
        missing.append("CLOUDINARY_API_KEY")
    if not CLOUDINARY_API_SECRET:
        missing.append("CLOUDINARY_API_SECRET")
    
    if missing:
        print(f"⚠️ WARNING: Missing Cloudinary environment variables: {', '.join(missing)}")
        print("   Image uploads will fail until these are configured.")
        return False
    return True

# Check config on module load
CLOUDINARY_CONFIGURED = validate_cloudinary_config()

# Initialize Cloudinary with environment variables
cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
    secure=True
)

async def upload_image_to_cloudinary(file: UploadFile, folder: str = "sleepingbear") -> str:
    """
    Upload an image to Cloudinary and return the secure URL.
    
    Args:
        file: FastAPI UploadFile object
        folder: Cloudinary folder to organize uploads
        
    Returns:
        str: The secure HTTPS URL of the uploaded image
        
    Raises:
        HTTPException: If Cloudinary is not configured or upload fails
    """
    # Check if Cloudinary is configured
    if not CLOUDINARY_CONFIGURED:
        raise HTTPException(
            status_code=503,
            detail="Image upload service is not configured. Please contact administrator."
        )
    
    try:
        # Read file contents
        contents = await file.read()
        
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            contents,
            folder=folder,
            resource_type="auto"  # Auto-detect image/video
        )
        
        # Return the secure URL
        return result.get("secure_url")
        
    except Exception as e:
        print(f"Cloudinary upload error: {e}")
        raise Exception(f"Failed to upload image: {str(e)}")
    finally:
        # Reset file pointer for potential reuse
        await file.seek(0)
