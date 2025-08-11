from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
import os
import uuid
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from typing import List
import shutil
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/images", tags=["Images"])

# Create local images directory as fallback
IMAGES_DIR = "uploads/images"
os.makedirs(IMAGES_DIR, exist_ok=True)

def get_s3_client():
    """Get S3 client with error handling"""
    try:
        return boto3.client(
            's3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION', 'us-east-1')
        )
    except Exception as e:
        print(f"S3 client creation failed: {e}")
        return None

def upload_to_s3(file_content, filename, bucket_name):
    """Upload file to S3 and return public URL"""
    s3_client = get_s3_client()
    
    if not s3_client:
        return None
        
    try:
        # Upload to S3
        s3_client.put_object(
            Bucket=bucket_name,
            Key=f"products/{filename}",
            Body=file_content,
            ContentType="image/jpeg"
            # ACL removed - bucket should have public read policy configured
        )
        
        # Return public URL
        return f"https://{bucket_name}.s3.amazonaws.com/products/{filename}"
        
    except ClientError as e:
        print(f"S3 upload failed: {e}")
        return None

@router.post("/upload")
async def upload_images(files: List[UploadFile] = File(...)):
    """
    Upload multiple images to S3 (with local fallback) and return their URLs
    """
    if len(files) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 images allowed")
    
    uploaded_urls = []
    bucket_name = os.getenv('AWS_S3_BUCKET_NAME')
    use_s3 = bucket_name and os.getenv('AWS_ACCESS_KEY_ID') and os.getenv('AWS_SECRET_ACCESS_KEY')
    
    print(f"🔧 Image Upload Mode: {'AWS S3' if use_s3 else 'Local Storage'}")
    
    for file in files:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail=f"File {file.filename} is not an image")
        
        # Generate unique filename
        file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        
        try:
            # Read file content
            file_content = await file.read()
            
            if use_s3:
                # Try S3 upload first
                s3_url = upload_to_s3(file_content, unique_filename, bucket_name)
                
                if s3_url:
                    uploaded_urls.append(s3_url)
                    print(f"✅ Uploaded to S3: {unique_filename}")
                    continue
                else:
                    print(f"⚠️  S3 upload failed, falling back to local storage for {unique_filename}")
            
            # Fallback to local storage
            file_path = os.path.join(IMAGES_DIR, unique_filename)
            with open(file_path, "wb") as buffer:
                buffer.write(file_content)
            
            # Return local URL
            image_url = f"http://localhost:8000/images/{unique_filename}"
            uploaded_urls.append(image_url)
            print(f"📁 Stored locally: {unique_filename}")
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")
    
    return {
        "status": 200,
        "message": f"Images uploaded successfully to {'S3' if use_s3 else 'local storage'}",
        "urls": uploaded_urls,
        "storage_type": "s3" if use_s3 else "local"
    }

@router.get("/{filename}")
async def get_image(filename: str):
    """
    Serve uploaded images (local fallback only - S3 images are served directly)
    """
    file_path = os.path.join(IMAGES_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    
    return FileResponse(file_path)
