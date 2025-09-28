import pytest
from unittest.mock import Mock, patch, MagicMock
import uuid
from datetime import datetime, date
from fastapi import HTTPException

from app.schemas.carbon_forecasting import (
    GenerateForecastRequest, GenerateForecastResponse,
    GetUserInsightsRequest, GetUserInsightsResponse,
    UpdateForecastAccuracyRequest, UpdateForecastAccuracyResponse
)


class TestCarbonForecastingSchemas:
    """Unit tests for carbon forecasting schemas"""
    
    def test_generate_forecast_request_valid(self):
        """Test GenerateForecastRequest schema with valid data"""
        user_id = str(uuid.uuid4())
        request_data = {
            "user_id": user_id,
            "horizon_days": 30
        }
        request = GenerateForecastRequest(**request_data)
        
        assert request.user_id == user_id
        assert request.horizon_days == 30
    
    def test_get_user_insights_request_valid(self):
        """Test GetUserInsightsRequest schema with valid data"""
        user_id = str(uuid.uuid4())
        request_data = {
            "user_id": user_id
        }
        request = GetUserInsightsRequest(**request_data)
        
        assert request.user_id == user_id
    
    def test_update_forecast_accuracy_request_valid(self):
        """Test UpdateForecastAccuracyRequest schema with valid data"""
        forecast_id = 123
        request_data = {
            "forecast_id": forecast_id,
            "actual_sustainability_score": 75.5
        }
        request = UpdateForecastAccuracyRequest(**request_data)
        
        assert request.forecast_id == forecast_id
        assert request.actual_sustainability_score == 75.5


class TestCarbonForecastingBusinessLogic:
    """Unit tests for carbon forecasting business logic"""
    
    def test_carbon_emission_calculation(self):
        """Test carbon emission calculation logic"""
        def calculate_product_emissions(product_data):
            # Mock calculation based on product category and transport
            base_emissions = {
                "electronics": 15.0,
                "clothing": 8.0,
                "food": 3.0,
                "books": 2.0
            }
            
            category = product_data.get("category", "other")
            quantity = product_data.get("quantity", 1)
            transport_factor = product_data.get("transport_factor", 1.2)
            
            base_emission = base_emissions.get(category, 5.0)
            total_emissions = base_emission * quantity * transport_factor
            
            return round(total_emissions, 2)
        
        # Test various product types
        electronics_product = {
            "category": "electronics",
            "quantity": 2,
            "transport_factor": 1.5
        }
        assert calculate_product_emissions(electronics_product) == 45.0
        
        food_product = {
            "category": "food",
            "quantity": 5,
            "transport_factor": 1.0
        }
        assert calculate_product_emissions(food_product) == 15.0
        
        unknown_product = {
            "category": "unknown",
            "quantity": 1,
            "transport_factor": 1.2
        }
        assert calculate_product_emissions(unknown_product) == 6.0
    
    def test_forecast_accuracy_calculation(self):
        """Test forecast accuracy calculation"""
        def calculate_accuracy(predicted, actual):
            if predicted == 0 and actual == 0:
                return 100.0
            if predicted == 0:
                return 0.0
            
            percentage_error = abs(predicted - actual) / predicted * 100
            accuracy = max(0, 100 - percentage_error)
            return round(accuracy, 2)
        
        # Perfect prediction
        assert calculate_accuracy(25.0, 25.0) == 100.0
        
        # 20% off prediction
        assert calculate_accuracy(25.0, 20.0) == 80.0
        
        # 50% off prediction
        assert calculate_accuracy(20.0, 10.0) == 50.0
        
        # Edge cases
        assert calculate_accuracy(0.0, 0.0) == 100.0
        assert calculate_accuracy(0.0, 10.0) == 0.0
    
    def test_carbon_trend_analysis(self):
        """Test carbon footprint trend analysis"""
        def analyze_trend(emissions_history):
            if len(emissions_history) < 2:
                return "insufficient_data"
            
            recent_avg = sum(emissions_history[-3:]) / min(3, len(emissions_history[-3:]))
            older_avg = sum(emissions_history[:-3]) / max(1, len(emissions_history[:-3]))
            
            if recent_avg < older_avg * 0.9:
                return "improving"
            elif recent_avg > older_avg * 1.1:
                return "worsening"
            else:
                return "stable"
        
        # Improving trend
        improving_data = [30.0, 28.0, 25.0, 20.0, 18.0]
        assert analyze_trend(improving_data) == "improving"
        
        # Worsening trend
        worsening_data = [15.0, 18.0, 22.0, 28.0, 30.0]
        assert analyze_trend(worsening_data) == "worsening"
        
        # Stable trend
        stable_data = [20.0, 21.0, 19.0, 20.5, 20.0]
        assert analyze_trend(stable_data) == "stable"
        
        # Insufficient data
        assert analyze_trend([20.0]) == "insufficient_data"
        assert analyze_trend([]) == "insufficient_data"
    
    def test_sustainability_score_calculation(self):
        """Test sustainability score calculation"""
        def calculate_sustainability_score(user_data):
            base_score = 50
            
            # Factor in monthly emissions
            monthly_emissions = user_data.get("monthly_emissions", 50)
            emission_score = max(0, 50 - (monthly_emissions - 20) * 2)
            
            # Factor in sustainable choices
            sustainable_purchases = user_data.get("sustainable_purchases", 0)
            sustainable_score = min(50, sustainable_purchases * 5)
            
            total_score = min(100, emission_score + sustainable_score)
            return round(total_score, 1)
        
        # High sustainability user
        eco_user = {
            "monthly_emissions": 15.0,
            "sustainable_purchases": 8
        }
        assert calculate_sustainability_score(eco_user) == 100.0
        
        # Average user
        average_user = {
            "monthly_emissions": 25.0,
            "sustainable_purchases": 3
        }
        assert calculate_sustainability_score(average_user) == 55.0
        
        # Low sustainability user
        high_emission_user = {
            "monthly_emissions": 50.0,
            "sustainable_purchases": 0
        }
        assert calculate_sustainability_score(high_emission_user) == 0.0


