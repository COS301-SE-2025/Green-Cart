"""
Carbon Forecasting Schemas
=========================
Pydantic models for request/response validation and serialization
for the ultra-intelligent carbon forecasting system.
"""

from pydantic import BaseModel, Field, validator
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum

class ForecastTypeEnum(str, Enum):
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"
    quarterly = "quarterly"
    yearly = "yearly"

class TrendDirectionEnum(str, Enum):
    improving = "improving"
    declining = "declining"
    stable = "stable"
    volatile = "volatile"

class AlgorithmEnum(str, Enum):
    linear_regression = "linear_regression"
    exponential_smoothing = "exponential_smoothing"
    arima = "arima"
    seasonal_decomposition = "seasonal_decomposition"
    neural_network = "neural_network"
    ensemble = "ensemble"

# Request Schemas
class GenerateForecastRequest(BaseModel):
    user_id: str = Field(..., description="User ID for forecast generation")
    horizon_days: int = Field(30, ge=1, le=365, description="Forecast horizon in days (1-365)")
    algorithm: AlgorithmEnum = Field(AlgorithmEnum.ensemble, description="Forecasting algorithm to use")
    
    class Config:
        schema_extra = {
            "example": {
                "user_id": "123e4567-e89b-12d3-a456-426614174000",
                "horizon_days": 30,
                "algorithm": "ensemble"
            }
        }

class GetUserInsightsRequest(BaseModel):
    user_id: str = Field(..., description="User ID for insights retrieval")
    
    class Config:
        schema_extra = {
            "example": {
                "user_id": "123e4567-e89b-12d3-a456-426614174000"
            }
        }

class UpdateForecastAccuracyRequest(BaseModel):
    forecast_id: int = Field(..., description="Forecast ID to update")
    actual_sustainability_score: float = Field(..., ge=0, le=100, description="Actual measured sustainability score (0-100)")
    
    class Config:
        schema_extra = {
            "example": {
                "forecast_id": 123,
                "actual_sustainability_score": 75.5
            }
        }

class GetForecastHistoryRequest(BaseModel):
    user_id: str = Field(..., description="User ID")
    limit: int = Field(10, ge=1, le=100, description="Number of forecasts to retrieve")
    forecast_type: Optional[ForecastTypeEnum] = Field(None, description="Filter by forecast type")

# Response Schemas
class ForecastPrediction(BaseModel):
    predicted_sustainability_score: float = Field(..., ge=0, le=100, description="Predicted sustainability score (0-100)")
    improvement_potential: float = Field(..., ge=0, le=100, description="Potential improvement in sustainability score")
    confidence_score: float = Field(..., ge=0, le=1, description="Prediction confidence (0-1)")
    trend_direction: TrendDirectionEnum = Field(..., description="Trend direction")
    seasonal_factor: float = Field(..., description="Seasonal adjustment factor")
    behavioral_score: float = Field(..., ge=0, le=1, description="User behavior consistency score")
    prediction_factors: Dict[str, Any] = Field(..., description="Detailed prediction factors")
    algorithm_metadata: Dict[str, Any] = Field(..., description="Algorithm-specific metadata")

class ConfidenceIntervals(BaseModel):
    lower_bound: float = Field(..., description="Lower confidence bound")
    upper_bound: float = Field(..., description="Upper confidence bound")
    confidence_level: float = Field(..., description="Confidence level")

class GenerateForecastResponse(BaseModel):
    status: str = Field(..., description="Response status")
    forecast: ForecastPrediction = Field(..., description="Forecast prediction data")
    confidence_intervals: Optional[ConfidenceIntervals] = Field(None, description="Confidence intervals")
    
    class Config:
        schema_extra = {
            "example": {
                "status": "success",
                "forecast": {
                    "predicted_sustainability_score": 75.5,
                    "improvement_potential": 20.0,
                    "confidence_score": 0.85,
                    "trend_direction": "improving",
                    "seasonal_factor": 0.95,
                    "behavioral_score": 0.78,
                    "prediction_factors": {
                        "data_points": 15,
                        "trend_slope": 0.2
                    },
                    "algorithm_metadata": {
                        "algorithm": "sustainability_scoring",
                        "data_quality_score": 0.85
                    }
                }
            }
        }

