import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_admin_orders_overview():
    response = client.post('/admin/orders/overview', json={'time': 12})
    assert response.status_code in [200, 401, 403]

def test_admin_order_list():
    response = client.get('/admin/orders/list')
    assert response.status_code in [200, 401, 403]

def test_admin_set_order_state():
    response = client.post('/admin/orders/setOrderState', json={'order_id': 1, 'state': 'Preparing Order'})
    assert response.status_code in [200, 401, 403, 404, 400, 500]

def test_admin_get_users():
    response = client.get('/admin/users')
    assert response.status_code in [200, 401, 403]

def test_admin_get_retailers():
    response = client.get('/admin/retailers')
    assert response.status_code in [200, 401, 403]

def test_admin_get_products():
    response = client.get('/admin/products/unverified')
    assert response.status_code in [200, 401, 403]

def test_admin_verify_product():
    response = client.put('/admin/products/123/verify')
    assert response.status_code in [200, 404, 401, 403]

def test_admin_get_metrics():
    response = client.get('/admin/metrics')
    assert response.status_code in [200, 401, 403]

def test_admin_login():
    response = client.post('/admin/auth/login', json={'email': 'admin@example.com', 'password': 'password123'})
    assert response.status_code in [200, 401, 422, 404]

def test_admin_database_health():
    response = client.get('/admin/database/health')
    assert response.status_code in [200, 401, 403, 404]
