from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_fetch_sustainability_ratings():
    response = client.post("/sustainability/ratings", json={
        "product_id": 1,  # Use existing product ID
        "type": ["carbon_footprint", "recyclability"]  # Use actual rating types
    })

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, dict)
    assert "status" in data
    assert "message" in data
    assert "rating" in data
    assert "statistics" in data

    assert isinstance(data["status"], int)
    assert isinstance(data["message"], str)
    assert isinstance(data["rating"], (int, float))  
    assert isinstance(data["statistics"], list)

    if data["statistics"]:
        for stat in data["statistics"]:
            assert isinstance(stat, dict)
            assert "value" in stat
            assert isinstance(stat["value"], (int, float))
            # Updated to expect percentages (0-100)
            assert 0 <= stat["value"] <= 100

    # Updated to expect percentages (0-100) instead of 1-5 scale
    assert 0 <= data["rating"] <= 100