#!/usr/bin/env python3
"""
Test product creation with image upload endpoint.
"""
import requests
import json

# Test data
product_data = {
    "name": "Test Product Alt Fix",
    "description": "Test product to verify alt_text field fix",
    "price": 19.99,
    "quantity": 10,
    "categories": ["Electronics"],
    "sustainability_rating": 4.0,
    "sustainability_types": ["Renewable Energy"],
    "is_active": True
}

def test_product_creation():
    """Test creating a product with image upload."""
    
    # Prepare multipart form data
    files = {
        'product_data': (None, json.dumps(product_data), 'application/json'),
        'images': ('test_image.jpg', open('test_image.jpg', 'rb'), 'image/jpeg')
    }
    
    try:
        print("Testing product creation with image upload...")
        response = requests.post(
            'http://localhost:8000/product-images/products/',
            files=files,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Product created successfully!")
            print(f"Product ID: {data.get('product_id')}")
            if 'uploaded_images' in data:
                print(f"Uploaded images: {data['uploaded_images']}")
        else:
            print(f"❌ Failed to create product")
            
    except Exception as e:
        print(f"❌ Error during test: {e}")
    finally:
        # Close file
        if 'images' in files:
            files['images'][1].close()

if __name__ == "__main__":
    test_product_creation()
