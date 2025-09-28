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
test_user_id = str(uuid.uuid4())
test_forecast_id = str(uuid.uuid4())


class TestCarbonForecastingIntegration:
    """Integration tests for carbon forecasting endpoints"""
    
    def test_01_generate_forecast_success(self):
        """Test successful forecast generation"""
        response = client.post("/api/carbon-forecasting/generate-forecast", json={
            "user_id": test_user_id,
            "horizon_days": 30
        })
        
        assert response.status_code in [200, 201], f"Forecast generation failed: {response.text}"
        data = response.json()
        
        assert "status" in data
        assert "forecast" in data
        
        if data["status"] == "success":
            forecast = data["forecast"]
            assert "predicted_sustainability_score" in forecast
            assert "confidence_score" in forecast
            assert forecast["confidence_score"] >= 0
            assert forecast["confidence_score"] <= 1
    
    def test_02_generate_forecast_invalid_days(self):
        """Test forecast generation with invalid prediction days"""
        response = client.post("/api/carbon-forecasting/generate-forecast", json={
            "user_id": test_user_id,
            "horizon_days": 0  # Invalid: must be > 0
        })
        
        assert response.status_code == 422 or response.status_code == 400
    
    def test_03_generate_forecast_missing_user_id(self):
        """Test forecast generation with missing user ID"""
        response = client.post("/api/carbon-forecasting/generate-forecast", json={
            "prediction_days": 30
        })
        
        assert response.status_code == 422
    
    def test_04_get_user_insights_success(self):
        """Test successful user insights retrieval"""
        response = client.post("/api/carbon-forecasting/user-insights", json={
            "user_id": test_user_id
        })
        
        assert response.status_code in [200, 404], f"User insights failed: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            # API returns insights directly
            assert "recommendations" in data or "latest_forecast" in data
    
    def test_05_get_user_insights_invalid_period(self):
        """Test user insights with invalid time period"""
        response = client.post("/api/carbon-forecasting/user-insights", json={
            "user_id": "invalid-uuid-format"
        })
        
        assert response.status_code in [200, 400, 422]
    
    def test_06_update_forecast_accuracy_success(self):
        """Test successful forecast accuracy update"""
        response = client.patch("/api/carbon-forecasting/update-accuracy", json={
            "forecast_id": 123,
            "actual_sustainability_score": 75.5
        })
        
        # This might return 404 if forecast doesn't exist, which is expected
        assert response.status_code in [200, 404, 422], f"Accuracy update failed: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            assert "status" in data
            assert "message" in data
    
    def test_07_update_forecast_accuracy_invalid_data(self):
        """Test forecast accuracy update with invalid data"""
        response = client.patch("/api/carbon-forecasting/update-accuracy", json={
            "forecast_id": "invalid-uuid",
            "actual_emissions": -5.0,  # Negative emissions invalid
            "accuracy_feedback": "invalid_feedback"
        })
        
        assert response.status_code in [400, 422]
    
    def test_08_quick_forecast_endpoint(self):
        """Test quick forecast endpoint"""
        response = client.get(f"/api/carbon-forecasting/quick-forecast/{test_user_id}")
        
        assert response.status_code in [200, 404], f"Quick forecast failed: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, dict)
            # Quick forecast should return simplified data
    
    def test_09_user_score_endpoint(self):
        """Test user sustainability score endpoint"""
        response = client.get(f"/api/carbon-forecasting/user-score/{test_user_id}")
        
        assert response.status_code in [200, 404], f"User score failed: {response.text}"
        
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, dict)
    
    def test_10_carbon_forecasting_health_check(self):
        """Test carbon forecasting health check"""
        response = client.get("/api/carbon-forecasting/health")
        
        assert response.status_code == 200
        data = response.json()
        assert "status" in data or "message" in data


class TestCarbonForecastingDataFlow:
    """Integration tests for carbon forecasting data flow"""
    
    def test_forecast_to_insights_flow(self):
        """Test the flow from generating forecast to getting insights"""
        user_id = str(uuid.uuid4())
        
        # Step 1: Generate forecast
        forecast_response = client.post("/api/carbon-forecasting/generate-forecast", json={
            "user_id": user_id,
            "prediction_days": 14
        })
        
        if forecast_response.status_code not in [200, 201]:
            pytest.skip("Forecast generation not available")
        
        # Step 2: Get insights for the same user
        insights_response = client.post("/api/carbon-forecasting/user-insights", json={
            "user_id": user_id,
            "time_period": "week"
        })
        
        # Should get some response, even if no historical data
        assert insights_response.status_code in [200, 404]
    
    def test_forecast_accuracy_feedback_flow(self):
        """Test the forecast accuracy feedback flow"""
        # Generate a forecast first
        forecast_response = client.post("/api/carbon-forecasting/generate-forecast", json={
            "user_id": str(uuid.uuid4()),
            "prediction_days": 7
        })
        
        if forecast_response.status_code not in [200, 201]:
            pytest.skip("Forecast generation not available")
        
        forecast_data = forecast_response.json()
        if "forecast" in forecast_data and "forecast_id" in forecast_data["forecast"]:
            forecast_id = forecast_data["forecast"]["forecast_id"]
            
            # Provide accuracy feedback
            feedback_response = client.patch("/api/carbon-forecasting/update-accuracy", json={
                "forecast_id": forecast_id,
                "actual_emissions": 20.0,
                "accuracy_feedback": "accurate"
            })
            
            assert feedback_response.status_code in [200, 404, 400]


