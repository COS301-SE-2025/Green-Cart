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

def test_set_carbon_goals_standard_response():
    response = client.post("api/carbon-goals/set", json={
        "user_id": "e1ca2b93-314f-4a71-b6fb-3bb430157b1f",
        "month": 1,
        "goal_value": 10
    })
    assert response.status_code == 200

def test_set_carbon_goals_invalid_user_id():
    response = client.post("api/carbon-goals/set", json={
        "user_id": "invalid-user-id",
        "month": 1,
        "goal_value": 10
    })
    assert response.status_code != 422

def test_set_carbon_goals_invalid_month():
    response = client.post("api/carbon-goals/set", json={
        "user_id": "e1ca2b93-314f-4a71-b6fb-3bb430157b1f",
        "month": 13,
        "goal_value": 10
    })
    assert response.status_code != 422

def test_set_carbon_goals_invalid_goal_value():
    response = client.post("api/carbon-goals/set", json={
        "user_id": "e1ca2b93-314f-4a71-b6fb-3bb430157b1f",
        "month": 1,
        "goal_value": -10
    })
    assert response.status_code != 422

def test_get_carbon_goals_standard_response():
    response = client.post("api/carbon-goals/get", json={
        "user_id": "e1ca2b93-314f-4a71-b6fb-3bb430157b1f",
        "month": 1
    })
    assert response.status_code == 200
    assert response.json() == {
        "status": 200,
        "message": "Success",
        "month": 1,
        "goal_value": 10
    }

def test_get_carbon_goals_invalid_user_id():
    response = client.post("api/carbon-goals/get", json={
        "user_id": "invalid-user-id",
        "month": 1
    })
    assert response.status_code != 422

def test_get_carbon_goals_invalid_month():
    response = client.post("api/carbon-goals/get", json={
        "user_id": "e1ca2b93-314f-4a71-b6fb-3bb430157b1f",
        "month": 13
    })
    assert response.status_code != 422
