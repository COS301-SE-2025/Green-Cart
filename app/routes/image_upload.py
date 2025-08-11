from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from typing import List
import os
import uuid
import shutil
from pathlib import Path

router = APIRouter(prefix="/images", tags=["Images"])

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads/products")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Base URL for serving static files
BASE_URL = "http://localhost:8000"

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
    Upload multiple product images
    """
    if len(files) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 images allowed")
    
    uploaded_urls = []
    
    try:
        for file in files:
            # Validate file
            if not validate_image(file):
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid file: {file.filename}. Must be an image under 5MB"
                )
            
            # Generate unique filename
            file_extension = Path(file.filename).suffix.lower()
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            file_path = UPLOAD_DIR / unique_filename
            
            # Save file
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # Generate URL
            file_url = f"{BASE_URL}/static/products/{unique_filename}"
            uploaded_urls.append(file_url)
    
    except Exception as e:
        # Clean up any uploaded files if there was an error
        for url in uploaded_urls:
            try:
                filename = url.split("/")[-1]
                file_path = UPLOAD_DIR / filename
                if file_path.exists():
                    file_path.unlink()
            except:
                pass
        
        raise HTTPException(status_code=500, detail=f"Error uploading images: {str(e)}")
    
    return {
        "status": 201,
        "message": f"Successfully uploaded {len(uploaded_urls)} images",
        "urls": uploaded_urls
    }

@router.delete("/delete/{filename}")
async def delete_image(filename: str):
    """
    Delete a product image
    """
    try:
        file_path = UPLOAD_DIR / filename
        if file_path.exists():
            file_path.unlink()
            return {
                "status": 200,
                "message": "Image deleted successfully"
            }
        else:
            raise HTTPException(status_code=404, detail="Image not found")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting image: {str(e)}")
