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
        if not BOTO3_AVAILABLE:
            raise ImportError("boto3 is required for S3 operations. Please install boto3: pip install boto3")
            
        # Get environment variables
        self.aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
        self.aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
        self.aws_region = os.getenv('AWS_REGION')
        self.bucket_name = os.getenv('AWS_S3_BUCKET_NAME')
        
        # Validate required environment variables
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
            raise ValueError(f"Missing required AWS environment variables: {', '.join(missing_vars)}")
        
        try:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=self.aws_access_key_id,
                aws_secret_access_key=self.aws_secret_access_key,
                region_name=self.aws_region
            )
            self.base_url = f"https://{self.bucket_name}.s3.{self.aws_region}.amazonaws.com"
        except Exception as e:
            raise ValueError(f"Failed to initialize S3 client: {str(e)}")

    async def upload_file(self, file: UploadFile, folder: str = "products") -> str:
        """Upload a single file to S3 and return the URL"""
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
        urls = []
        for file in files:
            # Reset file position for each upload
            await file.seek(0)
            url = await self.upload_file(file, folder)
            urls.append(url)
        return urls

    def delete_file(self, file_url: str) -> bool:
        """Delete a file from S3 using its URL"""
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

# Create singleton instance
s3_service = S3Service()
