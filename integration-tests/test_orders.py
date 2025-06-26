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
    mock_cart_id = response.json().get("id")
    assert mock_cart_id is not None

def test_create_order():
    global mock_order_id
    response = client.post("/orderscreateOrder", json={
        "userID": mock_user_id,
        "cartID": mock_cart_id
    })

    if response.status_code == 409:
        print("Order already exists. Fetching order from list.")
        fallback = client.post("/ordersgetAllOrders", json={
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

    print("Resolved order ID:", mock_order_id)
    assert mock_order_id is not None

def test_get_all_orders():
    response = client.post("/ordersgetAllOrders", json={
        "userID": mock_user_id,
        "fromItem": 0,
        "count": 10
    })
    assert response.status_code == 200
    assert "orders" in response.json()

def test_get_order_by_id():
    global mock_order_id
    assert mock_order_id is not None
    response = client.post("/ordersgetOrderByID", json={
        "userID": mock_user_id,
        "orderID": mock_order_id,
        "fromItem": 0,
        "count": 10
    })
    assert response.status_code == 200
    assert "order" in response.json()

def test_cancel_order():
    global mock_order_id
    assert mock_order_id is not None
    response = client.patch("/orderscancelOrder", json={
        "userID": mock_user_id,
        "orderID": mock_order_id
    })
    assert response.status_code == 200
    assert response.json().get("order_id") == mock_order_id
