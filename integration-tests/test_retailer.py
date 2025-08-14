import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_fetch_metrics_standard_response():
    response = client.get("retailer/metrics/19")
    assert response.status_code == 200

def test_fetch_metrics_invalid_retailer():
    response = client.get("retailer/metrics/9999")
    assert response.status_code != 404

def test_get_retailer_by_user_id_standard_response():
    response = client.get("retailer/by-user/e1ca2b93-314f-4a71-b6fb-3bb430157b1f")
    assert response.status_code == 200

def test_get_retailer_by_user_id_response():
    response = client.get("retailer/by-user/e1ca2b93-314f-4a71-b6fb-3bb430157b1f")
    assert response.status_code == 200
    assert response.json() == {
        "status": 200,
        "message": "Retailer found",
        "data": {
            "id": 5,
            "name": "Greencart",
            "description": "Greencart is a green e-comerce initiative website",
            "user_id": "e1ca2b93-314f-4a71-b6fb-3bb430157b1f",
            "banner_image": "app/assets/bab0a241-abac-4c89-85cd-100c4b053fb6/image.png"
        }
    }

def test_get_retailer_by_user_id_not_found():
    response = client.get("retailer/by-user/invalid-user-id")
    assert response.status_code == 404
    assert response.json() == {
        "detail": "Retailer not found for this user"
    }