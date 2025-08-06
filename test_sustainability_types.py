#!/usr/bin/env python3
"""
Quick test to check what sustainability types exist in the database
"""
import requests

def check_sustainability_types():
    """Check what sustainability types are available"""
    
    # Test with a simple product creation that should show us the available types
    url = "http://localhost:8000/product-images/products/"
    
    # Create a minimal test
    files = {
        'images': ('test.jpg', b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01' + b'\x00' * 100, 'image/jpeg')
    }
    
    data = {
        'name': 'Test Product for Sustainability Types',
        'description': 'Testing sustainability types mapping',
        'price': 10.0,
        'category_id': 1,
        'retailer_id': 1,  # Will fail but we'll see the error
        'stock_quantity': 1,
        # Add all possible sustainability ratings
        'energy_efficiency': 70.0,
        'carbon_footprint': 60.0,
        'recyclability': 20.0,
        'durability': 90.0,
        'material_sustainability': 68.0
    }
    
    print("Testing sustainability types mapping...")
    
    try:
        response = requests.post(url, files=files, data=data)
        print(f"Response Status: {response.status_code}")
        print(f"Response: {response.text[:500]}...")
        
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    check_sustainability_types()
