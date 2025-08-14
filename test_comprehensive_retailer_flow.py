#!/usr/bin/env python3
"""
Comprehensive test for both retailer registration flows:
1. Direct retailer registration (RetailerAuth.jsx)
2. "Become a retailer" from user account (UserAccount.jsx + RetailerAuthOverlay)
"""
import requests
import json

API_BASE_URL = "http://localhost:8000"

def test_direct_retailer_registration():
    """Test the main retailer registration flow"""
    print("Testing Direct Retailer Registration (RetailerAuth.jsx)")
    print("=" * 55)
    
    test_data = {
        "name": "Direct Registration Shop",
        "description": "Shop created via direct registration",
        "email": "direct@testshop.com",
        "password": "directpassword123"
    }
    
    # Step 1: User signup
    print("\n1. Creating user account...")
    user_response = requests.post(f"{API_BASE_URL}/auth/signup", json={
        "name": test_data["name"],
        "email": test_data["email"],
        "password": test_data["password"]
    })
    
    if user_response.status_code == 200:
        print("✅ User created successfully")
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
        print("✅ Retailer created successfully")
    else:
        print(f"❌ Retailer creation failed: {retailer_response.text}")
        return False
    
    # Step 3: Signin
    print("3. Testing signin...")
    signin_response = requests.post(f"{API_BASE_URL}/auth/retailer/signin", json={
        "email": test_data["email"],
        "password": test_data["password"]
    })
    
    if signin_response.status_code == 200:
        signin_result = signin_response.json()
        print("✅ Signin successful")
        print(f"   Shops: {len(signin_result.get('shops', []))}")
        return True
    else:
        print(f"❌ Signin failed: {signin_response.text}")
        return False

def test_user_account_retailer_conversion():
    """Test the 'become a retailer' flow from UserAccount"""
    print("\n\nTesting User Account Retailer Conversion (UserAccount.jsx)")
    print("=" * 58)
    
    # First create a regular user (simulating existing user)
    existing_user_data = {
        "name": "Existing User",
        "email": "existing@user.com",
        "password": "userpassword123"
    }
    
    print("\n1. Creating existing user account...")
    user_response = requests.post(f"{API_BASE_URL}/auth/signup", json=existing_user_data)
    
    if user_response.status_code == 200:
        print("✅ Existing user created")
    else:
        print(f"❌ User creation failed: {user_response.text}")
        return False
    
    # Now test the "become a retailer" flow
    # This simulates what UserAccount.jsx does with the overlay form
    overlay_form_data = {
        "name": "User's Shop",
        "organisation": "User's Organisation",  # This gets converted to description
        "password": "userpassword123"  # Current user's password
    }
    
    # The UserAccount component transforms this data:
    transformed_data = {
        "name": overlay_form_data["name"],
        "description": overlay_form_data["organisation"],  # organisation -> description
        "email": existing_user_data["email"],  # Uses current user's email
        "password": overlay_form_data["password"]
    }
    
    print("\n2. Converting existing user to retailer...")
    print(f"   Form data: name='{overlay_form_data['name']}', organisation='{overlay_form_data['organisation']}'")
    print(f"   Transformed: name='{transformed_data['name']}', description='{transformed_data['description']}', email='{transformed_data['email']}'")
    
    # Step 1: This should already be done (user exists)
    # Step 2: Convert to retailer
    retailer_response = requests.post(f"{API_BASE_URL}/auth/retailer/signup", json=transformed_data)
    
    if retailer_response.status_code == 200:
        print("✅ User converted to retailer successfully")
    else:
        print(f"❌ Retailer conversion failed: {retailer_response.text}")
        return False
    
    # Step 3: Test signin
    print("3. Testing signin after conversion...")
    signin_response = requests.post(f"{API_BASE_URL}/auth/retailer/signin", json={
        "email": transformed_data["email"],
        "password": transformed_data["password"]
    })
    
    if signin_response.status_code == 200:
        signin_result = signin_response.json()
        print("✅ Signin successful after conversion")
        print(f"   User: {signin_result.get('user_name')}")
        print(f"   Shops: {len(signin_result.get('shops', []))}")
        return True
    else:
        print(f"❌ Signin failed: {signin_response.text}")
        return False

def test_error_handling():
    """Test error scenarios for better UX"""
    print("\n\nTesting Error Handling")
    print("=" * 22)
    
    # Test 1: Duplicate retailer conversion
    print("\n1. Testing duplicate retailer conversion...")
    duplicate_response = requests.post(f"{API_BASE_URL}/auth/retailer/signup", json={
        "name": "Duplicate Shop",
        "description": "Should fail",
        "email": "existing@user.com",  # Email that already has retailer account
        "password": "userpassword123"
    })
    
    if duplicate_response.status_code != 200:
        error_data = duplicate_response.json()
        print(f"✅ Correctly rejected duplicate: {error_data.get('detail', 'Unknown error')}")
    else:
        print("❌ Should have rejected duplicate retailer")
    
    # Test 2: Invalid signin
    print("\n2. Testing invalid signin credentials...")
    invalid_response = requests.post(f"{API_BASE_URL}/auth/retailer/signin", json={
        "email": "existing@user.com",
        "password": "wrongpassword"
    })
    
    if invalid_response.status_code != 200:
        error_data = invalid_response.json()
        print(f"✅ Correctly rejected invalid credentials: {error_data.get('detail', 'Unknown error')}")
    else:
        print("❌ Should have rejected invalid password")
    
    # Test 3: Non-existent user signin
    print("\n3. Testing signin for non-existent retailer...")
    nonexistent_response = requests.post(f"{API_BASE_URL}/auth/retailer/signin", json={
        "email": "nonexistent@retailer.com",
        "password": "password123"
    })
    
    if nonexistent_response.status_code != 200:
        error_data = nonexistent_response.json()
        print(f"✅ Correctly rejected non-existent retailer: {error_data.get('detail', 'Unknown error')}")
    else:
        print("❌ Should have rejected non-existent retailer")

if __name__ == "__main__":
    print("🧪 Comprehensive Retailer Registration Test")
    print("==========================================")
    
    # Test both flows
    direct_success = test_direct_retailer_registration()
    conversion_success = test_user_account_retailer_conversion()
    
    # Test error handling
    test_error_handling()
    
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print(f"✅ Direct Registration: {'PASS' if direct_success else 'FAIL'}")
    print(f"✅ User Conversion: {'PASS' if conversion_success else 'FAIL'}")
    
    if direct_success and conversion_success:
        print("\n🎉 All registration flows working correctly!")
        print("Frontend retailer registration should now work properly.")
    else:
        print("\n❌ Some tests failed. Check the issues above.")
