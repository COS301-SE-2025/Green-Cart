#!/usr/bin/env python3
"""
Test script to debug retailer registration
"""

import requests
import json

# Test data for simple retailer auth
test_retailer_auth = {
    "name": "Test Company",
    "description": "A test company for debugging",
    "email": "test@retailer.com",
    "password": "TestPass123!"
}

# Test data for full retailer registration (requires user_id first)
test_retailer_full = {
    "user_id": "placeholder",
    "name": "Test Company",
    "description": "A test company for debugging"
}

def test_auth_signup():
    """Test the basic auth retailer signup"""
    url = "http://localhost:8000/auth/retailer/signup"
    
    print("Testing auth retailer signup...")
    print(f"URL: {url}")
    print(f"Data: {json.dumps(test_retailer_auth, indent=2)}")
    print("-" * 50)
    
    try:
        response = requests.post(url, json=test_retailer_auth)
        print(f"Status Code: {response.status_code}")
        print(f"Response Text: {response.text}")
        
        if response.status_code == 200:
            print("✅ Auth signup successful!")
            return response.json()
        else:
            print("❌ Auth signup failed!")
            try:
                error_json = response.json()
                print(f"Error details: {json.dumps(error_json, indent=2)}")
            except:
                print("Could not parse error as JSON")
                
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend. Is it running on port 8000?")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
    
    return None

def test_user_signup():
    """Test regular user signup first"""
    url = "http://localhost:8000/auth/signup"
    
    user_data = {
        "name": "John Doe",
        "email": "test@retailer.com",
        "password": "TestPass123!"
    }
    
    print("Testing user signup first...")
    print(f"URL: {url}")
    print(f"Data: {json.dumps(user_data, indent=2)}")
    print("-" * 50)
    
    try:
        response = requests.post(url, json=user_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response Text: {response.text}")
        
        if response.status_code == 200:
            print("✅ User signup successful!")
            return response.json()
        else:
            print("❌ User signup failed!")
            try:
                error_json = response.json()
                print(f"Error details: {json.dumps(error_json, indent=2)}")
            except:
                print("Could not parse error as JSON")
                
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
    
    return None

def test_retailer_registration_flow():
    """Test the complete retailer registration flow"""
    
    print("=== STEP 1: User Signup ===")
    user_result = test_user_signup()
    
    if user_result and 'id' in user_result:
        print(f"\n=== STEP 2: Auth Retailer Signup ===")
        auth_result = test_auth_signup()
        
        print(f"\n=== STEP 3: Full Retailer Registration ===")
        # This would require file upload, so let's just check if endpoint exists
        url = "http://localhost:8000/retailer/register"
        print(f"Full registration endpoint exists at: {url}")
        print("(This requires form-data with file upload)")
    
def test_basic_endpoints():
    """Test basic endpoints to ensure backend is responding"""
    endpoints = [
        "http://localhost:8000/health",
        "http://localhost:8000/docs",
    ]
    
    for url in endpoints:
        try:
            response = requests.get(url)
            print(f"✅ {url}: {response.status_code}")
        except Exception as e:
            print(f"❌ {url}: {e}")

if __name__ == "__main__":
    print("=== Testing Basic Endpoints ===")
    test_basic_endpoints()
    print("\n=== Testing Retailer Registration Flow ===")
    test_retailer_registration_flow()
