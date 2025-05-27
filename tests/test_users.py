from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_signup_status_code():
    response = client.post("/auth/signup", json={
        "name": "Test User",
        "email": "testuser@example.com",
        "password": "secure123"
    })
    assert response.status_code in [200, 201, 400, 409]


def test_signin_status_code():
    response = client.post("/auth/signin", json={
        "email": "testuser@example.com",
        "password": "secure123"
    })
    assert response.status_code in [200, 401, 404]
