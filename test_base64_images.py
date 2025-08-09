#!/usr/bin/env python3
"""
Test script to verify base64 image handling works correctly.
This script tests the product creation with base64 images.
"""

import requests
import base64
import json

# Create a simple test base64 image (1x1 pixel PNG)
def create_test_base64_image():
    # This is a minimal 1x1 pixel transparent PNG in base64
    test_png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    return test_png

def test_product_creation_with_base64():
    """Test creating a product with base64 images"""
    
    # Test product data with both base64 and URL images
    product_data = {
        "name": "Test Product with Mixed Images",
        "description": "This is a test product to verify base64 and URL image storage",
        "price": 29.99,
        "quantity": 10,
        "brand": "Test Brand",
        "category_id": 1,
        "retailer_id": 3,
        "sustainability_metrics": [],
        "images": [
            create_test_base64_image(),  # Base64 image
            "https://via.placeholder.com/300x200.png?text=Test+Image",  # URL image
            create_test_base64_image()   # Another base64 image
        ]
    }
    
    # API endpoint
    url = "http://localhost:8000/retailer/products"
    
    try:
        response = requests.post(
            url,
            headers={"Content-Type": "application/json"},
            json=product_data
        )
        
        print(f"Response Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ SUCCESS: Product created with base64 images!")
            result = response.json()
            if result.get("image_url"):
                print(f"✅ Image URL stored: {result['image_url'][:50]}...")
        else:
            print("❌ FAILED: Product creation failed")
            
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    print("Testing Base64 Image Storage...")
    test_product_creation_with_base64()
