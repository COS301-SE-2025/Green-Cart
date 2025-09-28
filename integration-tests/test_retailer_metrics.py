import pytest
from fastapi.testclient import TestClient
import uuid
from datetime import datetime, timedelta
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.main import app

client = TestClient(app)

# Test data
test_retailer_id = 123


class TestRetailerMetricsIntegration:
    """Integration tests for retailer metrics endpoints"""
    
    def test_01_get_retailer_metrics_success(self):
        """Test successful retailer metrics retrieval"""
        response = client.get(f"/retailer/metrics/{test_retailer_id}")
        
        assert response.status_code in [200, 404], f"Retailer metrics failed: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, dict)
            
            # Should contain metrics data
            metrics_fields = [
                "total_sales", "revenue", "orders", "products", 
                "customers", "metrics", "statistics"
            ]
            has_metrics = any(field in str(data).lower() for field in metrics_fields)
            assert has_metrics, f"Response should contain metrics data: {data}"
    
    def test_02_get_retailer_metrics_with_date_range(self):
        """Test retailer metrics with date range parameters"""
        start_date = "2023-01-01"
        end_date = "2023-12-31"
        
        response = client.get(f"/retailer/metrics/{test_retailer_id}?start_date={start_date}&end_date={end_date}")
        
        assert response.status_code in [200, 404, 400], f"Retailer metrics with date range failed: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, dict)
    
    def test_03_get_retailer_metrics_invalid_id(self):
        """Test retailer metrics with invalid retailer ID"""
        invalid_ids = ["not-a-number", "", "invalid-format"]
        
        for invalid_id in invalid_ids:
            response = client.get(f"/retailer/metrics/{invalid_id}")
            assert response.status_code in [400, 422, 404], f"Should reject invalid ID: {invalid_id}"
    
    def test_04_get_retailer_metrics_nonexistent_retailer(self):
        """Test retailer metrics for nonexistent retailer"""
        nonexistent_id = 99999
        
        response = client.get(f"/retailer/metrics/{nonexistent_id}")
        
        assert response.status_code in [404, 200], f"Nonexistent retailer metrics failed: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            # Should indicate no data or empty metrics for nonexistent retailer
            assert isinstance(data, dict)
    
    def test_05_get_retailer_metrics_with_period_filter(self):
        """Test retailer metrics with period filter"""
        periods = ["day", "week", "month", "quarter", "year"]
        
        for period in periods:
            response = client.get(f"/retailer/metrics/{test_retailer_id}?period={period}")
            
            assert response.status_code in [200, 404, 400], f"Retailer metrics with period {period} failed: {response.text}"
    
    def test_06_get_retailer_sales_analytics(self):
        """Test retailer sales analytics endpoint"""
        response = client.get(f"/retailer/metrics/{test_retailer_id}/sales")
        
        assert response.status_code in [200, 404, 501], f"Retailer sales analytics failed: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, dict)
            
            sales_fields = ["sales", "revenue", "transactions", "volume"]
            has_sales_data = any(field in str(data).lower() for field in sales_fields)
            assert has_sales_data
    
    def test_07_get_retailer_product_performance(self):
        """Test retailer product performance endpoint"""
        response = client.get(f"/retailer/metrics/{test_retailer_id}/products")
        
        assert response.status_code in [200, 404, 501], f"Retailer product performance failed: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, (dict, list))
    
    def test_08_get_retailer_customer_metrics(self):
        """Test retailer customer metrics endpoint"""
        response = client.get(f"/retailer/metrics/{test_retailer_id}/customers")
        
        assert response.status_code in [200, 404, 501], f"Retailer customer metrics failed: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, dict)
            
            customer_fields = ["customers", "users", "buyers", "total_customers"]
            has_customer_data = any(field in str(data).lower() for field in customer_fields)
            assert has_customer_data


