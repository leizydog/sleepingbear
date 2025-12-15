"""
Cloudinary Upload Utility
Handles image uploads to Cloudinary cloud storage
"""
import cloudinary
import cloudinary.uploader
import os
from fastapi import UploadFile

# Initialize Cloudinary with environment variables
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
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
    """
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
