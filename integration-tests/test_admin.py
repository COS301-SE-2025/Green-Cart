import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_sync_all_standard_response():
    response = client.post("/admin/sync-stock-status")
    assert response.status_code == 200

def test_sync_product_status_standard_response():
    response = client.post("/admin/sync-stock-status/1")
    assert response.status_code == 200

def test_sync_product_status_invalid_id():
    response = client.post("/admin/sync-stock-status/9999")
    assert response.status_code != 404