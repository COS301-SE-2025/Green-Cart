from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from typing import List
import os
import uuid
import shutil
from pathlib import Path
from app.services.s3_service import s3_service
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.product_images import ProductImage
from app.models.product import Product
import logging

router = APIRouter(prefix="/images", tags=["Images"])
logger = logging.getLogger(__name__)

# Create uploads directory if it doesn't exist (fallback for local development)
UPLOAD_DIR = Path("uploads/products")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Use environment variable for base URL, fallback to production URL
BASE_URL = os.getenv("BASE_URL", "https://api.greencart-cos301.co.za")

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def validate_image(file: UploadFile) -> bool:
    """Validate uploaded image file"""
    # Check file extension
    file_extension = Path(file.filename).suffix.lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        return False
    
    # Check file size
    if file.size and file.size > MAX_FILE_SIZE:
        return False
    
    return True

@router.post("/upload")
async def upload_images(files: List[UploadFile] = File(...)):
    """
    Upload multiple product images to S3
    """
    if len(files) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 images allowed")
    
    try:
        # Validate all files first
        for file in files:
            if not validate_image(file):
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid file: {file.filename}. Must be an image under 5MB"
                )
        
        # Upload to S3
        uploaded_urls = await s3_service.upload_multiple_files(files, "products")
        
        return {
            "status": "success",
            "message": f"Successfully uploaded {len(uploaded_urls)} images",
            "urls": uploaded_urls
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading images: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.delete("/delete")
async def delete_image_by_url(image_url: str):
    """
    Delete a product image from S3 by URL
    """
    try:
        success = s3_service.delete_file(image_url)
        if success:
            return {
                "status": "success",
                "message": "Image deleted successfully"
            }
        else:
            raise HTTPException(status_code=404, detail="Failed to delete image")
    
    except Exception as e:
        logger.error(f"Error deleting image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting image: {str(e)}")
