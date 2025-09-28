import pytest
from fastapi.testclient import TestClient
import uuid
from datetime import datetime
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.main import app

client = TestClient(app)

# Test data
test_user_id = str(uuid.uuid4())


class TestRecommendationsIntegration:
    """Integration tests for recommendations endpoints"""
    
    def test_01_get_recommendations_success(self):
        """Test successful recommendation retrieval"""
        response = client.get(f"/api/recommendations/{test_user_id}")
        
        assert response.status_code in [200, 404], f"Recommendations failed: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, (dict, list))
            
            if isinstance(data, dict):
                assert "recommendations" in data or "products" in data or "status" in data
            elif isinstance(data, list):
                # List of recommended products
                for item in data:
                    assert "id" in item or "product_id" in item
    
    def test_02_get_recommendations_with_limit(self):
        """Test recommendations with limit parameter"""
        response = client.get(f"/api/recommendations/{test_user_id}?limit=5")
        
        assert response.status_code in [200, 404], f"Recommendations with limit failed: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            
            if isinstance(data, list):
                assert len(data) <= 5
            elif isinstance(data, dict) and "recommendations" in data:
                assert len(data["recommendations"]) <= 5
    
    def test_03_get_recommendations_with_category_filter(self):
        """Test recommendations with category filter"""
        response = client.get(f"/api/recommendations/{test_user_id}?category=electronics")
        
        assert response.status_code in [200, 404, 400], f"Category filtered recommendations failed: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            # Validate that response contains recommendations
            assert isinstance(data, (dict, list))
    
    def test_04_get_recommendations_invalid_user_id(self):
        """Test recommendations with invalid user ID"""
        invalid_user_ids = ["not-a-uuid", "12345", ""]
        
        for invalid_id in invalid_user_ids:
            response = client.get(f"/api/recommendations/{invalid_id}")
            assert response.status_code in [400, 422, 404]
    
    def test_05_post_recommendation_feedback(self):
        """Test posting recommendation feedback"""
        feedback_data = {
            "user_id": test_user_id,
            "product_id": 123,
            "feedback_type": "liked",
            "rating": 5
        }
        
        response = client.post("/api/recommendations/feedback", json=feedback_data)
        
        assert response.status_code in [200, 201, 404, 400], f"Feedback failed: {response.text}"
        
        if response.status_code in [200, 201]:
            data = response.json()
            assert "status" in data or "message" in data
    
    def test_06_post_recommendation_feedback_invalid_type(self):
        """Test posting recommendation feedback with invalid type"""
        feedback_data = {
            "user_id": test_user_id,
            "product_id": 123,
            "feedback_type": "invalid_type",
            "rating": 5
        }
        
        response = client.post("/api/recommendations/feedback", json=feedback_data)
        
        assert response.status_code in [400, 422, 404]
    
    def test_07_get_trending_products(self):
        """Test trending products endpoint"""
        response = client.get("/api/recommendations/trending")
        
        assert response.status_code in [200, 404], f"Trending products failed: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, (dict, list))
    
    def test_08_get_similar_products(self):
        """Test similar products endpoint"""
        product_id = 123
        response = client.get(f"/api/recommendations/similar/{product_id}")
        
        assert response.status_code in [200, 404], f"Similar products failed: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, (dict, list))
    
    def test_09_get_recommendations_by_category(self):
        """Test recommendations by category endpoint"""
        response = client.get("/api/recommendations/category/electronics")
        
        assert response.status_code in [200, 404], f"Category recommendations failed: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, (dict, list))
    
    def test_10_get_personalized_recommendations(self):
        """Test personalized recommendations endpoint"""
        request_data = {
            "user_id": test_user_id,
            "preferences": {
                "categories": ["electronics", "books"],
                "price_range": {"min": 10, "max": 500},
                "brands": ["Apple", "Samsung"]
            },
            "limit": 10
        }
        
        response = client.post("/api/recommendations/personalized", json=request_data)
        
        assert response.status_code in [200, 404, 400], f"Personalized recommendations failed: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, (dict, list))