class ShoppingPatterns(BaseModel):
    avg_orders_per_week: Optional[float] = Field(None, description="Average orders per week")
    avg_order_value: Optional[float] = Field(None, description="Average order value")
    avg_sustainability_score_per_order: Optional[float] = Field(None, ge=0, le=100, description="Average sustainability score per order")
    eco_consciousness_score: Optional[float] = Field(None, ge=0, le=100, description="Eco-consciousness score (0-100)")
    sustainable_product_ratio: Optional[float] = Field(None, ge=0, le=1, description="Ratio of sustainable products")
    sustainability_trend_30d: Optional[float] = Field(None, description="30-day sustainability trend percentage")
    goals_achievement_rate: Optional[float] = Field(None, ge=0, le=1, description="Goals achievement rate")
    
class ImpactMetrics(BaseModel):
    total_lifetime_sustainability_score: Optional[float] = Field(None, ge=0, le=100, description="Total lifetime sustainability score")
    total_lifetime_improvement: Optional[float] = Field(None, description="Total lifetime improvement")
    sustainability_efficiency_score: Optional[float] = Field(None, description="Sustainability score per order")
    percentile_rank: Optional[float] = Field(None, description="Percentile rank among users")
    streak_days: Optional[int] = Field(None, description="Consecutive improvement days")

class LatestForecast(BaseModel):
    predicted_sustainability_score: float = Field(..., ge=0, le=100, description="Predicted sustainability score")
    improvement_potential: float = Field(..., ge=0, le=100, description="Improvement potential")
    confidence: float = Field(..., description="Confidence score")
    trend: TrendDirectionEnum = Field(..., description="Trend direction")
    created_at: str = Field(..., description="Forecast creation timestamp")

class GetUserInsightsResponse(BaseModel):
    latest_forecast: Optional[LatestForecast] = Field(None, description="Latest forecast data")
    shopping_patterns: Optional[ShoppingPatterns] = Field(None, description="User shopping patterns")
    impact_metrics: Optional[ImpactMetrics] = Field(None, description="Carbon impact metrics")
    recommendations: List[str] = Field([], description="Personalized recommendations")
    
    class Config:
        schema_extra = {
            "example": {
                "latest_forecast": {
                    "predicted_sustainability_score": 75.5,
                    "improvement_potential": 20.0,
                    "confidence": 0.85,
                    "trend": "improving",
                    "created_at": "2025-09-22T10:30:00Z"
                },
                "shopping_patterns": {
                    "avg_orders_per_week": 2.5,
                    "eco_consciousness_score": 78.0,
                    "sustainability_trend_30d": 15.2,
                    "goals_achievement_rate": 0.85
                },
                "recommendations": [
                    "Continue choosing sustainable products to maintain your positive trend",
                    "Consider setting a more ambitious carbon goal for next month"
                ]
            }
        }

class ForecastHistoryItem(BaseModel):
    id: int = Field(..., description="Forecast ID")
    forecast_type: ForecastTypeEnum = Field(..., description="Type of forecast")
    predicted_emissions: float = Field(..., description="Predicted emissions")
    predicted_reduction: float = Field(..., description="Predicted reduction")
    confidence_score: float = Field(..., description="Confidence score")
    trend_direction: TrendDirectionEnum = Field(..., description="Trend direction")
    target_date: datetime = Field(..., description="Target date for forecast")
    created_at: datetime = Field(..., description="When forecast was created")
    accuracy_percentage: Optional[float] = Field(None, description="Actual accuracy if measured")

class GetForecastHistoryResponse(BaseModel):
    status: str = Field(..., description="Response status")
    forecasts: List[ForecastHistoryItem] = Field(..., description="Historical forecasts")
    total_count: int = Field(..., description="Total number of forecasts")

class UpdateForecastAccuracyResponse(BaseModel):
    status: str = Field(..., description="Response status")
    message: str = Field(..., description="Success message")
    accuracy_percentage: float = Field(..., description="Calculated accuracy percentage")

