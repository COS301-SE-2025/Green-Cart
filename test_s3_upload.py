#!/usr/bin/env python3
"""
Test script to verify S3 image upload functionality
"""
import requests
import os
from pathlib import Path

# API endpoint for image upload
UPLOAD_URL = "https://api.greencart-cos301.co.za/images/upload"

def test_s3_upload():
    """Test the S3 image upload endpoint"""
    
    # Create a small test image file
    test_image_content = b"dummy image data for testing"
    test_file_path = "test_image.jpg"
    
    try:
        # Write test file
        with open(test_file_path, 'wb') as f:
            f.write(test_image_content)
        
        # Test upload
        with open(test_file_path, 'rb') as f:
            files = {'files': ('test_image.jpg', f, 'image/jpeg')}
            
            print("Testing S3 image upload...")
            response = requests.post(UPLOAD_URL, files=files)
            
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 200:
                result = response.json()
                if 'urls' in result:
                    print(f"✅ Upload successful! URLs: {result['urls']}")
                    return True
                else:
                    print(f"❌ Unexpected response format: {result}")
                    return False
            else:
                print(f"❌ Upload failed with status {response.status_code}")
                return False
                
    except Exception as e:
        print(f"❌ Error during test: {str(e)}")
        return False
    finally:
        # Clean up test file
        if os.path.exists(test_file_path):
            os.remove(test_file_path)

def test_backend_connection():
    """Test basic connection to the backend"""
    try:
        response = requests.get("https://api.greencart-cos301.co.za/")
        print(f"Backend connection test - Status: {response.status_code}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Backend connection failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🧪 Testing S3 Image Upload Integration")
    print("=" * 50)
    
    print("\n1. Testing backend connection...")
    if test_backend_connection():
        print("✅ Backend is accessible")
    else:
        print("❌ Backend is not accessible")
        exit(1)
    
    print("\n2. Testing S3 image upload...")
    if test_s3_upload():
        print("\n🎉 All tests passed! S3 upload is working correctly.")
    else:
        print("\n❌ S3 upload test failed. Check backend logs and S3 configuration.")
