#!/usr/bin/env python3
"""
Test script to verify the fixed retailer registration flow
Simulates the exact frontend API calls with improved error handling
"""
import requests
import json

API_BASE_URL = "http://localhost:8000"

def test_frontend_retailer_registration():
    # Test data matching frontend form structure
    test_data = {
        "name": "Frontend Test Shop",
        "description": "A shop created through the frontend flow",
        "email": "frontend@testshop.com",
        "password": "testpassword123"
    }
    
    print("Testing Fixed Frontend Retailer Registration Flow")
    print("=" * 50)
    
    # Step 1: Create user account (as done by updated signupRetailer function)
    print("\n1. Creating user account first...")
    user_payload = {
        "name": test_data["name"],
        "email": test_data["email"],
        "password": test_data["password"]
    }
    
    try:
        user_response = requests.post(f"{API_BASE_URL}/auth/signup", json=user_payload)
        print(f"User signup status: {user_response.status_code}")
        
        if user_response.status_code == 200:
            user_result = user_response.json()
            print(f"✅ User created successfully: {user_result.get('message', 'Success')}")
        else:
            print(f"❌ User creation failed: {user_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error in user creation: {e}")
        return False
    
    # Step 2: Convert user to retailer
    print("\n2. Converting user to retailer...")
    retailer_payload = {
        "name": test_data["name"],
        "description": test_data["description"],
        "email": test_data["email"],
        "password": test_data["password"]
    }
    
    try:
        retailer_response = requests.post(f"{API_BASE_URL}/auth/retailer/signup", json=retailer_payload)
        print(f"Retailer signup status: {retailer_response.status_code}")
        
        if retailer_response.status_code == 200:
            retailer_result = retailer_response.json()
            print(f"✅ Retailer created successfully: {retailer_result.get('message', 'Success')}")
        else:
            print(f"❌ Retailer creation failed: {retailer_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error in retailer creation: {e}")
        return False
    
    # Step 3: Test signin (as done by frontend after registration)
    print("\n3. Testing signin after registration...")
    signin_payload = {
        "email": test_data["email"],
        "password": test_data["password"]
    }
    
    try:
        signin_response = requests.post(f"{API_BASE_URL}/auth/retailer/signin", json=signin_payload)
        print(f"Signin status: {signin_response.status_code}")
        
        if signin_response.status_code == 200:
            signin_result = signin_response.json()
            print(f"✅ Signin successful!")
            print(f"User ID: {signin_result.get('user_id')}")
            print(f"User Name: {signin_result.get('user_name')}")
            print(f"Shops count: {len(signin_result.get('shops', []))}")
            
            if signin_result.get('shops'):
                for shop in signin_result['shops']:
                    print(f"  - Shop: {shop.get('name')} (ID: {shop.get('id')})")
        else:
            print(f"❌ Signin failed: {signin_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error in signin: {e}")
        return False
    
    print("\n✅ Frontend retailer registration flow test completed successfully!")
    return True

def test_error_scenarios():
    print("\n\nTesting Error Scenarios")
    print("=" * 30)
    
    # Test duplicate email
    print("\n1. Testing duplicate email registration...")
    duplicate_data = {
        "name": "Duplicate Shop",
        "description": "Should fail",
        "email": "frontend@testshop.com",  # Same email as above
        "password": "newpassword123"
    }
    
    try:
        user_response = requests.post(f"{API_BASE_URL}/auth/signup", json={
            "name": duplicate_data["name"],
            "email": duplicate_data["email"],
            "password": duplicate_data["password"]
        })
        print(f"Duplicate user signup status: {user_response.status_code}")
        
        if user_response.status_code != 200:
            error_data = user_response.json()
            print(f"✅ Correctly rejected duplicate: {error_data.get('detail', 'Unknown error')}")
        else:
            print("❌ Should have rejected duplicate email")
            
    except Exception as e:
        print(f"Error testing duplicate: {e}")
    
    # Test invalid signin
    print("\n2. Testing invalid signin...")
    try:
        invalid_signin = requests.post(f"{API_BASE_URL}/auth/retailer/signin", json={
            "email": "nonexistent@email.com",
            "password": "wrongpassword"
        })
        print(f"Invalid signin status: {invalid_signin.status_code}")
        
        if invalid_signin.status_code != 200:
            error_data = invalid_signin.json()
            print(f"✅ Correctly rejected invalid signin: {error_data.get('detail', 'Unknown error')}")
        else:
            print("❌ Should have rejected invalid credentials")
            
    except Exception as e:
        print(f"Error testing invalid signin: {e}")

if __name__ == "__main__":
    # Test the main flow
    success = test_frontend_retailer_registration()
    
    # Test error scenarios
    test_error_scenarios()
    
    if success:
        print("\n🎉 All tests passed! Frontend should now work correctly.")
    else:
        print("\n❌ Some tests failed. Check the backend logs.")