# Advanced Analytics Schemas
class CarbonReductionAnalytics(BaseModel):
    total_reduction_potential: float = Field(..., description="Total possible reduction")
    monthly_reduction_target: float = Field(..., description="Monthly reduction target")
    current_trajectory: TrendDirectionEnum = Field(..., description="Current trajectory")
    projected_annual_savings: float = Field(..., description="Projected annual savings")
    carbon_neutrality_eta: Optional[str] = Field(None, description="Estimated carbon neutrality date")

class BehavioralInsights(BaseModel):
    consistency_score: float = Field(..., ge=0, le=1, description="Behavioral consistency")
    improvement_areas: List[str] = Field(..., description="Areas for improvement")
    success_factors: List[str] = Field(..., description="Current success factors")
    risk_factors: List[str] = Field(..., description="Risk factors for goal achievement")

class SeasonalAnalysis(BaseModel):
    seasonal_patterns: Dict[str, float] = Field(..., description="Monthly seasonal factors")
    peak_emission_months: List[str] = Field(..., description="Months with highest emissions")
    best_reduction_months: List[str] = Field(..., description="Months with best reductions")
    seasonal_recommendations: List[str] = Field(..., description="Season-specific recommendations")

class ComprehensiveAnalyticsResponse(BaseModel):
    status: str = Field(..., description="Response status")
    reduction_analytics: CarbonReductionAnalytics = Field(..., description="Reduction analytics")
    behavioral_insights: BehavioralInsights = Field(..., description="Behavioral insights")
    seasonal_analysis: SeasonalAnalysis = Field(..., description="Seasonal analysis")
    model_performance: Dict[str, float] = Field(..., description="Forecasting model performance metrics")

class GetComprehensiveAnalyticsRequest(BaseModel):
    user_id: str = Field(..., description="User ID for analytics")
    analysis_period_days: int = Field(365, ge=30, le=1095, description="Analysis period in days")

# Recommendation Engine Schemas
class PersonalizedRecommendation(BaseModel):
    category: str = Field(..., description="Recommendation category")
    title: str = Field(..., description="Recommendation title")
    description: str = Field(..., description="Detailed description")
    impact_estimate: float = Field(..., description="Estimated carbon impact in kg CO2")
    difficulty_level: str = Field(..., description="Implementation difficulty")
    confidence: float = Field(..., ge=0, le=1, description="Recommendation confidence")

class GetPersonalizedRecommendationsRequest(BaseModel):
    user_id: str = Field(..., description="User ID")
    max_recommendations: int = Field(5, ge=1, le=20, description="Maximum number of recommendations")
    categories: Optional[List[str]] = Field(None, description="Filter by categories")

class GetPersonalizedRecommendationsResponse(BaseModel):
    status: str = Field(..., description="Response status")
    recommendations: List[PersonalizedRecommendation] = Field(..., description="Personalized recommendations")
    total_impact_potential: float = Field(..., description="Total potential carbon impact")

# Comparative Analytics Schemas
class UserComparison(BaseModel):
    user_percentile: float = Field(..., description="User's percentile ranking")
    average_emissions: float = Field(..., description="Average user emissions")
    user_emissions: float = Field(..., description="Current user emissions")
    improvement_vs_average: float = Field(..., description="Improvement vs average")
    top_performers_avg: float = Field(..., description="Top 10% performers average")

class GetComparativeAnalyticsRequest(BaseModel):
    user_id: str = Field(..., description="User ID")
    comparison_period_days: int = Field(30, ge=7, le=365, description="Comparison period")

class GetComparativeAnalyticsResponse(BaseModel):
    status: str = Field(..., description="Response status")
    user_comparison: UserComparison = Field(..., description="User comparison metrics")
    benchmark_categories: Dict[str, float] = Field(..., description="Category-wise benchmarks")
    achievement_badges: List[str] = Field(..., description="Earned achievement badges")

# Error Schemas
class ErrorResponse(BaseModel):
    status: str = Field("error", description="Error status")
    message: str = Field(..., description="Error message")
    error_code: Optional[str] = Field(None, description="Specific error code")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")

# Success Schemas
class SuccessResponse(BaseModel):
    status: str = Field("success", description="Success status")
    message: str = Field(..., description="Success message")