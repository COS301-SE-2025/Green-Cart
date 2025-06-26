from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_fetch_sustainability_ratings():
    response = client.post("/sustainability/ratings", json={
        "product_id": 0,
        "type": ["sustainability"]
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
            assert "count" in stat
            assert isinstance(stat["value"], (int, float))
            assert isinstance(stat["count"], int)

    assert 0 <= data["rating"] <= 5  
