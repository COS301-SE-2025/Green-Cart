import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# products

def test_fetch_product():
    response = client.post("/products/FetchProduct", json={"product_id": 1})
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "message" in data
    assert "data" in data
    assert "sustainability" in data
    assert "rating" in data["sustainability"]

def test_get_all_products_status_code():
    response = client.get("/products/")
    assert response.status_code == 200

def test_get_product_by_id_status_code():
    response = client.get("/products/1")
    assert response.status_code in [200, 404]

#Tests for search

def test_search_products_status_code():
    response = client.get("/products/search?query=test")
    assert response.status_code in [200, 404]

def test_get_all_products():
    response = client.get("/products/")
    assert response.status_code == 200

def test_search_products_success():
    response = client.post("/products/SearchProducts", json={
        "apiKey": "test-key",
        "search": "",
        "fromItem": 0,
        "count": 5,
        "filter": {},
        "sort": ["name", "ASC"]
    })
    assert response.status_code == 200

def test_search_products_invalid_sort_field():
    response = client.post("/products/SearchProducts", json={
        "apiKey": "test-key",
        "search": "",
        "fromItem": 0,
        "count": 5,
        "filter": {},
        "sort": ["nonexistent_field", "ASC"]
    })
    assert response.status_code == 400

def test_search_products_invalid_sort_order():
    response = client.post("/products/SearchProducts", json={
        "apiKey": "test-key",
        "search": "",
        "fromItem": 0,
        "count": 5,
        "filter": {},
        "sort": ["name", "RANDOM"]
    })
    assert response.status_code == 400

def test_search_products_negative_fromItem():
    response = client.post("/products/SearchProducts", json={
        "apiKey": "test-key",
        "search": "",
        "fromItem": -1,
        "count": 5,
        "filter": {},
        "sort": ["name", "ASC"]
    })
    assert response.status_code == 400

def test_search_products_zero_count():
    response = client.post("/products/SearchProducts", json={
        "apiKey": "test-key",
        "search": "",
        "fromItem": 0,
        "count": 0,
        "filter": {},
        "sort": ["name", "ASC"]
    })
    assert response.status_code == 400
