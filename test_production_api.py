#!/usr/bin/env python3
"""
Test retailer signup on the production API to verify the fix
"""
import requests
import json
import random

# Use the production API
API_BASE_URL = "https://api.greencart-cos301.co.za"

def test_production_retailer_signup():
    """Test retailer signup on production API"""
    print("Testing Retailer Signup on Production API")
    print("=" * 42)
    
    # Generate a unique email to avoid conflicts
    unique_id = random.randint(1000, 9999)
    test_data = {
        "name": f"Test Shop {unique_id}",
        "description": f"A test shop created for testing #{unique_id}",
        "email": f"testshop{unique_id}@example.com",
        "password": "testpassword123"
    }
    
    print(f"Testing with email: {test_data['email']}")
    
    # Step 1: Create user account
    print("\n1. Creating user account...")
    try:
        user_response = requests.post(f"{API_BASE_URL}/auth/signup", 
                                    json={
                                        "name": test_data["name"],
                                        "email": test_data["email"],
                                        "password": test_data["password"]
                                    },
                                    timeout=10)
        
        print(f"User signup status: {user_response.status_code}")
        if user_response.status_code == 200:
            print("✅ User created successfully")
        else:
            print(f"❌ User creation failed: {user_response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error during user creation: {e}")
        return False
    
    # Step 2: Convert to retailer
    print("\n2. Converting to retailer...")
    try:
        retailer_response = requests.post(f"{API_BASE_URL}/auth/retailer/signup", 
                                        json={
                                            "name": test_data["name"],
                                            "description": test_data["description"],
                                            "email": test_data["email"],
                                            "password": test_data["password"]
                                        },
                                        timeout=10)
        
        print(f"Retailer signup status: {retailer_response.status_code}")
        if retailer_response.status_code == 200:
            retailer_result = retailer_response.json()
            print("✅ Retailer created successfully")
            print(f"   Retailer ID: {retailer_result.get('id')}")
            print(f"   Name: {retailer_result.get('name')}")
            return True
        else:
            print(f"❌ Retailer creation failed: {retailer_response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error during retailer creation: {e}")
        return False

def test_existing_user_conversion():
    """Test converting an existing user to retailer"""
    print("\n\nTesting Existing User Conversion")
    print("=" * 32)
    
    # Use an email that might already exist (from the frontend form)
    test_data = {
        "name": "John's Updated Shop",
        "description": "Updated shop description",
        "email": "john@example.com",  # This is the email from the screenshot
        "password": "password123"  # Common password
    }
    
    print(f"Testing conversion for: {test_data['email']}")
    
    # Try retailer signup directly (user should already exist)
    print("\n1. Attempting retailer conversion...")
    try:
        retailer_response = requests.post(f"{API_BASE_URL}/auth/retailer/signup", 
                                        json={
                                            "name": test_data["name"],
                                            "description": test_data["description"],
                                            "email": test_data["email"],
                                            "password": test_data["password"]
                                        },
                                        timeout=10)
        
        print(f"Retailer conversion status: {retailer_response.status_code}")
        if retailer_response.status_code == 200:
            retailer_result = retailer_response.json()
            print("✅ Existing user converted to retailer successfully")
            print(f"   Retailer ID: {retailer_result.get('id')}")
            print(f"   Name: {retailer_result.get('name')}")
            return True
        else:
            print(f"❌ Retailer conversion failed: {retailer_response.text}")
            # If it fails, it might be due to wrong password
            if retailer_response.status_code == 401:
                print("💡 This might be due to incorrect password for existing user")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error during retailer conversion: {e}")
        return False

def check_api_health():
    """Check if the production API is accessible"""
    print("Checking Production API Health")
    print("=" * 30)
    
    try:
        health_response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        print(f"API Health status: {health_response.status_code}")
        if health_response.status_code == 200:
            print("✅ Production API is accessible")
            return True
        else:
            print("❌ Production API returned error")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot reach production API: {e}")
        return False

if __name__ == "__main__":
    print("🔗 Testing Production Retailer Signup")
    print("=====================================")
    
    # Check API health first
    api_healthy = check_api_health()
    
    if not api_healthy:
        print("\n❌ Cannot proceed with tests - API is not accessible")
        print("💡 Make sure you're connected to the internet and the API is running")
        exit(1)
    
    # Test new user signup flow
    new_user_success = test_production_retailer_signup()
    
    # Test existing user conversion
    existing_user_success = test_existing_user_conversion()
    
    print("\n" + "=" * 50)
    print("📊 Production Test Results:")
    print(f"✅ API Health: {'PASS' if api_healthy else 'FAIL'}")
    print(f"✅ New user retailer signup: {'PASS' if new_user_success else 'FAIL'}")
    print(f"✅ Existing user conversion: {'PASS' if existing_user_success else 'FAIL'}")
    
    if api_healthy and (new_user_success or existing_user_success):
        print("\n🎉 Production API is working! The frontend should now work correctly.")
        print("💡 If existing user conversion failed, make sure to use the correct password.")
    else:
        print("\n❌ There are still issues with the production API.")
        print("💡 Check the backend logs and ensure the API is properly deployed.")
