import sys
import os
from fastapi.testclient import TestClient

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.main import app

client = TestClient(app)


class TestSustainabilityIntegration:
    """Integration tests for sustainability functionality"""
    
    def test_01_fetch_sustainability_ratings_valid_product(self):
        """Test fetching sustainability ratings for a valid product"""
        response = client.post("/sustainability/ratings", json={
            "product_id": 1,  # Assuming product ID 1 exists
            "type": ["carbon_footprint", "energy_efficiency"]
        })

        assert response.status_code in [200, 404], f"Unexpected error: {response.text}"

        if response.status_code == 200:
            data = response.json()
            self._validate_sustainability_response(data)
    
    def test_02_fetch_sustainability_ratings_invalid_product(self):
        """Test fetching sustainability ratings for invalid product"""
        response = client.post("/sustainability/ratings", json={
            "product_id": 99999,  # Assuming this product doesn't exist
            "type": ["carbon_footprint"]
        })

        assert response.status_code in [200, 404], f"Unexpected error: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            # Might return empty data or default values
            assert isinstance(data, dict)
    
    def test_03_fetch_sustainability_ratings_multiple_types(self):
        """Test fetching multiple sustainability rating types"""
        response = client.post("/sustainability/ratings", json={
            "product_id": 1,
            "type": [
                "carbon_footprint", 
                "energy_efficiency", 
                "water_usage",
                "recyclability",
                "packaging"
            ]
        })

        assert response.status_code in [200, 404], f"Unexpected error: {response.text}"

        if response.status_code == 200:
            data = response.json()
            self._validate_sustainability_response(data)
            
            # Check if multiple types are handled properly
            if "statistics" in data and len(data["statistics"]) > 0:
                assert len(data["statistics"]) <= 5, "Should not return more statistics than requested types"
    
    def test_04_fetch_sustainability_ratings_single_type(self):
        """Test fetching single sustainability rating type"""
        response = client.post("/sustainability/ratings", json={
            "product_id": 1,
            "type": ["carbon_footprint"]
        })

        assert response.status_code in [200, 404], f"Unexpected error: {response.text}"

        if response.status_code == 200:
            data = response.json()
            self._validate_sustainability_response(data)
    
    def test_05_fetch_sustainability_ratings_empty_types(self):
        """Test fetching sustainability ratings with empty types array"""
        response = client.post("/sustainability/ratings", json={
            "product_id": 1,
            "type": []  # Empty types array
        })

        # Should handle empty types gracefully
        assert response.status_code in [200, 400, 422], f"Unexpected error: {response.text}"
    
    def test_06_fetch_sustainability_ratings_invalid_types(self):
        """Test fetching sustainability ratings with invalid types"""
        response = client.post("/sustainability/ratings", json={
            "product_id": 1,
            "type": ["invalid_type", "another_invalid_type"]
        })

        # Should handle invalid types gracefully
        assert response.status_code in [200, 400, 404], f"Unexpected error: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            # Might return empty statistics or default values
            assert isinstance(data, dict)
    
    def test_07_sustainability_ratings_response_consistency(self):
        """Test that sustainability ratings responses are consistent"""
        # Make the same request multiple times
        request_data = {
            "product_id": 1,
            "type": ["carbon_footprint", "energy_efficiency"]
        }
        
        responses = []
        for _ in range(3):
            response = client.post("/sustainability/ratings", json=request_data)
            if response.status_code == 200:
                responses.append(response.json())
        
        if len(responses) > 1:
            # All responses should have the same structure and similar values
            first_response = responses[0]
            for response in responses[1:]:
                assert response.keys() == first_response.keys(), "Response structure should be consistent"
                
                # Rating should be consistent (allowing for small variations)
                if "rating" in first_response and "rating" in response:
                    rating_diff = abs(first_response["rating"] - response["rating"])
                    assert rating_diff <= 1, "Rating should be consistent across requests"
    
    def test_08_sustainability_statistics_validation(self):
        """Test validation of sustainability statistics"""
        response = client.post("/sustainability/ratings", json={
            "product_id": 1,
            "type": ["carbon_footprint", "energy_efficiency", "water_usage"]
        })

        if response.status_code == 200:
            data = response.json()
            
            if "statistics" in data and data["statistics"]:
                for stat in data["statistics"]:
                    assert isinstance(stat, dict), "Each statistic should be a dictionary"
                    assert "value" in stat, "Statistic should have a value"
                    assert isinstance(stat["value"], (int, float)), "Statistic value should be numeric"
                    
                    # Validate value ranges
                    assert 0 <= stat["value"] <= 100, f"Statistic value should be 0-100, got {stat['value']}"
    
    def test_09_sustainability_rating_aggregation(self):
        """Test sustainability rating aggregation logic"""
        response = client.post("/sustainability/ratings", json={
            "product_id": 1,
            "type": ["carbon_footprint", "energy_efficiency", "recyclability"]
        })

        if response.status_code == 200:
            data = response.json()
            
            if "rating" in data and "statistics" in data:
                # Overall rating should be related to individual statistics
                assert isinstance(data["rating"], (int, float)), "Rating should be numeric"
                assert 0 <= data["rating"] <= 100, f"Rating should be 0-100, got {data['rating']}"
                
                if data["statistics"]:
                    # Rating should be reasonable compared to statistics
                    stat_values = [stat["value"] for stat in data["statistics"] if "value" in stat]
                    if stat_values:
                        avg_stats = sum(stat_values) / len(stat_values)
                        rating_diff = abs(data["rating"] - avg_stats)
                        # Allow some difference due to weighting or other factors
                        assert rating_diff <= 30, "Rating should be reasonably related to statistics"

    def _validate_sustainability_response(self, data):
        """Helper method to validate sustainability response structure"""
        assert isinstance(data, dict), "Response should be a dictionary"
        assert "status" in data, "Response should contain status"
        assert "message" in data, "Response should contain message"
        assert "rating" in data, "Response should contain rating"
        assert "statistics" in data, "Response should contain statistics"

        assert isinstance(data["status"], int), "Status should be an integer"
        assert isinstance(data["message"], str), "Message should be a string"
        assert isinstance(data["rating"], (int, float)), "Rating should be numeric"
        assert isinstance(data["statistics"], list), "Statistics should be a list"

        # Validate rating range
        assert 0 <= data["rating"] <= 100, f"Rating should be 0-100, got {data['rating']}"

        # Validate statistics if present
        if data["statistics"]:
            for stat in data["statistics"]:
                assert isinstance(stat, dict), "Each statistic should be a dictionary"
                assert "value" in stat, "Statistic should have a value"
                assert isinstance(stat["value"], (int, float)), "Statistic value should be numeric"
                assert 0 <= stat["value"] <= 100, f"Statistic value should be 0-100, got {stat['value']}"


