from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# ---------------- PRODUCTS ----------------

def test_get_all_products_status_code():
    response = client.get("/products/")
    assert response.status_code == 200

def test_get_product_by_id_status_code():
    response = client.get("/products/1")
    assert response.status_code in [200, 404]

# ---------------- SEARCH ----------------

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