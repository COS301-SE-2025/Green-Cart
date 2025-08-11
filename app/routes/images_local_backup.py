from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
import os
import uuid
from typing import List
import shutil

router = APIRouter(prefix="/images", tags=["Images"])

# Create images directory if it doesn't exist
IMAGES_DIR = "uploads/images"
os.makedirs(IMAGES_DIR, exist_ok=True)

@router.post("/upload")
async def upload_images(files: List[UploadFile] = File(...)):
    """
    Upload multiple images and return their URLs
    """
    if len(files) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 images allowed")
    
    uploaded_urls = []
    
    for file in files:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail=f"File {file.filename} is not an image")
        
        # Generate unique filename
        file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(IMAGES_DIR, unique_filename)
        
        # Save file
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # Return the URL to access the image
            image_url = f"http://localhost:8000/images/{unique_filename}"
            uploaded_urls.append(image_url)
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")
    
    return {
        "status": 200,
        "message": "Images uploaded successfully",
        "urls": uploaded_urls
    }

@router.get("/{filename}")
async def get_image(filename: str):
    """
    Serve uploaded images
    """
    file_path = os.path.join(IMAGES_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    
    return FileResponse(file_path)
