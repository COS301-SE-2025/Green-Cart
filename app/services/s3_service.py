import boto3
import os
import uuid
from typing import List
from fastapi import HTTPException, UploadFile
from botocore.exceptions import ClientError

class S3Service:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION')
        )
        self.bucket_name = os.getenv('AWS_S3_BUCKET_NAME')
        self.base_url = f"https://{self.bucket_name}.s3.{os.getenv('AWS_REGION')}.amazonaws.com"

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
                ContentType=file.content_type or 'image/jpeg',
                ACL='public-read'  # Make files publicly readable
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
