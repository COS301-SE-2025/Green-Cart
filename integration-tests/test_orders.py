import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

mock_user_id = "e1ca2b93-314f-4a71-b6fb-3bb430157b1f"
mock_product_id = 1
mock_cart_id = None
mock_order_id = None

def test_create_cart_and_add_product():
    global mock_cart_id
    response = client.post(f"/cart/add?user_id={mock_user_id}", json={
        "product_id": mock_product_id,
        "quantity": 1
    })
    assert response.status_code in [200, 201]
    cart_data = response.json()
    mock_cart_id = cart_data.get("id")
    print("Cart Created:", cart_data)
    assert mock_cart_id is not None

def test_create_order():
    global mock_order_id
    assert mock_cart_id is not None, "Cart ID is None. Ensure cart creation passed."
    
    response = client.post("/orders/createOrder", json={
        "userID": mock_user_id,
        "cartID": mock_cart_id
    })

    print("Create Order Response:", response.status_code, response.text)

    if response.status_code == 409:
        fallback = client.post("/orders/getAllOrders", json={
            "userID": mock_user_id,
            "fromItem": 0,
            "count": 10
        })
        assert fallback.status_code == 200
        orders = fallback.json().get("orders", [])
        for order in orders:
            if order["cart_id"] == mock_cart_id:
                mock_order_id = order["id"]
                break
    else:
        assert response.status_code in [200, 201]
        mock_order_id = response.json().get("order_id")

    assert mock_order_id is not None

def test_get_all_orders():
    response = client.post("/orders/getAllOrders", json={
        "userID": mock_user_id,
        "fromItem": 0,
        "count": 10
    })
    print("All Orders Response:", response.status_code, response.text)
    assert response.status_code == 200
    assert "orders" in response.json()

def test_get_order_by_id():
    global mock_order_id
    assert mock_order_id is not None
    response = client.post("/orders/getOrderByID", json={
        "userID": mock_user_id,
        "orderID": mock_order_id,
        "fromItem": 0,
        "count": 10
    })
    print("Order by ID Response:", response.status_code, response.text)
    assert response.status_code == 200
    assert "order" in response.json()

def test_cancel_order():
    global mock_order_id
    assert mock_order_id is not None
    response = client.patch("/orders/cancelOrder", json={
        "userID": mock_user_id,
        "orderID": mock_order_id
    })
    print("Cancel Order Response:", response.status_code, response.text)
    assert response.status_code == 200
    assert response.json().get("order_id") == mock_order_id
