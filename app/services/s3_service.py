import os
import uuid
from typing import List
from fastapi import HTTPException, UploadFile

# Try to import required dependencies
try:
    import boto3
    from botocore.exceptions import ClientError
    BOTO3_AVAILABLE = True
except ImportError:
    BOTO3_AVAILABLE = False
    boto3 = None
    ClientError = Exception

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # dotenv not available, environment variables should be set directly
    pass

class S3Service:
    def __init__(self):
        self.is_configured = False
        self.s3_client = None
        self.base_url = None
        self.bucket_name = None
        
        if not BOTO3_AVAILABLE:
            print("WARNING: boto3 is not available. S3 operations will be disabled.")
            return
            
        # Get environment variables
        self.aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
        self.aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
        self.aws_region = os.getenv('AWS_REGION')
        self.bucket_name = os.getenv('AWS_S3_BUCKET_NAME')
        
        # Check if required environment variables are present
        missing_vars = []
        if not self.aws_access_key_id:
            missing_vars.append('AWS_ACCESS_KEY_ID')
        if not self.aws_secret_access_key:
            missing_vars.append('AWS_SECRET_ACCESS_KEY')
        if not self.aws_region:
            missing_vars.append('AWS_REGION')
        if not self.bucket_name:
            missing_vars.append('AWS_S3_BUCKET_NAME')
            
        if missing_vars:
            print(f"WARNING: Missing required AWS environment variables: {', '.join(missing_vars)}. S3 operations will be disabled.")
            return
        
        try:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=self.aws_access_key_id,
                aws_secret_access_key=self.aws_secret_access_key,
                region_name=self.aws_region
            )
            self.base_url = f"https://{self.bucket_name}.s3.{self.aws_region}.amazonaws.com"
            self.is_configured = True
        except Exception as e:
            print(f"WARNING: Failed to initialize S3 client: {str(e)}. S3 operations will be disabled.")
            return

    async def upload_file(self, file: UploadFile, folder: str = "products") -> str:
        """Upload a single file to S3 and return the URL"""
        if not self.is_configured:
            raise HTTPException(status_code=503, detail="S3 service is not properly configured")
            
        try:
            # Generate unique filename
            file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
            unique_filename = f"{uuid.uuid4()}.{file_extension}"
            object_key = f"{folder}/{unique_filename}"
            
            # Read file content
            file_content = await file.read()
            
            # Upload to S3
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=object_key,
                Body=file_content,
                ContentType=file.content_type or 'image/jpeg'
            )
            
            # Return the public URL
            return f"{self.base_url}/{object_key}"
            
        except ClientError as e:
            raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Upload error: {str(e)}")

    async def upload_multiple_files(self, files: List[UploadFile], folder: str = "products") -> List[str]:
        """Upload multiple files to S3 and return list of URLs"""
        if not self.is_configured:
            raise HTTPException(status_code=503, detail="S3 service is not properly configured")
            
        urls = []
        for file in files:
            # Reset file position for each upload
            await file.seek(0)
            url = await self.upload_file(file, folder)
            urls.append(url)
        return urls

    def delete_file(self, file_url: str) -> bool:
        """Delete a file from S3 using its URL"""
        if not self.is_configured:
            return False
            
        try:
            # Extract object key from URL
            object_key = file_url.replace(f"{self.base_url}/", "")
            
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=object_key
            )
            return True
        except ClientError as e:
            print(f"Failed to delete file: {str(e)}")
            return False
    
    def is_available(self) -> bool:
        """Check if S3 service is available and properly configured"""
        if not BOTO3_AVAILABLE or not self.is_configured:
            return False
            
        try:
            # Try to list objects in the bucket (this is a low-cost operation)
            self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                MaxKeys=1
            )
            return True
        except Exception:
            return False

# Create singleton instance
s3_service = S3Service()