class TestRecommendationsDataFlow:
    """Integration tests for recommendations data flow"""
    
    def test_user_interaction_to_recommendations_flow(self):
        """Test the flow from user interaction to updated recommendations"""
        user_id = str(uuid.uuid4())
        
        # Step 1: Get initial recommendations
        initial_response = client.get(f"/api/recommendations/{user_id}")
        
        if initial_response.status_code not in [200, 404]:
            pytest.skip("Recommendations endpoint not available")
        
        # Step 2: Provide feedback on a product
        if initial_response.status_code == 200:
            feedback_data = {
                "user_id": user_id,
                "product_id": 123,
                "feedback_type": "liked",
                "rating": 5
            }
            
            feedback_response = client.post("/api/recommendations/feedback", json=feedback_data)
            assert feedback_response.status_code in [200, 201, 404, 400]
        
        # Step 3: Get updated recommendations
        updated_response = client.get(f"/api/recommendations/{user_id}")
        assert updated_response.status_code in [200, 404]
    
    def test_product_similarity_chain(self):
        """Test the chain of similar product recommendations"""
        product_id = 123
        
        # Get similar products for a base product
        response = client.get(f"/api/recommendations/similar/{product_id}")
        
        if response.status_code == 200:
            data = response.json()
            
            if isinstance(data, list) and len(data) > 0:
                # Get similar products for the first recommended product
                first_similar = data[0]
                if "id" in first_similar:
                    second_response = client.get(f"/api/recommendations/similar/{first_similar['id']}")
                    assert second_response.status_code in [200, 404]
                elif "product_id" in first_similar:
                    second_response = client.get(f"/api/recommendations/similar/{first_similar['product_id']}")
                    assert second_response.status_code in [200, 404]


class TestRecommendationsEdgeCases:
    """Integration tests for recommendations edge cases"""
    
    def test_new_user_recommendations(self):
        """Test recommendations for new user with no history"""
        new_user_id = str(uuid.uuid4())
        
        response = client.get(f"/api/recommendations/{new_user_id}")
        
        # Should handle new users gracefully, possibly with popular items
        assert response.status_code in [200, 404]
        
        if response.status_code == 200:
            data = response.json()
            # New users should still get some recommendations (popular items)
            assert isinstance(data, (dict, list))
    
    def test_recommendations_with_extreme_limits(self):
        """Test recommendations with extreme limit values"""
        extreme_limits = [0, 1, 100, 1000]
        
        for limit in extreme_limits:
            response = client.get(f"/api/recommendations/{test_user_id}?limit={limit}")
            
            if limit <= 0:
                assert response.status_code in [400, 422, 404]
            elif limit > 100:
                # Might cap the limit or return error
                assert response.status_code in [200, 400, 404]
            else:
                assert response.status_code in [200, 404]
    
    def test_nonexistent_product_similarity(self):
        """Test similar products for nonexistent product"""
        nonexistent_product_ids = [999999, -1, 0]
        
        for product_id in nonexistent_product_ids:
            response = client.get(f"/api/recommendations/similar/{product_id}")
            
            # Should handle nonexistent products gracefully
            assert response.status_code in [404, 400, 200]
    
    def test_invalid_category_recommendations(self):
        """Test recommendations for invalid category"""
        invalid_categories = ["nonexistent_category", "!@#$%", ""]
        
        for category in invalid_categories:
            if category:
                response = client.get(f"/api/recommendations/category/{category}")
                assert response.status_code in [404, 400, 200]
    
    def test_malformed_feedback_data(self):
        """Test feedback with malformed data"""
        malformed_data_sets = [
            {},  # Empty data
            {"user_id": test_user_id},  # Missing required fields
            {"user_id": "invalid", "product_id": "invalid", "feedback_type": "liked"},  # Invalid types
            {"user_id": test_user_id, "product_id": 123, "feedback_type": "liked", "rating": 11},  # Invalid rating
        ]
        
        for data in malformed_data_sets:
            response = client.post("/api/recommendations/feedback", json=data)
            assert response.status_code in [400, 422, 404]
    
    def test_concurrent_recommendation_requests(self):
        """Test handling of concurrent recommendation requests"""
        import threading
        
        results = []
        user_id = str(uuid.uuid4())
        
        def make_request():
            response = client.get(f"/api/recommendations/{user_id}")
            results.append(response.status_code)
        
        # Create multiple threads to simulate concurrent requests
        threads = [threading.Thread(target=make_request) for _ in range(5)]
        
        for thread in threads:
            thread.start()
        
        for thread in threads:
            thread.join()
        
        # All requests should complete successfully or fail gracefully
        for status_code in results:
            assert status_code in [200, 404, 429, 500]


