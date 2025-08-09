#!/usr/bin/env python3
"""
Test the actual retailer signup issue with existing email
"""
import requests
import json

API_BASE_URL = "http://localhost:8000"

def test_existing_user_retailer_signup():
    """Test creating a retailer account for an existing user"""
    print("Testing Retailer Signup with Existing Email")
    print("=" * 45)
    
    # Use an email that we know exists (from previous tests)
    existing_email = "john@example.com"  # This is likely from the frontend form
    test_data = {
        "name": "John's Shop",
        "description": "Shop for John who already has a user account",
        "email": existing_email,
        "password": "password123"  # Assuming this is the current password
    }
    
    print(f"Attempting to create retailer for: {existing_email}")
    
    # Step 1: Try user signup (should fail with "already registered")
    print("\n1. Attempting user signup (expected to fail)...")
    user_response = requests.post(f"{API_BASE_URL}/auth/signup", json={
        "name": test_data["name"],
        "email": test_data["email"],
        "password": test_data["password"]
    })
    
    print(f"User signup status: {user_response.status_code}")
    if user_response.status_code == 400:
        user_error = user_response.json()
        print(f"✅ Expected error: {user_error.get('detail')}")
    else:
        print(f"Unexpected response: {user_response.text}")
    
    # Step 2: Try retailer signup directly
    print("\n2. Attempting retailer signup for existing user...")
    retailer_response = requests.post(f"{API_BASE_URL}/auth/retailer/signup", json={
        "name": test_data["name"],
        "description": test_data["description"],
        "email": test_data["email"],
        "password": test_data["password"]
    })
    
    print(f"Retailer signup status: {retailer_response.status_code}")
    if retailer_response.status_code == 200:
        retailer_result = retailer_response.json()
        print(f"✅ Retailer created successfully!")
        print(f"   Retailer ID: {retailer_result.get('id')}")
        print(f"   Name: {retailer_result.get('name')}")
        print(f"   User ID: {retailer_result.get('user_id')}")
        return True
    else:
        print(f"❌ Retailer signup failed: {retailer_response.text}")
        return False

def test_signin_after_retailer_creation():
    """Test signing in after retailer creation"""
    print("\n\n3. Testing signin after retailer creation...")
    
    signin_response = requests.post(f"{API_BASE_URL}/auth/retailer/signin", json={
        "email": "john@example.com",
        "password": "password123"
    })
    
    print(f"Signin status: {signin_response.status_code}")
    if signin_response.status_code == 200:
        signin_result = signin_response.json()
        print(f"✅ Signin successful!")
        print(f"   User: {signin_result.get('user_name')}")
        print(f"   Email: {signin_result.get('email')}")
        print(f"   Shops: {len(signin_result.get('shops', []))}")
        
        for shop in signin_result.get('shops', []):
            print(f"     - {shop.get('name')} (ID: {shop.get('id')})")
        return True
    else:
        print(f"❌ Signin failed: {signin_response.text}")
        return False

def test_with_different_email():
    """Test with a completely new email"""
    print("\n\nTesting with New Email")
    print("=" * 22)
    
    new_email = f"newuser_{len(str(requests.get(f'{API_BASE_URL}/health').text))}@test.com"
    test_data = {
        "name": "New User Shop",
        "description": "Shop for brand new user",
        "email": new_email,
        "password": "newpassword123"
    }
    
    print(f"Testing with new email: {new_email}")
    
    # Step 1: User signup (should succeed)
    print("\n1. Creating new user...")
    user_response = requests.post(f"{API_BASE_URL}/auth/signup", json={
        "name": test_data["name"],
        "email": test_data["email"],
        "password": test_data["password"]
    })
    
    if user_response.status_code == 200:
        print("✅ New user created successfully")
    else:
        print(f"❌ User creation failed: {user_response.text}")
        return False
    
    # Step 2: Retailer signup
    print("2. Converting to retailer...")
    retailer_response = requests.post(f"{API_BASE_URL}/auth/retailer/signup", json={
        "name": test_data["name"],
        "description": test_data["description"],
        "email": test_data["email"],
        "password": test_data["password"]
    })
    
    if retailer_response.status_code == 200:
        print("✅ New user converted to retailer successfully")
        return True
    else:
        print(f"❌ Retailer conversion failed: {retailer_response.text}")
        return False

if __name__ == "__main__":
    print("🔍 Investigating Retailer Signup Issue")
    print("=====================================")
    
    # Test with existing email (the main issue)
    existing_success = test_existing_user_retailer_signup()
    
    if existing_success:
        signin_success = test_signin_after_retailer_creation()
    else:
        signin_success = False
    
    # Test with new email to verify the flow works
    new_user_success = test_with_different_email()
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"✅ Existing user to retailer: {'PASS' if existing_success else 'FAIL'}")
    print(f"✅ Signin after creation: {'PASS' if signin_success else 'FAIL'}")
    print(f"✅ New user retailer flow: {'PASS' if new_user_success else 'FAIL'}")
    
    if existing_success and signin_success:
        print("\n🎉 Issue should be resolved! The retailer signup should work now.")
    else:
        print("\n❌ There are still issues with the retailer signup flow.")
