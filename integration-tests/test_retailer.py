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