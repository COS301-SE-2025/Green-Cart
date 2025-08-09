#!/usr/bin/env python3

"""
Quick test script to verify EditProduct functionality
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_retailer_products_fetch():
    """Test that retailer products include images array"""
    try:
        # This would need a valid retailer_id
        response = requests.get(f"{BASE_URL}/retailer/products/1")  # Replace with actual retailer ID
        if response.status_code == 200:
            products = response.json()
            if products:
                first_product = products[0]
                print("Sample product structure:")
                print(f"ID: {first_product.get('id')}")
                print(f"Name: {first_product.get('name')}")
                print(f"Has images array: {'images' in first_product}")
                print(f"Images: {first_product.get('images', [])}")
                print(f"Has image_url: {'image_url' in first_product}")
                print(f"Image URL: {first_product.get('image_url')}")
                return True
        else:
            print(f"Failed to fetch products: {response.status_code}")
            return False
    except Exception as e:
        print(f"Error testing retailer products: {e}")
        return False

def test_sustainability_ratings():
    """Test sustainability ratings fetch"""
    try:
        # This would need a valid product_id
        payload = {"product_id": 1}  # Replace with actual product ID
        response = requests.post(f"{BASE_URL}/sustainability/ratings", json=payload)
        if response.status_code == 200:
            result = response.json()
            print("\nSustainability ratings structure:")
            print(f"Status: {result.get('status')}")
            print(f"Rating: {result.get('rating')}")
            print(f"Statistics count: {len(result.get('statistics', []))}")
            if result.get('statistics'):
                print("Sample statistic:")
                stat = result['statistics'][0]
                print(f"  Type: {stat.get('type')}")
                print(f"  Value: {stat.get('value')}")
            return True
        else:
            print(f"Failed to fetch sustainability ratings: {response.status_code}")
            return False
    except Exception as e:
        print(f"Error testing sustainability ratings: {e}")
        return False

if __name__ == "__main__":
    print("Testing EditProduct functionality...")
    print("=" * 50)
    
    # Test API endpoint availability
    try:
        response = requests.get(f"{BASE_URL}/docs")
        if response.status_code == 200:
            print("✅ API server is running")
        else:
            print("❌ API server not responding correctly")
            exit(1)
    except Exception as e:
        print(f"❌ Cannot connect to API server: {e}")
        exit(1)
    
    # Run tests
    print("\n1. Testing retailer products fetch...")
    test_retailer_products_fetch()
    
    print("\n2. Testing sustainability ratings...")
    test_sustainability_ratings()
    
    print("\n✅ Tests completed!")
    print("\nTo test EditProduct manually:")
    print("1. Open the frontend application")
    print("2. Navigate to retailer products")
    print("3. Click edit on a product with images")
    print("4. Verify sustainability ratings are loaded correctly")
    print("5. Edit without changing images and verify they are preserved")
