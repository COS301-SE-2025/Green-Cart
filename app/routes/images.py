from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
from app.services.s3_service import s3_service

router = APIRouter(prefix="/images", tags=["Images"])

@router.post("/upload")
async def upload_images(files: List[UploadFile] = File(...)):
    """Upload multiple images to S3"""
    try:
        # Validate files
        for file in files:
            if not file.content_type or not file.content_type.startswith('image/'):
                raise HTTPException(status_code=400, detail=f"File {file.filename} is not a valid image")
            
            # Check file size (e.g., max 10MB)
            if file.size and file.size > 10 * 1024 * 1024:
                raise HTTPException(status_code=400, detail=f"File {file.filename} is too large (max 10MB)")
        
        # Upload files to S3
        urls = await s3_service.upload_multiple_files(files, folder="products")
        
        return {
            "status": 200,
            "message": "Images uploaded successfully",
            "urls": urls
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.post("/upload-single")
async def upload_single_image(file: UploadFile = File(...)):
    """Upload a single image to S3"""
    try:
        # Validate file
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File is not a valid image")
        
        # Upload to S3
        url = await s3_service.upload_file(file, folder="products")
        
        return {
            "status": 200,
            "message": "Image uploaded successfully",
            "url": url
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.delete("/delete")
async def delete_image(image_url: str):
    """Delete an image from S3"""
    try:
        success = s3_service.delete_file(image_url)
        
        if success:
            return {
                "status": 200,
                "message": "Image deleted successfully"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to delete image")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")