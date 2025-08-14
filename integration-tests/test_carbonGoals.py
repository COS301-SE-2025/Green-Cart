import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_fetch_goals_standard_response():
    response = client.get("api/carbon-goals/e1ca2b93-314f-4a71-b6fb-3bb430157b1f")
    assert response.status_code == 200

def test_fetch_goals_invalid_user_id():
    response = client.get("api/carbon-goals/invalid-user-id")
    assert response.status_code != 422

    response = client.get("api/carbon-goals/")
    assert response.status_code == 404

