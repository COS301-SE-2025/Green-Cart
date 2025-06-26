from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_fetch_sustainability_rating_only():
    response = client.post("/sustainability/ratings", json={
        "product_id": 1
    })

    assert response.status_code == 200



