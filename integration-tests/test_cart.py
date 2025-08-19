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
test_user_email = f"{uuid.uuid4()}@example.com"
test_user_password = "test1234"
actual_user_id = None


def test_create_user():
    global actual_user_id
    response = client.post("/auth/signup", json={
        "name": "Test Cart User",
        "email": test_user_email,
        "password": test_user_password
    })

    assert response.status_code in [200, 201, 400, 409]

    if response.status_code in [200, 201]:
        actual_user_id = response.json()["id"]
    else:
        login_response = client.post("/auth/signin", json={
            "email": test_user_email,
            "password": test_user_password
        })
        assert login_response.status_code == 200
        actual_user_id = login_response.json()["id"]

    assert actual_user_id is not None


def ensure_cart_exists():
    """Force cart creation using direct DB call."""
    db: Session
    for override in app.dependency_overrides.values():
        db = next(override())
        break
    else:
        db = next(get_db())

    get_or_create_cart(db, actual_user_id)


def test_add_item_to_cart():
    global actual_user_id
    ensure_cart_exists()

    response = client.post(f"/cart/add?user_id={actual_user_id}", json={
        "product_id": 1,
        "quantity": 2
    })

    assert response.status_code in [200, 201]
    data = response.json()
    assert data["user_id"] == actual_user_id
    assert any(item["product_id"] == 1 and item["quantity"] >= 2 for item in data["items"])


def test_view_cart():
    global actual_user_id
    ensure_cart_exists()

    response = client.get(f"/cart/{actual_user_id}")
    assert response.status_code == 200
    data = response.json()

    assert data["user_id"] == actual_user_id
    assert isinstance(data["items"], list)


def test_remove_item_from_cart():
    global actual_user_id
    ensure_cart_exists()

    # Add the item first to ensure it exists
    client.post(f"/cart/add?user_id={actual_user_id}", json={
        "product_id": 1,
        "quantity": 1
    })

    response = client.delete(f"/cart/remove?user_id={actual_user_id}&product_id=1")
    assert response.status_code in [200, 404]

    if response.status_code == 200:
        assert response.json() == {"detail": "Item removed"}
    else:
        assert response.json()["detail"] == "Item not found in cart"
