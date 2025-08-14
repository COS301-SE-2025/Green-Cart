import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_donations_standard_response():
    response = client.post("/donations/apply", json={
        "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "cart_id": 0,
        "base_carbon_footprint": 100.0,
        "donation_amount": 10
    })
    assert response.status_code == 200

def test_donations_invalid_body_structure():
    response = client.post("/donations/apply", json={
        "user_id": "invalid-id",
        "base_carbon_footprint": 100.0,
        "donation_amount": 10
    })
    assert response.status_code == 422

    response = client.post("/donations/apply", json={
        "cart_id": 0,
        "base_carbon_footprint": 100.0,
        "donation_amount": 10
    })
    assert response.status_code == 422

    response = client.post("/donations/apply", json={
        "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "cart_id": 0,
        "donation_amount": 10
    })
    assert response.status_code == 422

    response = client.post("/donations/apply", json={
        "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "cart_id": 0,
        "base_carbon_footprint": 100.0
    })
    assert response.status_code == 422

def test_donations_invalid_body_values():
    response = client.post("/donations/apply", json={
        "user_id": 9999,
        "cart_id": 0,
        "base_carbon_footprint": 100.0,
        "donation_amount": 10
    })
    assert response.status_code == 422

    response = client.post("/donations/apply", json={
        "user_id": "",
        "cart_id": 0,
        "base_carbon_footprint": 100.0,
        "donation_amount": 10
    })
    assert response.status_code == 422