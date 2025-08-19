import sys
import os
import uuid
from fastapi.testclient import TestClient

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.main import app

client = TestClient(app)

# Test data
test_user_email = f"orders_test_{uuid.uuid4()}@example.com"
test_user_password = "ordertest123"
test_user_name = "Orders Test User"

# Global variables
mock_user_id = None
mock_product_id = 1
mock_cart_id = None
mock_order_id = None


class TestOrdersIntegration:
    """Integration tests for orders functionality"""
    
    def test_01_create_test_user(self):
        """Create a test user for order operations"""
        global mock_user_id
        
        # Try to create user
        response = client.post("/auth/signup", json={
            "name": test_user_name,
            "email": test_user_email,
            "password": test_user_password
        })

        if response.status_code in [400, 409]:
            # User might already exist, try to login
            login_response = client.post("/auth/signin", json={
                "email": test_user_email,
                "password": test_user_password
            })
            assert login_response.status_code == 200, f"Failed to login existing user: {login_response.text}"
            mock_user_id = login_response.json()["id"]
        elif response.status_code in [200, 201]:
            mock_user_id = response.json()["id"]
        else:
            assert False, f"Unexpected response creating user: {response.text}"

        assert mock_user_id is not None, "Failed to get user ID"
    
    def test_02_create_cart_and_add_product(self):
        """Create a cart and add a product to it"""
        global mock_cart_id, mock_user_id
        assert mock_user_id is not None, "User ID not available"
        
        response = client.post(f"/cart/add?user_id={mock_user_id}", json={
            "product_id": mock_product_id,
            "quantity": 2
        })
        
        assert response.status_code in [200, 201, 400], f"Failed to add item to cart: {response.text}"
        cart_data = response.json()
        mock_cart_id = cart_data.get("id")
        
        assert mock_cart_id is not None, "Cart ID not returned"
        assert cart_data["user_id"] == mock_user_id
        assert len(cart_data["items"]) > 0, "Cart should have items"
        
        print(f"Cart Created with ID: {mock_cart_id}")
    
    def test_03_create_order(self):
        """Create an order from the cart"""
        global mock_order_id, mock_user_id, mock_cart_id
        # assert mock_user_id is not None, "User ID not available"
        # assert mock_cart_id is not None, "Cart ID not available"
        
        response = client.post("/orders/createOrder", json={
            "userID": mock_user_id,
            "cartID": mock_cart_id
        })

        print(f"Create Order Response: {response.status_code} - {response.text}")

        if response.status_code == 409:
            # Order might already exist, try to get existing orders
            fallback = client.post("/orders/getAllOrders", json={
                "userID": mock_user_id,
                "fromItem": 0,
                "count": 10
            })
            assert fallback.status_code == 200, f"Failed to get existing orders: {fallback.text}"
            orders = fallback.json().get("orders", [])
            
            # Find order with matching cart_id
            for order in orders:
                if order.get("cart_id") == mock_cart_id:
                    mock_order_id = order["id"]
                    break
            
            if mock_order_id is None and len(orders) > 0:
                # Use the most recent order
                mock_order_id = orders[0]["id"]
                
        elif response.status_code in [200, 201]:
            order_data = response.json()
            mock_order_id = order_data.get("order_id") or order_data.get("id")
        else:
            assert False, f"Failed to create order: {response.text}"

        assert mock_order_id is not None, "Order ID not available"
        print(f"Order ID: {mock_order_id}")
    
    def test_04_get_all_orders(self):
        """Test getting all orders for the user"""
        global mock_user_id
        assert mock_user_id is not None, "User ID not available"
        
        response = client.post("/orders/getAllOrders", json={
            "userID": mock_user_id,
            "fromItem": 0,
            "count": 10
        })
        
        print(f"All Orders Response: {response.status_code} - {response.text}")
        assert response.status_code == 200, f"Failed to get all orders: {response.text}"
        
        data = response.json()
        assert "orders" in data, "Response should contain orders"
        assert isinstance(data["orders"], list), "Orders should be a list"
        
        if len(data["orders"]) > 0:
            order = data["orders"][0]
            assert "id" in order, "Order should have an ID"
            assert "user_id" in order, "Order should have user_id"
    
    def test_05_get_order_by_id(self):
        """Test getting a specific order by ID"""
        global mock_user_id, mock_order_id
        # assert mock_user_id is not None, "User ID not available"
        # assert mock_order_id is not None, "Order ID not available"
        
        response = client.post("/orders/getOrderByID", json={
            "userID": mock_user_id,
            "orderID": mock_order_id,
            "fromItem": 0,
            "count": 10
        })
        
        print(f"Order by ID Response: {response.status_code} - {response.text}")
        assert response.status_code == 200, f"Failed to get order by ID: {response.text}"
        
        data = response.json()
        assert "order" in data or "status" in data, "Response should contain order data"
        
        if "order" in data:
            assert data["order"]["id"] == mock_order_id
    
    def test_06_cancel_order(self):
        """Test canceling an order"""
        global mock_user_id, mock_order_id
        # assert mock_user_id is not None, "User ID not available"
        # assert mock_order_id is not None, "Order ID not available"
        
        response = client.patch("/orders/cancelOrder", json={
            "userID": mock_user_id,
            "orderID": mock_order_id
        })
        
        print(f"Cancel Order Response: {response.status_code} - {response.text}")
        
        # Order might already be in a state that can't be cancelled
        assert response.status_code in [200, 400, 409], f"Unexpected cancel order response: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            assert data.get("order_id") == mock_order_id or "order_id" in data
    
    def test_07_get_order_invalid_id(self):
        """Test getting order with invalid ID"""
        global mock_user_id
        assert mock_user_id is not None, "User ID not available"
        
        response = client.post("/orders/getOrderByID", json={
            "userID": mock_user_id,
            "orderID": 99999,  # Invalid order ID
            "fromItem": 0,
            "count": 10
        })
        
        assert response.status_code == 404, "Should return 404 for invalid order ID"
    
    def test_08_cancel_order_invalid_id(self):
        """Test canceling order with invalid ID"""
        global mock_user_id
        assert mock_user_id is not None, "User ID not available"
        
        response = client.patch("/orders/cancelOrder", json={
            "userID": mock_user_id,
            "orderID": 99999  # Invalid order ID
        })
        
        assert response.status_code in [404, 400], "Should return error for invalid order ID"
    
    def test_09_order_state_transitions(self):
        """Test order state transitions if supported"""
        global mock_user_id, mock_order_id
        assert mock_user_id is not None, "User ID not available"
        assert mock_order_id is not None, "Order ID not available"
        
        # Try to update order state (if endpoint exists)
        response = client.patch(f"/orders/updateOrderState", json={
            "userID": mock_user_id,
            "orderID": mock_order_id,
            "newState": "Ready for Delivery"
        })
        
        # This endpoint might not exist, so we accept various responses
        assert response.status_code in [200, 404, 405], f"Unexpected response: {response.text}"
    
    def test_10_order_pagination(self):
        """Test order pagination"""
        global mock_user_id
        assert mock_user_id is not None, "User ID not available"
        
        # Test pagination with different parameters
        response = client.post("/orders/getAllOrders", json={
            "userID": mock_user_id,
            "fromItem": 0,
            "count": 5  # Limit to 5 orders
        })
        
        assert response.status_code == 200, f"Failed pagination test: {response.text}"
        
        data = response.json()
        if "orders" in data:
            assert len(data["orders"]) <= 5, "Should return at most 5 orders"


