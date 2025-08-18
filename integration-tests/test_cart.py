import sys
import os
import uuid
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

# Ensure correct import path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.main import app
from app.db.session import get_db
from app.services.cart import get_or_create_cart

client = TestClient(app)

# Unique test user
test_user_email = f"cart_test_{uuid.uuid4()}@example.com"
test_user_password = "test1234"
actual_user_id = None


class TestCartIntegration:
    """Integration tests for cart functionality"""
    
    def test_01_create_test_user(self):
        """Create a test user for cart operations"""
        global actual_user_id
        response = client.post("/auth/signup", json={
            "name": "Cart Test User",
            "email": test_user_email,
            "password": test_user_password
        })

        # User might already exist, try to login
        if response.status_code in [400, 409]:
            login_response = client.post("/auth/signin", json={
                "email": test_user_email,
                "password": test_user_password
            })
            if login_response.status_code == 200:
                actual_user_id = login_response.json()["id"]
        elif response.status_code in [200, 201]:
            actual_user_id = response.json()["id"]

        assert actual_user_id is not None, "Failed to create or authenticate test user"
    
    def test_02_add_item_to_empty_cart(self):
        """Test adding an item to an empty cart"""
        global actual_user_id
        assert actual_user_id is not None, "Test user not created"
        
        response = client.post(f"/cart/add?user_id={actual_user_id}", json={
            "product_id": 1,
            "quantity": 2
        })

        assert response.status_code in [200, 201], f"Failed to add item to cart: {response.text}"
        data = response.json()
        assert data["user_id"] == actual_user_id
        assert any(item["product_id"] == 1 and item["quantity"] >= 2 for item in data["items"])
    
    def test_03_view_cart_with_items(self):
        """Test viewing cart that has items"""
        global actual_user_id
        assert actual_user_id is not None, "Test user not created"

        response = client.get(f"/cart/{actual_user_id}")
        assert response.status_code == 200, f"Failed to view cart: {response.text}"
        data = response.json()

        assert data["user_id"] == actual_user_id
        assert isinstance(data["items"], list)
        assert len(data["items"]) > 0, "Cart should have items"
    
    def test_04_add_more_of_same_item(self):
        """Test adding more quantity of an existing item"""
        global actual_user_id
        assert actual_user_id is not None, "Test user not created"
        
        # Get current cart state
        current_cart = client.get(f"/cart/{actual_user_id}")
        assert current_cart.status_code == 200
        
        # Add more of the same product
        response = client.post(f"/cart/add?user_id={actual_user_id}", json={
            "product_id": 1,
            "quantity": 1
        })

        assert response.status_code in [200, 201], f"Failed to add more items: {response.text}"
        data = response.json()
        
        # Should have increased quantity
        product_1_item = next((item for item in data["items"] if item["product_id"] == 1), None)
        assert product_1_item is not None, "Product 1 should exist in cart"
        assert product_1_item["quantity"] >= 3, "Quantity should have increased"
    
    def test_05_add_different_item(self):
        """Test adding a different item to cart"""
        global actual_user_id
        assert actual_user_id is not None, "Test user not created"
        
        response = client.post(f"/cart/add?user_id={actual_user_id}", json={
            "product_id": 2,
            "quantity": 1
        })

        assert response.status_code in [200, 201], f"Failed to add different item: {response.text}"
        data = response.json()
        
        # Should have both products now
        product_ids = [item["product_id"] for item in data["items"]]
        assert 1 in product_ids, "Product 1 should still be in cart"
        assert 2 in product_ids, "Product 2 should be added to cart"
    
    def test_06_remove_item_from_cart(self):
        """Test removing an item from cart"""
        global actual_user_id
        assert actual_user_id is not None, "Test user not created"

        response = client.delete(f"/cart/remove?user_id={actual_user_id}&product_id=2")
        assert response.status_code in [200, 404], f"Unexpected error removing item: {response.text}"

        if response.status_code == 200:
            assert "detail" in response.json()
            assert "removed" in response.json()["detail"].lower()
    
    def test_07_remove_nonexistent_item(self):
        """Test removing an item that doesn't exist in cart"""
        global actual_user_id
        assert actual_user_id is not None, "Test user not created"

        response = client.delete(f"/cart/remove?user_id={actual_user_id}&product_id=999")
        assert response.status_code == 404, "Should return 404 for non-existent item"
        assert "not found" in response.json()["detail"].lower()
    
    def test_08_add_invalid_product(self):
        """Test adding a product that doesn't exist"""
        global actual_user_id
        assert actual_user_id is not None, "Test user not created"
        
        response = client.post(f"/cart/add?user_id={actual_user_id}", json={
            "product_id": 99999,  # Assuming this product doesn't exist
            "quantity": 1
        })

        assert response.status_code == 404, "Should return 404 for non-existent product"
        assert "not found" in response.json()["detail"].lower()
    
    def test_09_add_zero_quantity(self):
        """Test adding zero quantity to cart"""
        global actual_user_id
        assert actual_user_id is not None, "Test user not created"
        
        response = client.post(f"/cart/add?user_id={actual_user_id}", json={
            "product_id": 1,
            "quantity": 0
        })

        # Should either reject zero quantity or handle it gracefully
        assert response.status_code in [200, 201, 400, 422], f"Unexpected response: {response.text}"
    
    def test_10_add_negative_quantity(self):
        """Test adding negative quantity to cart"""
        global actual_user_id
        assert actual_user_id is not None, "Test user not created"
        
        response = client.post(f"/cart/add?user_id={actual_user_id}", json={
            "product_id": 1,
            "quantity": -1
        })

        # Should reject negative quantity
        assert response.status_code in [400, 422], "Should reject negative quantity"
    
    def test_11_cart_for_nonexistent_user(self):
        """Test cart operations for non-existent user"""
        fake_user_id = str(uuid.uuid4())
        
        # Try to view cart for non-existent user
        response = client.get(f"/cart/{fake_user_id}")
        assert response.status_code in [200, 404], f"Unexpected response: {response.text}"
        
        # If 200, should return empty cart or create new cart
        if response.status_code == 200:
            data = response.json()
            assert data["user_id"] == fake_user_id
            assert isinstance(data["items"], list)


def ensure_cart_exists():
    """Force cart creation using direct DB call."""
    global actual_user_id
    if actual_user_id is None:
        return
        
    try:
        db: Session
        for override in app.dependency_overrides.values():
            db = next(override())
            break
        else:
            db = next(get_db())

        get_or_create_cart(db, actual_user_id)
    except Exception as e:
        print(f"Warning: Could not ensure cart exists: {e}")


# Legacy test functions for backward compatibility
def test_create_user():
    test_instance = TestCartIntegration()
    test_instance.test_01_create_test_user()


def test_add_item_to_cart():
    ensure_cart_exists()
    test_instance = TestCartIntegration()
    test_instance.test_02_add_item_to_empty_cart()


def test_view_cart():
    ensure_cart_exists()
    test_instance = TestCartIntegration()
    test_instance.test_03_view_cart_with_items()


def test_remove_item_from_cart():
    ensure_cart_exists()
    test_instance = TestCartIntegration()
    test_instance.test_06_remove_item_from_cart()
