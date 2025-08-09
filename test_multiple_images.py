#!/usr/bin/env python3
"""
Test script to verify multiple image functionality
"""

import requests
import io
from PIL import Image
import json

def create_test_image(color, size=(200, 200), format='JPEG'):
    """Create a simple colored test image"""
    img = Image.new('RGB', size, color=color)
    img_bytes = io.BytesIO()
    img.save(img_bytes, format=format)
    img_bytes.seek(0)
    return img_bytes.getvalue()

def test_multiple_images():
    """Test creating a product with multiple images"""
    
    # Create test images
    red_image = create_test_image('red')
    blue_image = create_test_image('blue') 
    green_image = create_test_image('green')
    
    # Prepare the form data
    data = {
        'name': 'Multi-Image Test Product',
        'description': 'Testing multiple image upload functionality',
        'price': 299.99,
        'category_id': 1,  # Electronics
        'retailer_id': 3,
        'stock_quantity': 10,
        'energy_efficiency': 85,
        'carbon_footprint': 75,
        'recyclability': 90,
        'durability': 80,
        'material_sustainability': 88
    }
    
    # Prepare the files
    files = [
        ('images', ('red_test.jpg', red_image, 'image/jpeg')),
        ('images', ('blue_test.jpg', blue_image, 'image/jpeg')),
        ('images', ('green_test.jpg', green_image, 'image/jpeg'))
    ]
    
    print("🧪 Testing Multiple Image Upload...")
    print("=" * 50)
    
    try:
        # Make the request
        response = requests.post(
            'http://localhost:8000/product-images/products/',
            files=files,
            data=data,
            timeout=30
        )
        
        if response.status_code == 201:
            result = response.json()
            product_id = result.get('product_id')
            images_uploaded = result.get('images_uploaded', 0)
            
            print(f"✅ SUCCESS! Product created with ID: {product_id}")
            print(f"📸 Images uploaded: {images_uploaded}")
            print(f"📊 Sustainability ratings: {result.get('sustainability_ratings_added', 0)}")
            
            # Test fetching the product to verify images
            print(f"\n🔍 Fetching product {product_id} to verify images...")
            
            fetch_response = requests.post(
                'http://localhost:8000/products/FetchProduct',
                json={'product_id': product_id},
                timeout=15
            )
            
            if fetch_response.status_code == 200:
                fetch_result = fetch_response.json()
                images = fetch_result.get('images', [])
                print(f"✅ Product fetch successful!")
                print(f"📸 Images found: {len(images)}")
                for i, img_url in enumerate(images, 1):
                    print(f"   Image {i}: {img_url}")
                
                if len(images) == 3:
                    print("🎉 Multiple image functionality working correctly!")
                else:
                    print(f"⚠️  Expected 3 images, found {len(images)}")
            else:
                print(f"❌ Failed to fetch product: {fetch_response.status_code}")
                print(fetch_response.text)
                
        else:
            print(f"❌ FAILED! Status: {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"💥 ERROR: {str(e)}")

if __name__ == "__main__":
    test_multiple_images()
