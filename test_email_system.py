#!/usr/bin/env python3
"""
Direct test script for order creation with email functionality
This script creates a test order with 2 products and verifies email sending
"""

import requests
import json
import sys

# Configuration
API_BASE_URL = "https://api.greencart-cos301.co.za"
TEST_EMAIL = "sknaidoo1405@gmail.com"

def test_email_config():
    """Test email service configuration"""
    print("🔍 Testing email configuration...")
    
    try:
        response = requests.get(f"{API_BASE_URL}/test/email-config")
        if response.status_code == 200:
            config = response.json()
            print(f" Email config retrieved:")
            print(f"   From Email: {config.get('from_email')}")
            print(f"   From Name: {config.get('from_name')}")
            print(f"   Region: {config.get('region')}")
            print(f"   SES Client: {' Initialized' if config.get('ses_client_initialized') else ' Not initialized'}")
            return True
        else:
            print(f" Failed to get email config: {response.status_code}")
            return False
    except Exception as e:
        print(f" Error getting email config: {e}")
        return False

def test_quick_email():
    """Test quick email sending"""
    print(f"\n📧 Testing quick email to {TEST_EMAIL}...")
    
    try:
        response = requests.get(f"{API_BASE_URL}/test/email-quick")
        if response.status_code == 200:
            result = response.json()
            if result.get('status') == 200:
                print(f" Quick email test successful!")
                print(f"   Message: {result.get('message')}")
                return True
            else:
                print(f" Quick email test failed: {result.get('message')}")
                return False
        else:
            print(f" Quick email test HTTP error: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f" Error in quick email test: {e}")
        return False

def get_test_user():
    """Get or create a test user"""
    print("\n👤 Getting test user...")
    
    # Try to sign up first
    signup_data = {
        "name": "Test User Email",
        "email": TEST_EMAIL,
        "password": "testpass123"
    }
    
    try:
        response = requests.post(f"{API_BASE_URL}/auth/signup", json=signup_data)
        if response.status_code in [200, 201]:
            user_data = response.json()
            print(f" New user created: {user_data.get('id')}")
            return user_data.get('id')
        elif response.status_code in [400, 409]:
            # User might already exist, try to login
            login_data = {
                "email": TEST_EMAIL,
                "password": "testpass123"
            }
            login_response = requests.post(f"{API_BASE_URL}/auth/signin", json=login_data)
            if login_response.status_code == 200:
                user_data = login_response.json()
                print(f" Existing user logged in: {user_data.get('id')}")
                return user_data.get('id')
            else:
                print(f" Failed to login existing user: {login_response.text}")
                return None
        else:
            print(f" Failed to create user: {response.text}")
            return None
    except Exception as e:
        print(f" Error getting test user: {e}")
        return None

def add_products_to_cart(user_id):
    """Add 2 products to cart for testing"""
    print(f"\n🛒 Adding products to cart for user {user_id}...")
    
    # Add first product
    try:
        response1 = requests.post(f"{API_BASE_URL}/cart/add?user_id={user_id}", json={
            "product_id": 1,  # Assuming product ID 1 exists
            "quantity": 1
        })
        
        response2 = requests.post(f"{API_BASE_URL}/cart/add?user_id={user_id}", json={
            "product_id": 2,  # Assuming product ID 2 exists
            "quantity": 2
        })
        
        print(f"   Product 1 add response: {response1.status_code}")
        print(f"   Product 2 add response: {response2.status_code}")
        
        # Get cart to find cart ID
        cart_response = requests.get(f"{API_BASE_URL}/cart/get?user_id={user_id}")
        if cart_response.status_code == 200:
            cart_data = cart_response.json()
            cart_id = cart_data.get('id')
            print(f" Cart ID: {cart_id}")
            return cart_id
        else:
            print(f" Failed to get cart: {cart_response.text}")
            return None
            
    except Exception as e:
        print(f" Error adding products to cart: {e}")
        return None

def create_test_order(user_id, cart_id):
    """Create a test order"""
    print(f"\n Creating order for user {user_id}, cart {cart_id}...")
    
    try:
        response = requests.post(f"{API_BASE_URL}/orders/createOrder", json={
            "userID": user_id,
            "cartID": cart_id
        })
        
        print(f"   Order creation response: {response.status_code}")
        print(f"   Response body: {response.text}")
        
        if response.status_code in [200, 201]:
            order_data = response.json()
            order_id = order_data.get('order_id')
            print(f" Order created successfully: {order_id}")
            return order_id
        else:
            print(f" Failed to create order: {response.text}")
            return None
            
    except Exception as e:
        print(f" Error creating order: {e}")
        return None

def main():
    """Main test function"""
    print(" Starting Green Cart Email System Test")
    print("=" * 50)
    
    # Test 1: Email configuration
    if not test_email_config():
        print("\n Email configuration test failed. Check AWS SES setup.")
        sys.exit(1)
    
    # Test 2: Quick email test
    if not test_quick_email():
        print(f"\n Quick email test failed. Check {TEST_EMAIL} inbox.")
        print("Note: Check spam folder if email doesn't appear in inbox.")
    else:
        print(f"\n Quick email test passed! Check {TEST_EMAIL} inbox.")
    
    # Test 3: Full order creation with email
    print("\n" + "=" * 50)
    print("🛒 Testing full order creation with email...")
    
    user_id = get_test_user()
    if not user_id:
        print(" Could not get test user")
        sys.exit(1)
    
    cart_id = add_products_to_cart(user_id)
    if not cart_id:
        print(" Could not create cart with products")
        sys.exit(1)
    
    order_id = create_test_order(user_id, cart_id)
    if not order_id:
        print(" Could not create test order")
        sys.exit(1)
    
    print("\n" + "=" * 50)
    print(" Test completed!")
    print(f" Order {order_id} created for user {user_id}")
    print(f" Check {TEST_EMAIL} for order confirmation email")
    print("If email doesn't arrive within 2-3 minutes, check:")
    print("   1. Spam/Junk folder")
    print("   2. AWS SES domain verification status")
    print("   3. Email address verification in SES (if in sandbox mode)")

if __name__ == "__main__":
    main()