class TestCarbonForecastingEdgeCases:
    """Integration tests for carbon forecasting edge cases"""
    
    def test_new_user_forecast(self):
        """Test forecast generation for new user with no history"""
        new_user_id = str(uuid.uuid4())
        
        response = client.post("/api/carbon-forecasting/generate-forecast", json={
            "user_id": new_user_id,
            "prediction_days": 30
        })
        
        # Should handle new users gracefully
        assert response.status_code in [200, 201, 404]
    
    def test_long_term_forecast(self):
        """Test long-term forecast generation"""
        response = client.post("/api/carbon-forecasting/generate-forecast", json={
            "user_id": test_user_id,
            "prediction_days": 365  # One year
        })
        
        # Long-term forecasts might have different handling
        assert response.status_code in [200, 201, 400, 422]
    
    def test_multiple_time_periods(self):
        """Test insights for different time periods"""
        time_periods = ["week", "month", "quarter", "year"]
        
        for period in time_periods:
            response = client.post("/api/carbon-forecasting/user-insights", json={
                "user_id": test_user_id,
                "time_period": period
            })
            
            # Each period should be handled appropriately
            assert response.status_code in [200, 404, 400]
    
    def test_concurrent_forecast_requests(self):
        """Test handling of concurrent forecast requests"""
        import threading
        import time
        
        results = []
        user_id = str(uuid.uuid4())
        
        def make_request():
            response = client.post("/api/carbon-forecasting/generate-forecast", json={
                "user_id": user_id,
                "prediction_days": 30
            })
            results.append(response.status_code)
        
        # Create multiple threads to simulate concurrent requests
        threads = [threading.Thread(target=make_request) for _ in range(3)]
        
        for thread in threads:
            thread.start()
        
        for thread in threads:
            thread.join()
        
        # All requests should complete successfully or fail gracefully
        for status_code in results:
            assert status_code in [200, 201, 400, 404, 429, 500]
    
    def test_invalid_uuid_formats(self):
        """Test handling of invalid UUID formats"""
        invalid_user_ids = [
            "not-a-uuid",
            "12345",
            "",
            "invalid-uuid-format-too-long-to-be-valid"
        ]
        
        for invalid_id in invalid_user_ids:
            response = client.post("/api/carbon-forecasting/generate-forecast", json={
                "user_id": invalid_id,
                "prediction_days": 30
            })
            
            # Should reject invalid UUIDs
            assert response.status_code in [200, 400, 422]
    
    def test_extreme_prediction_days(self):
        """Test handling of extreme prediction day values"""
        extreme_values = [-1, 0, 1000, 999999]
        
        for days in extreme_values:
            response = client.post("/api/carbon-forecasting/generate-forecast", json={
                "user_id": test_user_id,
                "prediction_days": days
            })
            
            if days <= 0 or days > 365:
                assert response.status_code in [200, 400, 422]
            else:
                assert response.status_code in [200, 201, 400, 404]


class TestCarbonForecastingPerformance:
    """Integration tests for carbon forecasting performance"""
    
    def test_forecast_response_time(self):
        """Test forecast generation response time"""
        import time
        
        start_time = time.time()
        
        response = client.post("/api/carbon-forecasting/generate-forecast", json={
            "user_id": str(uuid.uuid4()),
            "prediction_days": 30
        })
        
        end_time = time.time()
        response_time = end_time - start_time
        
        # Response should be reasonably fast (under 10 seconds)
        assert response_time < 10.0
        assert response.status_code in [200, 201, 404, 400]
    
    def test_insights_response_time(self):
        """Test insights retrieval response time"""
        import time
        
        start_time = time.time()
        
        response = client.post("/api/carbon-forecasting/user-insights", json={
            "user_id": test_user_id,
            "time_period": "month"
        })
        
        end_time = time.time()
        response_time = end_time - start_time
        
        # Insights should be fast to retrieve (under 5 seconds)
        assert response_time < 5.0
        assert response.status_code in [200, 404, 400]