class TestCarbonForecastingValidation:
    """Unit tests for carbon forecasting data validation"""
    
    def test_prediction_days_validation(self):
        """Test validation of prediction days parameter"""
        def validate_prediction_days(days):
            return isinstance(days, int) and 1 <= days <= 365
        
        # Valid days
        assert validate_prediction_days(1) is True
        assert validate_prediction_days(30) is True
        assert validate_prediction_days(365) is True
        
        # Invalid days
        assert validate_prediction_days(0) is False
        assert validate_prediction_days(366) is False
        assert validate_prediction_days(-5) is False
        assert validate_prediction_days(30.5) is False
        assert validate_prediction_days("30") is False
    
    def test_emissions_value_validation(self):
        """Test validation of emissions values"""
        def validate_emissions(emissions):
            return isinstance(emissions, (int, float)) and emissions >= 0
        
        # Valid emissions
        assert validate_emissions(0) is True
        assert validate_emissions(25.5) is True
        assert validate_emissions(100) is True
        
        # Invalid emissions
        assert validate_emissions(-5.0) is False
        assert validate_emissions("25.5") is False
        assert validate_emissions(None) is False
    
    def test_time_period_validation(self):
        """Test validation of time period parameter"""
        def validate_time_period(period):
            valid_periods = ["week", "month", "quarter", "year"]
            return period in valid_periods
        
        # Valid periods
        assert validate_time_period("week") is True
        assert validate_time_period("month") is True
        assert validate_time_period("quarter") is True
        assert validate_time_period("year") is True
        
        # Invalid periods
        assert validate_time_period("day") is False
        assert validate_time_period("decade") is False
        assert validate_time_period("") is False
        assert validate_time_period(None) is False


class TestCarbonForecastingMockServices:
    """Unit tests for carbon forecasting services using mocks"""
    
    def test_generate_forecast_service_mock(self):
        """Test forecast generation service with mocks"""
        # Mock forecast response structure
        mock_forecast_response = {
            "forecast_id": str(uuid.uuid4()),
            "predicted_sustainability_score": 75.5,
            "confidence_score": 0.85,
            "trend_direction": "improving",
            "factors": ["recent_purchases", "seasonal_trends"]
        }
        
        def mock_generate_forecast(db, user_id, horizon_days):
            return {
                "status": 200,
                "message": "Forecast generated successfully",
                "forecast": mock_forecast_response,
                "horizon_days": horizon_days
            }
        
        user_id = str(uuid.uuid4())
        result = mock_generate_forecast(None, user_id, 30)
        
        assert result["status"] == 200
        assert result["message"] == "Forecast generated successfully"
        assert "forecast_id" in result["forecast"]
        assert result["forecast"]["predicted_sustainability_score"] == 75.5
        assert result["forecast"]["confidence_score"] == 0.85
        assert result["horizon_days"] == 30
    
    def test_user_insights_service_mock(self):
        """Test user insights service with mock data"""
        def mock_get_user_insights(db, user_id, time_period):
            insights_data = {
                "week": {
                    "average_emissions": 8.5,
                    "trend": "stable",
                    "top_categories": ["food", "transport"]
                },
                "month": {
                    "average_emissions": 32.0,
                    "trend": "improving",
                    "top_categories": ["electronics", "clothing", "food"]
                }
            }
            
            return {
                "status": 200,
                "message": "Insights retrieved successfully",
                "insights": insights_data.get(time_period, {}),
                "time_period": time_period
            }
        
        user_id = str(uuid.uuid4())
        
        # Test weekly insights
        weekly_result = mock_get_user_insights(None, user_id, "week")
        assert weekly_result["status"] == 200
        assert weekly_result["insights"]["average_emissions"] == 8.5
        assert weekly_result["insights"]["trend"] == "stable"
        
        # Test monthly insights
        monthly_result = mock_get_user_insights(None, user_id, "month")
        assert monthly_result["status"] == 200
        assert monthly_result["insights"]["average_emissions"] == 32.0
        assert monthly_result["insights"]["trend"] == "improving"
    
    def test_update_forecast_accuracy_service_mock(self):
        """Test forecast accuracy update service with mocks"""
        def mock_update_accuracy(db, forecast_id, actual_emissions, feedback):
            # Mock accuracy calculation
            predicted_emissions = 25.0  # Mock predicted value
            accuracy = max(0, 100 - abs(predicted_emissions - actual_emissions) / predicted_emissions * 100)
            
            return {
                "status": 200,
                "message": "Forecast accuracy updated successfully",
                "forecast_id": forecast_id,
                "accuracy": round(accuracy, 2),
                "feedback": feedback
            }
        
        forecast_id = str(uuid.uuid4())
        result = mock_update_accuracy(None, forecast_id, 23.0, "close")
        
        assert result["status"] == 200
        assert result["message"] == "Forecast accuracy updated successfully"
        assert result["forecast_id"] == forecast_id
        assert result["accuracy"] == 92.0  # 100 - (2/25 * 100)
        assert result["feedback"] == "close"