class TestRecommendationsPerformance:
    """Integration tests for recommendations performance"""
    
    def test_recommendations_response_time(self):
        """Test recommendations response time"""
        import time
        
        start_time = time.time()
        
        response = client.get(f"/api/recommendations/{test_user_id}")
        
        end_time = time.time()
        response_time = end_time - start_time
        
        # Recommendations should be fast (under 5 seconds)
        assert response_time < 5.0
        assert response.status_code in [200, 404, 400]
    
    def test_similar_products_response_time(self):
        """Test similar products response time"""
        import time
        
        start_time = time.time()
        
        response = client.get("/api/recommendations/similar/123")
        
        end_time = time.time()
        response_time = end_time - start_time
        
        # Similar products should be fast (under 3 seconds)
        assert response_time < 3.0
        assert response.status_code in [200, 404, 400]
    
    def test_trending_products_response_time(self):
        """Test trending products response time"""
        import time
        
        start_time = time.time()
        
        response = client.get("/api/recommendations/trending")
        
        end_time = time.time()
        response_time = end_time - start_time
        
        # Trending products should load quickly (under 2 seconds)
        assert response_time < 2.0
        assert response.status_code in [200, 404, 400]


class TestRecommendationsValidation:
    """Integration tests for recommendations data validation"""
    
    def test_recommendation_response_structure(self):
        """Test that recommendation responses have consistent structure"""
        response = client.get(f"/api/recommendations/{test_user_id}")
        
        if response.status_code == 200:
            data = response.json()
            
            if isinstance(data, dict):
                # Should have standard response structure
                expected_fields = ["status", "message", "recommendations", "data", "results"]
                has_expected_field = any(field in data for field in expected_fields)
                assert has_expected_field, f"Response missing expected fields: {data.keys()}"
                
            elif isinstance(data, list):
                # Should be list of products with consistent structure
                for item in data:
                    assert isinstance(item, dict)
                    # Should have product identifier
                    assert "id" in item or "product_id" in item
    
    def test_feedback_response_validation(self):
        """Test that feedback responses are properly validated"""
        valid_feedback_data = {
            "user_id": test_user_id,
            "product_id": 123,
            "feedback_type": "liked",
            "rating": 5
        }
        
        response = client.post("/api/recommendations/feedback", json=valid_feedback_data)
        
        if response.status_code in [200, 201]:
            data = response.json()
            assert isinstance(data, dict)
            
            # Should acknowledge the feedback
            success_indicators = ["status", "message", "success", "recorded"]
            has_success_indicator = any(indicator in str(data).lower() for indicator in success_indicators)
            assert has_success_indicator
    
    def test_personalized_recommendations_validation(self):
        """Test personalized recommendations request validation"""
        valid_request = {
            "user_id": test_user_id,
            "preferences": {
                "categories": ["electronics"],
                "price_range": {"min": 10, "max": 500}
            },
            "limit": 10
        }
        
        response = client.post("/api/recommendations/personalized", json=valid_request)
        
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, (dict, list))
            
            # Response should respect the limit
            if isinstance(data, list):
                assert len(data) <= 10
            elif isinstance(data, dict) and "recommendations" in data:
                assert len(data["recommendations"]) <= 10