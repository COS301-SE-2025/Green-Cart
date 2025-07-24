#!/usr/bin/env python3
import os
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from dotenv import load_dotenv

load_dotenv()

def test_s3_configuration():
    """Test S3 setup and configuration"""
    print("🧪 Testing AWS S3 Configuration")
    print("=" * 40)
    
    # Check environment variables
    print("1️⃣  Checking Environment Variables...")
    aws_access_key = os.getenv('AWS_ACCESS_KEY_ID')
    aws_secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')
    aws_region = os.getenv('AWS_REGION')
    bucket_name = os.getenv('AWS_S3_BUCKET_NAME')
    
    missing_vars = []
    if not aws_access_key: missing_vars.append('AWS_ACCESS_KEY_ID')
    if not aws_secret_key: missing_vars.append('AWS_SECRET_ACCESS_KEY')
    if not bucket_name: missing_vars.append('AWS_S3_BUCKET_NAME')
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        return False
    
    print(f"✅ AWS Access Key: {aws_access_key[:10]}...")
    print(f"✅ AWS Region: {aws_region}")
    print(f"✅ S3 Bucket: {bucket_name}")
    
    # Test S3 connection
    print("\n2️⃣  Testing S3 Connection...")
    try:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=aws_access_key,
            aws_secret_access_key=aws_secret_key,
            region_name=aws_region
        )
        
        # Test bucket access
        s3_client.head_bucket(Bucket=bucket_name)
        print(f"✅ Successfully connected to bucket: {bucket_name}")
        
        # Test bucket location
        location = s3_client.get_bucket_location(Bucket=bucket_name)
        bucket_region = location['LocationConstraint'] or 'us-east-1'
        print(f"✅ Bucket region: {bucket_region}")
        
        if bucket_region != aws_region:
            print(f"⚠️  Warning: Bucket region ({bucket_region}) differs from configured region ({aws_region})")
        
        # Test bucket policy
        try:
            policy = s3_client.get_bucket_policy(Bucket=bucket_name)
            print("✅ Bucket policy is configured for public read access")
        except s3_client.exceptions.NoSuchBucketPolicy:
            print("⚠️  No bucket policy found - images may not be publicly accessible")
        
        # Test upload permissions
        try:
            # Try to upload a small test file
            test_content = b"test image content"
            test_key = "test/connection-test.txt"
            
            s3_client.put_object(
                Bucket=bucket_name,
                Key=test_key,
                Body=test_content,
                ContentType='text/plain',
                ACL='public-read'
            )
            
            # Generate public URL
            test_url = f"https://{bucket_name}.s3.{aws_region}.amazonaws.com/{test_key}"
            print(f"✅ Upload test successful")
            print(f"📷 Test file URL: {test_url}")
            
            # Clean up test file
            s3_client.delete_object(Bucket=bucket_name, Key=test_key)
            print("✅ Cleanup successful")
            
        except Exception as e:
            print(f"⚠️  Upload test failed: {e}")
            print("   This may indicate permission issues")
        
        return True
        
    except NoCredentialsError:
        print("❌ AWS credentials not found or invalid")
        return False
    except ClientError as e:
        error_code = e.response['Error']['Code']
        print(f"❌ S3 connection failed: {error_code}")
        
        if error_code == 'NoSuchBucket':
            print(f"   Bucket '{bucket_name}' does not exist")
        elif error_code == 'AccessDenied':
            print(f"   Access denied to bucket '{bucket_name}'")
        elif error_code == 'InvalidAccessKeyId':
            print(f"   Invalid AWS Access Key ID")
        elif error_code == 'SignatureDoesNotMatch':
            print(f"   Invalid AWS Secret Access Key")
        
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = test_s3_configuration()
    
    if success:
        print("\n🎉 S3 setup is ready!")
        print("\n🎯 Next steps:")
        print("1. Run migration to move data to AWS RDS")
        print("2. Test image upload via your application")
        print("3. Monitor AWS usage to stay within free tier")
    else:
        print("\n❌ Please fix S3 configuration issues before proceeding")
