#!/usr/bin/env python3
"""
Test script to simulate frontend product creation with sustainability ratings
"""
import requests
import io

def create_test_image():
    """Create a simple test file that mimics an image"""
    fake_jpeg = b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01' + b'\x00' * 100
    return io.BytesIO(fake_jpeg)

def test_with_frontend_data():
    """Test with data format similar to frontend"""
    url = "http://localhost:8000/product-images/products/"
    
    # Create test image
    test_image = create_test_image()
    
    # Use existing category and retailer from your database
    files = {
        'images': ('test_product.jpg', test_image, 'image/jpeg')
    }
    
    # Simulate frontend data with high sustainability scores like in your screenshot
    data = {
        'name': 'Test Frontend Product',
        'description': 'Testing sustainability ratings from frontend format',
        'price': 99.99,
        'category_id': 1,  # Try with existing category
        # 'retailer_id': None,  # Don't send retailer_id for now
        'stock_quantity': 5,
        # Sustainability ratings matching your frontend values
        'energy_efficiency': 70.0,  # From your screenshot
        'carbon_footprint': 60.0,   # From your screenshot  
        'recyclability': 20.0,      # From your screenshot
        'durability': 90.0,         # From your screenshot
        'material_sustainability': 68.0  # From your screenshot
    }
    
    print("Testing with frontend-like data...")
    print(f"Data: {data}")
    
    try:
        response = requests.post(url, files=files, data=data)
        
        print(f"\nResponse Status: {response.status_code}")
        print(f"Response Content: {response.text}")
        
        if response.status_code == 201:
            result = response.json()
            print("\n✅ SUCCESS!")
            print(f"   Product ID: {result.get('product_id')}")
            print(f"   Sustainability Ratings Added: {result.get('sustainability_ratings_added')}")
        else:
            print(f"\n❌ FAILED! Status: {response.status_code}")
            
    except Exception as e:
        print(f"\n💥 ERROR: {str(e)}")

if __name__ == "__main__":
    test_with_frontend_data()
