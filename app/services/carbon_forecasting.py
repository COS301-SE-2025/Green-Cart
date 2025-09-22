import math
import numpy as np
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional, Any
from sqlalchemy.orm import Session
from sqlalchemy import text, func
from dataclasses import dataclass
from enum import Enum
from decimal import Decimal

logger = logging.getLogger(__name__)

def safe_float_convert(value) -> float:
    """Safely convert Decimal, None, or other numeric types to float"""
    if value is None:
        return 0.0
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (int, float)):
        return float(value)
    try:
        return float(value)
    except (ValueError, TypeError):
        return 0.0

class ForecastAlgorithm(Enum):
    LINEAR_REGRESSION = "linear_regression"
    EXPONENTIAL_SMOOTHING = "exponential_smoothing"
    ENSEMBLE = "ensemble"

@dataclass
class ForecastResult:
    predicted_emissions: float
    predicted_reduction: float
    confidence_score: float
    trend_direction: str
    seasonal_factor: float
    behavioral_score: float
    prediction_factors: Dict[str, Any]
    algorithm_metadata: Dict[str, Any]

class SimpleCarbonForecastingEngine:
    """Simplified carbon forecasting engine without database dependencies"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def generate_forecast(
        self, 
        user_id: str, 
        forecast_horizon_days: int = 30
    ) -> ForecastResult:
        """Generate carbon emissions forecast using existing data"""
        
        logger.info(f"Generating forecast for user {user_id}")
        
        # Get user data from existing tables
        user_data = await self._gather_user_data(user_id)
        
        # Generate forecast
        forecast = await self._calculate_forecast(user_data, forecast_horizon_days)
        
        return forecast
    
    async def _gather_user_data(self, user_id: str) -> Dict[str, Any]:
        """Gather user data from existing tables"""
        
        # Get order history with sustainability data
        orders_query = text("""
            SELECT 
                o.id,
                o.created_at,
                COALESCE(SUM(ci.quantity * p.price), 0) as order_value,
                COALESCE(AVG(sr.value), 2.5) as avg_sustainability_rating,
                COUNT(ci.id) as item_count
            FROM orders o
            LEFT JOIN carts c ON o.cart_id = c.id
            LEFT JOIN cart_items ci ON c.id = ci.cart_id
            LEFT JOIN products p ON ci.product_id = p.id
            LEFT JOIN sustainability_ratings sr ON p.id = sr.product_id
            WHERE o.user_id = :user_id AND o.state != 'Cancelled'
            GROUP BY o.id, o.created_at
            ORDER BY o.created_at DESC
            LIMIT 50
        """)
        
        orders_result = self.db.execute(orders_query, {"user_id": user_id}).fetchall()
        
        # Get carbon goals
        goals_query = text("""
            SELECT month, goal_value
            FROM carbon_goals
            WHERE user_id = :user_id
            ORDER BY month
        """)
        
        try:
            goals_result = self.db.execute(goals_query, {"user_id": user_id}).fetchall()
        except:
            goals_result = []  # Table might not exist
        
        return {
            "orders": [dict(row._mapping) for row in orders_result],
            "goals": {row.month: float(row.goal_value) for row in goals_result} if goals_result else {},
            "user_id": user_id
        }
    
    async def _calculate_forecast(self, user_data: Dict[str, Any], horizon_days: int) -> ForecastResult:
        """Calculate forecast based on user data"""
        
        orders = user_data["orders"]
        
        if len(orders) < 2:
            return self._default_forecast()
        
        # Calculate basic metrics
        order_values = []
        sustainability_values = []
        carbon_values = []
        
        for order in orders:
            order_val = safe_float_convert(order["order_value"])
            sustainability_val = safe_float_convert(order["avg_sustainability_rating"])
            
            if order_val > 0:
                order_values.append(order_val)
                sustainability_values.append(sustainability_val)
                
                # Estimate carbon footprint
                carbon = self._estimate_carbon_footprint(order_val, sustainability_val)
                carbon_values.append(carbon)
        
        if not carbon_values:
            return self._default_forecast()
        
        # Calculate trends
        recent_carbon = np.mean(carbon_values[:5]) if len(carbon_values) >= 5 else np.mean(carbon_values)
        older_carbon = np.mean(carbon_values[-5:]) if len(carbon_values) >= 10 else recent_carbon
        
        # Trend analysis
        if len(carbon_values) > 1:
            trend_slope = np.polyfit(range(len(carbon_values)), carbon_values, 1)[0]
        else:
            trend_slope = 0
        
        # Predict future emissions
        current_avg = np.mean(carbon_values[:3]) if len(carbon_values) >= 3 else np.mean(carbon_values)
        
        # Apply trend and seasonal adjustments
        seasonal_factor = self._get_seasonal_factor()
        predicted_emissions = max(0.1, current_avg + (trend_slope * (horizon_days / 7)) * seasonal_factor)
        
        # Calculate reduction potential (more conservative approach)
        if len(carbon_values) >= 3:
            # Use 75th percentile as baseline instead of max to avoid outliers
            sorted_values = sorted(carbon_values)
            percentile_75_index = int(len(sorted_values) * 0.75)
            baseline_emissions = sorted_values[percentile_75_index]
        else:
            baseline_emissions = max(carbon_values) if carbon_values else 5.0
        
        # Cap baseline at reasonable maximum (20kg CO2 for a single order)
        baseline_emissions = min(20.0, baseline_emissions)
        predicted_reduction = max(0, baseline_emissions - predicted_emissions)
        
        # Determine trend direction
        if trend_slope < -0.1:
            trend_direction = "improving"
        elif trend_slope > 0.1:
            trend_direction = "declining"
        else:
            trend_direction = "stable"
        
        # Calculate behavioral score (0-1)
        consistency = 1.0 - (np.std(carbon_values) / np.mean(carbon_values)) if len(carbon_values) > 1 else 0.5
        behavioral_score = max(0.1, min(1.0, consistency))
        
        # Calculate confidence
        data_quality = min(1.0, len(carbon_values) / 10)  # More data = higher confidence
        trend_confidence = 1.0 - abs(trend_slope) * 0.1  # Stable trends = higher confidence
        confidence_score = max(0.3, min(0.95, (data_quality + trend_confidence) / 2))
        
        return ForecastResult(
            predicted_emissions=float(predicted_emissions),
            predicted_reduction=float(predicted_reduction),
            confidence_score=float(confidence_score),
            trend_direction=trend_direction,
            seasonal_factor=float(seasonal_factor),
            behavioral_score=float(behavioral_score),
            prediction_factors={
                "data_points": len(carbon_values),
                "trend_slope": float(trend_slope),
                "recent_avg": float(recent_carbon),
                "baseline": float(baseline_emissions)
            },
            algorithm_metadata={
                "algorithm": "simplified_ensemble",
                "data_quality_score": float(data_quality)
            }
        )
    
    def _estimate_carbon_footprint(self, order_value: float, sustainability_rating: float) -> float:
        """Estimate carbon footprint based on order value and sustainability"""
        order_value = safe_float_convert(order_value)
        sustainability_rating = safe_float_convert(sustainability_rating)
        
        # Much more realistic base carbon per dollar (kg CO2 per dollar)
        # Typical grocery shopping: 0.01-0.05 kg CO2 per dollar
        base_carbon_per_dollar = 0.02
        
        # Sustainability adjustment (higher rating = lower carbon)
        # Rating scale 1-5, where 5 is most sustainable
        sustainability_multiplier = max(0.3, 1.2 - (sustainability_rating / 5.0))
        
        # Cap the result to reasonable values (max 50kg CO2 per order)
        carbon_footprint = order_value * base_carbon_per_dollar * sustainability_multiplier
        return min(50.0, max(0.1, carbon_footprint))
    
    def _get_seasonal_factor(self) -> float:
        """Get seasonal adjustment factor"""
        month = datetime.now().month
        seasonal_factors = {
            12: 1.2, 1: 1.1, 2: 0.9,  # Winter
            3: 0.95, 4: 0.9, 5: 0.85,  # Spring
            6: 0.8, 7: 0.85, 8: 0.9,   # Summer
            9: 0.95, 10: 1.0, 11: 1.1  # Fall
        }
        return seasonal_factors.get(month, 1.0)
    
    def _default_forecast(self) -> ForecastResult:
        """Default forecast for users with insufficient data"""
        return ForecastResult(
            predicted_emissions=2.5,  # More realistic baseline (2.5 kg CO2 per month)
            predicted_reduction=0.8,  # Conservative reduction estimate
            confidence_score=0.4,     # Low confidence
            trend_direction="stable",
            seasonal_factor=1.0,
            behavioral_score=0.5,
            prediction_factors={"note": "Insufficient data"},
            algorithm_metadata={"algorithm": "default"}
        )

# Service Functions
async def generate_carbon_forecast(user_id: str, horizon_days: int, db: Session) -> Dict[str, Any]:
    """Generate carbon forecast for user"""
    
    engine = SimpleCarbonForecastingEngine(db)
    forecast = await engine.generate_forecast(user_id, horizon_days)
    
    return {
        "status": "success",
        "forecast": {
            "predicted_emissions_kg_co2": forecast.predicted_emissions,
            "predicted_reduction_kg_co2": forecast.predicted_reduction,
            "confidence_score": forecast.confidence_score,
            "trend_direction": forecast.trend_direction,
            "seasonal_factor": forecast.seasonal_factor,
            "behavioral_score": forecast.behavioral_score,
            "prediction_factors": forecast.prediction_factors,
            "algorithm_metadata": forecast.algorithm_metadata
        }
    }

async def get_user_carbon_insights(user_id: str, db: Session) -> Dict[str, Any]:
    """Get user carbon insights using existing data"""
    
    engine = SimpleCarbonForecastingEngine(db)
    user_data = await engine._gather_user_data(user_id)
    
    orders = user_data["orders"]
    insights = {
        "latest_forecast": None,
        "shopping_patterns": None,
        "impact_metrics": None,
        "recommendations": []
    }
    
    if orders:
        # Generate fresh forecast
        forecast = await engine.generate_forecast(user_id, 30)
        
        insights["latest_forecast"] = {
            "predicted_emissions": forecast.predicted_emissions,
            "predicted_reduction": forecast.predicted_reduction,
            "confidence": forecast.confidence_score,
            "trend": forecast.trend_direction,
            "created_at": datetime.utcnow().isoformat()
        }
        
        # Calculate shopping patterns
        order_values = [safe_float_convert(o["order_value"]) for o in orders if o["order_value"]]
        sustainability_values = [safe_float_convert(o["avg_sustainability_rating"]) for o in orders if o["avg_sustainability_rating"]]
        
        if order_values:
            avg_order_value = np.mean(order_values)
            avg_sustainability = np.mean(sustainability_values) if sustainability_values else 2.5
            
            insights["shopping_patterns"] = {
                "avg_orders_per_week": len(orders) / 4,  # Approximate
                "eco_consciousness_score": min(1.0, avg_sustainability / 5.0),
                "carbon_trend_30d": forecast.prediction_factors.get("trend_slope", 0) * 30,
                "goals_achievement_rate": 0.75  # Placeholder
            }
        
        # Generate recommendations
        recommendations = []
        if forecast.trend_direction == "declining":
            recommendations.append("Consider choosing more sustainable products to improve your carbon trend")
        if forecast.confidence_score < 0.6:
            recommendations.append("More shopping data will improve forecast accuracy")
        if forecast.behavioral_score < 0.6:
            recommendations.append("Try to maintain consistent sustainable shopping habits")
        
        insights["recommendations"] = recommendations
    
    return insights

async def update_forecast_accuracy(forecast_id: int, actual_emissions: float, db: Session):
    """Placeholder for accuracy tracking"""
    logger.info(f"Would track accuracy for forecast {forecast_id} vs actual {actual_emissions}")
    pass