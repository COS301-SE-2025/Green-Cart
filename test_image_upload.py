#!/usr/bin/env python3
"""
Test S3 image upload functionality
"""
import requests
import os
from PIL import Image
import io

def create_test_image():
    """Create a simple test image"""
    # Create a 100x100 pixel image
    img = Image.new('RGB', (100, 100), color='green')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    return img_bytes

def test_image_upload():
    """Test the image upload endpoint"""
    print("🧪 Testing Image Upload with S3")
    print("=" * 40)
    
    # Create test image
    test_image = create_test_image()
    
    # Prepare files for upload
    files = {'files': ('test_image.jpg', test_image, 'image/jpeg')}
    
    try:
        # Upload to the API
        response = requests.post('http://localhost:8001/images/upload', files=files)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Upload successful!")
            print(f"📊 Storage type: {result.get('storage_type', 'unknown')}")
            print(f"🌐 Image URLs:")
            
            for url in result.get('urls', []):
                print(f"   • {url}")
                
                # Test if the URL is accessible
                if 's3.amazonaws.com' in url:
                    print("   ✅ S3 URL detected - images will be accessible to your friend!")
                else:
                    print("   ⚠️ Local URL - images will NOT be accessible to your friend")
                    
            return True
            
        else:
            print(f"❌ Upload failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    test_image_upload()