class TestSustainabilityValidation:
    """Test sustainability endpoint validation"""
    
    def test_sustainability_missing_product_id(self):
        """Test sustainability request without product ID"""
        response = client.post("/sustainability/ratings", json={
            "type": ["carbon_footprint"]
            # Missing product_id
        })
        
        assert response.status_code == 422, "Should return validation error for missing product_id"
    
    def test_sustainability_missing_type(self):
        """Test sustainability request without type"""
        response = client.post("/sustainability/ratings", json={
            "product_id": 1
            # Missing type
        })
        
        # The API might handle missing type gracefully
        assert response.status_code in [200, 422], "Missing type test"
    
    def test_sustainability_invalid_product_id_type(self):
        """Test sustainability request with invalid product ID type"""
        response = client.post("/sustainability/ratings", json={
            "product_id": "invalid",  # Should be integer
            "type": ["carbon_footprint"]
        })
        
        assert response.status_code == 422, "Should return validation error for invalid product_id type"
    
    def test_sustainability_invalid_type_format(self):
        """Test sustainability request with invalid type format"""
        response = client.post("/sustainability/ratings", json={
            "product_id": 1,
            "type": "carbon_footprint"  # Should be array, not string
        })
        
        assert response.status_code == 422, "Should return validation error for invalid type format"
    
    def test_sustainability_negative_product_id(self):
        """Test sustainability request with negative product ID"""
        response = client.post("/sustainability/ratings", json={
            "product_id": -1,
            "type": ["carbon_footprint"]
        })
        
        # Might be handled at validation level or business logic level
        assert response.status_code in [400, 404, 422], "Should return error for negative product_id"
    
    def test_sustainability_zero_product_id(self):
        """Test sustainability request with zero product ID"""
        response = client.post("/sustainability/ratings", json={
            "product_id": 0,
            "type": ["carbon_footprint"]
        })
        
        # Zero might be invalid depending on business rules
        assert response.status_code in [200, 400, 404, 422], f"Unexpected response: {response.text}"


class TestSustainabilityPerformance:
    """Test sustainability endpoint performance and edge cases"""
    
    def test_sustainability_large_number_of_types(self):
        """Test sustainability request with many types"""
        many_types = [
            "carbon_footprint", "energy_efficiency", "water_usage",
            "recyclability", "packaging", "transportation",
            "manufacturing", "disposal", "renewable_energy"
        ]
        
        response = client.post("/sustainability/ratings", json={
            "product_id": 1,
            "type": many_types
        })
        
        # Should handle large number of types gracefully
        assert response.status_code in [200, 400, 404], f"Unexpected error: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            # Should not crash and should return reasonable response
            assert isinstance(data, dict)
    
    def test_sustainability_concurrent_requests(self):
        """Test multiple concurrent sustainability requests"""
        import threading
        import time
        
        results = []
        
        def make_request():
            response = client.post("/sustainability/ratings", json={
                "product_id": 1,
                "type": ["carbon_footprint"]
            })
            results.append(response.status_code)
        
        # Make multiple concurrent requests
        threads = []
        for _ in range(5):
            thread = threading.Thread(target=make_request)
            threads.append(thread)
            thread.start()
        
        for thread in threads:
            thread.join()
        
        # All requests should succeed or fail consistently
        assert len(results) == 5
        for status_code in results:
            assert status_code in [200, 404, 500], f"Unexpected status code: {status_code}"


# Legacy test function for backward compatibility
def test_fetch_sustainability_ratings():
    """Legacy test function"""
    test_instance = TestSustainabilityIntegration()
    test_instance.test_01_fetch_sustainability_ratings_valid_product()


if __name__ == "__main__":
    # Run all tests
    integration_tests = TestSustainabilityIntegration()
    validation_tests = TestSustainabilityValidation()
    performance_tests = TestSustainabilityPerformance()
    
    all_test_classes = [integration_tests, validation_tests, performance_tests]
    
    for test_class in all_test_classes:
        for method_name in dir(test_class):
            if method_name.startswith("test_"):
                method = getattr(test_class, method_name)
                try:
                    method()
                    print(f"✓ {method_name}")
                except Exception as e:
                    print(f"✗ {method_name}: {e}")

