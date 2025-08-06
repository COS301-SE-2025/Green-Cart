#!/usr/bin/env python3
"""
Test script to verify product creation with sustainability ratings
"""
import requests
import io

def create_test_image():
    """Create a simple test file that mimics an image"""
    # Create a simple fake JPEG header for testing
    fake_jpeg = b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01' + b'\x00' * 100
    return io.BytesIO(fake_jpeg)

def test_product_creation_with_sustainability():
    """Test creating a product with sustainability ratings"""
    url = "http://localhost:8000/product-images/products/"
    
    # Create test image
    test_image = create_test_image()
    
    # Prepare form data
    files = {
        'images': ('test_sustainability.jpg', test_image, 'image/jpeg')
    }
    
    data = {
        'name': 'Eco-Friendly Test Product',
        'description': 'A test product with sustainability ratings',
        'price': 29.99,
        'category_id': 1,  # Assuming category 1 exists
        'retailer_id': 1,  # Assuming retailer 1 exists
        'stock_quantity': 10,
        # Sustainability ratings
        'carbon_footprint': 3.5,
        'recyclability': 4.2,
        'energy_efficiency': 4.0,
        'water_usage': 2.8
    }
    
    print("Testing product creation with sustainability ratings...")
    print(f"URL: {url}")
    print(f"Data: {data}")
    
    try:
        response = requests.post(url, files=files, data=data)
        
        print(f"\nResponse Status: {response.status_code}")
        print(f"Response Content: {response.text}")
        
        if response.status_code == 201:
            result = response.json()
            print("\n✅ SUCCESS! Product created with sustainability ratings:")
            print(f"   Product ID: {result.get('product_id')}")
            print(f"   Product Name: {result.get('product_name')}")
            print(f"   Images Uploaded: {result.get('total_images')}")
            print(f"   Sustainability Ratings Added: {result.get('sustainability_ratings_added')}")
            print(f"   Image URLs: {result.get('image_urls')}")
        else:
            print(f"\n❌ FAILED! Status code: {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"\n💥 ERROR: {str(e)}")

if __name__ == "__main__":
    test_product_creation_with_sustainability()
