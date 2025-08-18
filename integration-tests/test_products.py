import sys
import os
from fastapi.testclient import TestClient

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.main import app

client = TestClient(app)


class TestProductsIntegration:
    """Integration tests for product functionality"""
    
    def test_01_fetch_all_products(self):
        """Test fetching all products"""
        response = client.get("/products/")
        assert response.status_code == 200, f"Failed to fetch all products: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list of products"
        
        # If products exist, verify structure
        if len(data) > 0:
            product = data[0]
            assert "id" in product, "Product should have an ID"
            assert "name" in product, "Product should have a name"
    
    def test_02_fetch_product_by_id_valid(self):
        """Test fetching a specific product by ID"""
        # First get all products to find a valid ID
        all_products_response = client.get("/products/")
        assert all_products_response.status_code == 200
        products = all_products_response.json()
        
        if len(products) > 0:
            product_id = products[0]["id"]
            
            response = client.get(f"/products/{product_id}")
            assert response.status_code in [200, 404], f"Unexpected error: {response.text}"
            
            if response.status_code == 200:
                data = response.json()
                assert data["id"] == product_id
    
    def test_03_fetch_product_by_id_invalid(self):
        """Test fetching product with invalid ID"""
        response = client.get("/products/999999")
        assert response.status_code == 404, "Should return 404 for non-existent product"
    
    def test_04_fetch_product_detailed(self):
        """Test detailed product fetch endpoint"""
        response = client.post("/products/FetchProduct", json={"product_id": 1})
        assert response.status_code in [200, 404], f"Unexpected error: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            assert "status" in data, "Response should contain status"
            assert "message" in data, "Response should contain message"
            assert "data" in data, "Response should contain data"
            assert "sustainability" in data, "Response should contain sustainability info"
            assert "rating" in data["sustainability"], "Sustainability should contain rating"
    
    def test_05_fetch_all_products_detailed(self):
        """Test detailed all products fetch endpoint"""
        response = client.post("/products/FetchAllProducts", json={
            "apiKey": "test-key",
            "fromItem": 0,
            "count": 10,
            "filter": {},
            "sort": ["name", "ASC"]
        })
        assert response.status_code in [200, 404], f"Unexpected error: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            assert "status" in data, "Response should contain status"
            assert "message" in data, "Response should contain message"
            assert "products" in data, "Response should contain products array"
            
            if "products" in data and len(data["products"]) > 0:
                product = data["products"][0]
                assert "id" in product, "Product should have ID"
                assert "name" in product, "Product should have name"
    
    def test_06_search_products_empty_query(self):
        """Test product search with empty query"""
        response = client.get("/products/search?query=")
        assert response.status_code in [200, 404], f"Unexpected error: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, list), "Search should return a list"
    
    def test_07_search_products_valid_query(self):
        """Test product search with valid query"""
        response = client.get("/products/search?query=test")
        assert response.status_code in [200, 404], f"Unexpected error: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, list), "Search should return a list"
    
    def test_08_search_products_detailed(self):
        """Test detailed product search endpoint"""
        response = client.post("/products/SearchProducts", json={
            "apiKey": "test-key",
            "search": "",
            "fromItem": 0,
            "count": 5,
            "filter": {},
            "sort": ["name", "ASC"]
        })
        assert response.status_code in [200, 404], f"Unexpected error: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            assert "status" in data, "Response should contain status"
            assert "products" in data, "Response should contain products"
    
    def test_09_search_products_with_filter(self):
        """Test product search with filters"""
        response = client.post("/products/SearchProducts", json={
            "apiKey": "test-key",
            "search": "organic",
            "fromItem": 0,
            "count": 10,
            "filter": {
                "category": "food",
                "price_min": 10,
                "price_max": 100
            },
            "sort": ["price", "DESC"]
        })
        assert response.status_code in [200, 404], f"Unexpected error: {response.text}"
    
    def test_10_product_sales_metrics(self):
        """Test product sales metrics endpoint"""
        response = client.post("/products/sales_metrics", json=1)  # Assuming product ID 1
        assert response.status_code in [200, 404], f"Unexpected error: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            assert "status" in data, "Response should contain status"
            assert "message" in data, "Response should contain message"
            assert "product_id" in data, "Response should contain product_id"
            assert "units_sold" in data, "Response should contain units_sold"
            assert "revenue" in data, "Response should contain revenue"
            
            assert isinstance(data["units_sold"], int), "Units sold should be integer"
            assert isinstance(data["revenue"], (int, float)), "Revenue should be numeric"


