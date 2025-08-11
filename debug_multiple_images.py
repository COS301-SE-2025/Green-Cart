#!/usr/bin/env python3
"""
Test multiple image upload to debug the issue
"""

import requests
import io
from PIL import Image

def create_test_image(color, size=(100, 100), format='JPEG'):
    """Create a simple colored test image"""
    img = Image.new('RGB', size, color=color)
    img_bytes = io.BytesIO()
    img.save(img_bytes, format=format)
    img_bytes.seek(0)
    return img_bytes.getvalue()

def test_debug_multiple_images():
    """Test with multiple images to see what backend receives"""
    
    print("🧪 DEBUG: Testing Multiple Image Upload...")
    print("=" * 50)
    
    # Create 3 different colored test images
    red_image = create_test_image('red')
    blue_image = create_test_image('blue') 
    green_image = create_test_image('green')
    
    # Prepare the form data (minimal for testing)
    data = {
        'name': 'DEBUG Multiple Image Test',
        'description': 'Testing multiple image upload for debugging',
        'price': 99.99,
        'category_id': 1,  # Electronics
        'retailer_id': 3,
        'stock_quantity': 5,
        'energy_efficiency': 80,
        'carbon_footprint': 75,
        'recyclability': 85,
        'durability': 90,
        'material_sustainability': 88
    }
    
    # Prepare multiple files with the same field name
    files = [
        ('images', ('red_debug.jpg', red_image, 'image/jpeg')),
        ('images', ('blue_debug.jpg', blue_image, 'image/jpeg')),
        ('images', ('green_debug.jpg', green_image, 'image/jpeg'))
    ]
    
    print(f"📤 Sending {len(files)} images to backend...")
    print("Files being sent:")
    for i, (field, (filename, _, content_type)) in enumerate(files, 1):
        print(f"  {i}. Field: {field}, Filename: {filename}, Type: {content_type}")
    
    try:
        response = requests.post(
            'http://localhost:8000/product-images/products/',
            files=files,
            data=data,
            timeout=30
        )
        
        print(f"\n📥 Response Status: {response.status_code}")
        
        if response.status_code == 201:
            result = response.json()
            print("✅ SUCCESS!")
            print(f"Product ID: {result.get('product_id')}")
            print(f"Images uploaded: {result.get('images_uploaded', 'Not reported')}")
            
            # Now fetch the product to see images
            product_id = result.get('product_id')
            if product_id:
                print(f"\n🔍 Fetching product {product_id} to verify images...")
                fetch_response = requests.post(
                    'http://localhost:8000/products/FetchProduct',
                    json={'product_id': product_id},
                    timeout=15
                )
                
                if fetch_response.status_code == 200:
                    fetch_result = fetch_response.json()
                    images = fetch_result.get('images', [])
                    print(f"📸 Images found in database: {len(images)}")
                    for i, img_url in enumerate(images, 1):
                        print(f"   Image {i}: {img_url}")
                else:
                    print(f"❌ Failed to fetch product: {fetch_response.status_code}")
        else:
            print("❌ FAILED!")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"💥 ERROR: {str(e)}")
    
    print("\n" + "=" * 50)
    print("🔍 Check the backend logs for debug information")

if __name__ == "__main__":
    test_debug_multiple_images()