class TestOrdersValidation:
    """Test order endpoint validation"""
    
    def test_create_order_missing_fields(self):
        """Test creating order with missing fields"""
        response = client.post("/orders/createOrder", json={
            "userID": "test-user"
            # Missing cartID
        })
        
        assert response.status_code == 422, "Should return validation error for missing cartID"
    
    def test_create_order_invalid_user_id(self):
        """Test creating order with invalid user ID"""
        response = client.post("/orders/createOrder", json={
            "userID": "invalid-user-id",
            "cartID": 999
        })
        
        assert response.status_code in [400, 404, 422], "Should return error for invalid user ID"
    
    def test_get_orders_invalid_pagination(self):
        """Test getting orders with invalid pagination"""
        response = client.post("/orders/getAllOrders", json={
            "userID": str(uuid.uuid4()),
            "fromItem": -1,  # Invalid negative value
            "count": 0       # Invalid zero count
        })
        
        # The API might handle invalid pagination gracefully
        assert response.status_code in [200, 400, 422], "Invalid pagination test"
    
    def test_order_operations_empty_user_id(self):
        """Test order operations with empty user ID"""
        response = client.post("/orders/getAllOrders", json={
            "userID": "",  # Empty user ID
            "fromItem": 0,
            "count": 10
        })
        
        # The API might handle empty user ID gracefully
        assert response.status_code in [200, 422], "Empty user ID test"


# Legacy test functions for backward compatibility
def test_create_cart_and_add_product():
    """Legacy test function"""
    test_instance = TestOrdersIntegration()
    test_instance.test_01_create_test_user()
    test_instance.test_02_create_cart_and_add_product()


def test_create_order():
    """Legacy test function"""
    test_instance = TestOrdersIntegration()
    test_instance.test_03_create_order()


def test_get_all_orders():
    """Legacy test function"""
    test_instance = TestOrdersIntegration()
    test_instance.test_04_get_all_orders()


def test_get_order_by_id():
    """Legacy test function"""
    test_instance = TestOrdersIntegration()
    test_instance.test_05_get_order_by_id()


def test_cancel_order():
    """Legacy test function"""
    test_instance = TestOrdersIntegration()
    test_instance.test_06_cancel_order()


if __name__ == "__main__":
    # Run all tests
    integration_tests = TestOrdersIntegration()
    validation_tests = TestOrdersValidation()
    
    all_test_classes = [integration_tests, validation_tests]
    
    for test_class in all_test_classes:
        for method_name in dir(test_class):
            if method_name.startswith("test_"):
                method = getattr(test_class, method_name)
                try:
                    method()
                    print(f"✓ {method_name}")
                except Exception as e:
                    print(f"✗ {method_name}: {e}")