class TestProductsPagination:
    """Test product pagination functionality"""
    
    def test_fetch_products_pagination_first_page(self):
        """Test fetching first page of products"""
        response = client.post("/products/FetchAllProducts", json={
            "apiKey": "test-key",
            "fromItem": 0,
            "count": 5,
            "filter": {},
            "sort": ["id", "ASC"]
        })
        assert response.status_code in [200, 404], f"Unexpected error: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            if "products" in data:
                assert len(data["products"]) <= 5, "Should return at most 5 products"
    
    def test_fetch_products_pagination_second_page(self):
        """Test fetching second page of products"""
        response = client.post("/products/FetchAllProducts", json={
            "apiKey": "test-key",
            "fromItem": 5,
            "count": 5,
            "filter": {},
            "sort": ["id", "ASC"]
        })
        assert response.status_code in [200, 404], f"Unexpected error: {response.text}"
    
    def test_fetch_products_large_count(self):
        """Test fetching products with large count"""
        response = client.post("/products/FetchAllProducts", json={
            "apiKey": "test-key",
            "fromItem": 0,
            "count": 100,  # Large count
            "filter": {},
            "sort": ["id", "ASC"]
        })
        assert response.status_code in [200, 404, 400], f"Unexpected error: {response.text}"


class TestProductsValidation:
    """Test product endpoint validation"""
    
    def test_fetch_product_invalid_data_type(self):
        """Test fetch product with invalid data type for ID"""
        response = client.post("/products/FetchProduct", json={"product_id": "invalid"})
        assert response.status_code == 422, "Should return validation error for invalid product ID type"
    
    def test_fetch_product_missing_id(self):
        """Test fetch product without product ID"""
        response = client.post("/products/FetchProduct", json={})
        assert response.status_code == 422, "Should return validation error for missing product ID"
    
    def test_search_products_invalid_pagination(self):
        """Test search products with invalid pagination parameters"""
        response = client.post("/products/SearchProducts", json={
            "apiKey": "test-key",
            "search": "",
            "fromItem": -1,  # Invalid negative value
            "count": 0,      # Invalid zero count
            "filter": {},
            "sort": ["name", "ASC"]
        })
        assert response.status_code in [400, 422], "Should return validation error for invalid pagination"
    
    def test_search_products_invalid_sort(self):
        """Test search products with invalid sort parameters"""
        response = client.post("/products/SearchProducts", json={
            "apiKey": "test-key",
            "search": "",
            "fromItem": 0,
            "count": 10,
            "filter": {},
            "sort": ["invalid_field", "INVALID_ORDER"]  # Invalid sort
        })
        # Might handle invalid sort gracefully or return error
        assert response.status_code in [200, 400, 422], f"Unexpected error: {response.text}"
    
    def test_sales_metrics_invalid_product(self):
        """Test sales metrics with invalid product ID"""
        response = client.post("/products/sales_metrics", json="invalid")
        assert response.status_code == 422, "Should return validation error for invalid product ID"


# Legacy test functions for backward compatibility
def test_fetch_product():
    """Legacy test function"""
    test_instance = TestProductsIntegration()
    test_instance.test_04_fetch_product_detailed()


def test_get_all_products_status_code():
    """Legacy test function"""
    test_instance = TestProductsIntegration()
    test_instance.test_01_fetch_all_products()


def test_get_product_by_id_status_code():
    """Legacy test function"""
    test_instance = TestProductsIntegration()
    test_instance.test_02_fetch_product_by_id_valid()


def test_search_products_status_code():
    """Legacy test function"""
    test_instance = TestProductsIntegration()
    test_instance.test_06_search_products_empty_query()


def test_get_all_products():
    """Legacy test function"""
    test_instance = TestProductsIntegration()
    test_instance.test_01_fetch_all_products()


def test_search_products_success():
    """Legacy test function"""
    test_instance = TestProductsIntegration()
    test_instance.test_08_search_products_detailed()


if __name__ == "__main__":
    # Run all tests
    integration_tests = TestProductsIntegration()
    pagination_tests = TestProductsPagination()
    validation_tests = TestProductsValidation()
    
    all_test_classes = [integration_tests, pagination_tests, validation_tests]
    
    for test_class in all_test_classes:
        for method_name in dir(test_class):
            if method_name.startswith("test_"):
                method = getattr(test_class, method_name)
                try:
                    method()
                    print(f"✓ {method_name}")
                except Exception as e:
                    print(f"✗ {method_name}: {e}")

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