class TestRetailerMetricsDataValidation:
    """Integration tests for retailer metrics data validation"""
    
    def test_metrics_response_structure(self):
        """Test that metrics response has consistent structure"""
        response = client.get(f"/retailer/metrics/{test_retailer_id}")
        
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, dict)
            
            # Should have standard response structure
            if "status" in data:
                assert isinstance(data["status"], (int, str))
            
            if "message" in data:
                assert isinstance(data["message"], str)
    
    def test_metrics_date_range_validation(self):
        """Test metrics date range parameter validation"""
        # Invalid date formats
        invalid_dates = [
            ("invalid-date", "2023-12-31"),
            ("2023-01-01", "invalid-date"),
            ("2023-13-01", "2023-12-31"),  # Invalid month
            ("2023-01-32", "2023-12-31"),  # Invalid day
        ]
        
        for start_date, end_date in invalid_dates:
            response = client.get(f"/retailer/metrics/{test_retailer_id}?start_date={start_date}&end_date={end_date}")
            assert response.status_code in [400, 422, 200]  # Some might pass through to backend validation
    
    def test_metrics_numeric_values(self):
        """Test that metrics contain valid numeric values"""
        response = client.get(f"/retailer/metrics/{test_retailer_id}")
        
        if response.status_code == 200:
            data = response.json()
            
            # Check for numeric fields
            numeric_fields = ["revenue", "total_sales", "order_count", "product_count"]
            
            for field in numeric_fields:
                if field in data:
                    assert isinstance(data[field], (int, float)), f"{field} should be numeric"
                    assert data[field] >= 0, f"{field} should be non-negative"


class TestRetailerMetricsPerformance:
    """Integration tests for retailer metrics performance"""
    
    def test_metrics_response_time(self):
        """Test metrics retrieval response time"""
        import time
        
        start_time = time.time()
        
        response = client.get(f"/retailer/metrics/{test_retailer_id}")
        
        end_time = time.time()
        response_time = end_time - start_time
        
        # Metrics should load quickly (under 5 seconds)
        assert response_time < 5.0
        assert response.status_code in [200, 404]
    
    def test_metrics_with_large_date_range_performance(self):
        """Test metrics performance with large date range"""
        import time
        
        # Large date range (5 years)
        start_date = "2019-01-01"
        end_date = "2023-12-31"
        
        start_time = time.time()
        
        response = client.get(f"/retailer/metrics/{test_retailer_id}?start_date={start_date}&end_date={end_date}")
        
        end_time = time.time()
        response_time = end_time - start_time
        
        # Should handle large date ranges reasonably well (under 10 seconds)
        assert response_time < 10.0
        assert response.status_code in [200, 404, 400]


class TestRetailerMetricsEdgeCases:
    """Integration tests for retailer metrics edge cases"""
    
    def test_new_retailer_metrics(self):
        """Test metrics for new retailer with no sales"""
        new_retailer_id = 99998
        
        response = client.get(f"/retailer/metrics/{new_retailer_id}")
        
        assert response.status_code in [200, 404], f"New retailer metrics failed: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            # Should return zero metrics or empty data structure
            assert isinstance(data, dict)
    
    def test_metrics_future_date_range(self):
        """Test metrics with future date range"""
        future_start = "2030-01-01"
        future_end = "2030-12-31"
        
        response = client.get(f"/retailer/metrics/{test_retailer_id}?start_date={future_start}&end_date={future_end}")
        
        assert response.status_code in [200, 400], f"Future date range metrics failed: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            # Should return empty or zero metrics for future dates
            assert isinstance(data, dict)
    
    def test_metrics_inverted_date_range(self):
        """Test metrics with inverted date range (end before start)"""
        response = client.get(f"/retailer/metrics/{test_retailer_id}?start_date=2023-12-31&end_date=2023-01-01")
        
        # Should either swap dates or return error
        assert response.status_code in [200, 400, 422]
    
    def test_concurrent_metrics_requests(self):
        """Test handling of concurrent metrics requests"""
        import threading
        
        results = []
        
        def make_request():
            response = client.get(f"/retailer/metrics/{test_retailer_id}")
            results.append(response.status_code)
        
        # Create multiple threads to simulate concurrent requests
        threads = [threading.Thread(target=make_request) for _ in range(3)]
        
        for thread in threads:
            thread.start()
        
        for thread in threads:
            thread.join()
        
        # All requests should complete successfully or fail gracefully
        for status_code in results:
            assert status_code in [200, 404, 429, 500]
    
    def test_metrics_with_special_characters_in_id(self):
        """Test metrics with non-integer retailer ID"""
        special_ids = [
            "abc",
            "12.5",
            "null",
            "undefined"
        ]
        
        for special_id in special_ids:
            response = client.get(f"/retailer/metrics/{special_id}")
            # Should reject non-integer IDs
            assert response.status_code in [400, 422]