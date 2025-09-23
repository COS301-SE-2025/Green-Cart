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
        
        # Get carbon goals with better error handling
        goals_query = text("""
            SELECT month, goal_value
            FROM public.carbon_goals
            WHERE user_id = :user_id
            ORDER BY month DESC
        """)
        
        goals_result = []
        try:
            goals_result = self.db.execute(goals_query, {"user_id": user_id}).fetchall()
            logger.info(f"Found {len(goals_result)} carbon goals for user {user_id}")
        except Exception as e:
            logger.warning(f"Could not fetch carbon goals for user {user_id}: {str(e)}")
            goals_result = []
        
        return {
            "orders": [dict(row._mapping) for row in orders_result],
            "goals": {row.month: float(row.goal_value) for row in goals_result} if goals_result else {},
            "user_id": user_id
        }
    
    async def _calculate_forecast(self, user_data: Dict[str, Any], horizon_days: int) -> ForecastResult:
        """Calculate robust forecast based on user data with advanced analytics"""
        
        orders = user_data["orders"]
        
        if len(orders) < 2:
            return self._default_forecast()
        
        # Enhanced data processing with time-series analysis
        order_data = []
        current_time = datetime.utcnow()
        
        for order in orders:
            order_val = safe_float_convert(order["order_value"])
            sustainability_val = safe_float_convert(order["avg_sustainability_rating"])
            order_date = order.get("created_at")
            
            if order_val > 0 and order_date:
                # Calculate days ago for time-weighted analysis
                if isinstance(order_date, str):
                    order_datetime = datetime.fromisoformat(order_date.replace('Z', '+00:00'))
                else:
                    order_datetime = order_date
                
                days_ago = (current_time - order_datetime).days
                
                # Calculate comprehensive sustainability metrics
                sustainability_score = self._calculate_enhanced_sustainability_score(
                    order_val, sustainability_val, order.get("item_count", 1)
                )
                
                order_data.append({
                    "value": order_val,
                    "sustainability_score": sustainability_score,
                    "days_ago": days_ago,
                    "weight": self._calculate_time_weight(days_ago)  # More recent orders have higher weight
                })
        
        if not order_data:
            return self._default_forecast()
        
        # Sort by recency (most recent first)
        order_data.sort(key=lambda x: x["days_ago"])
        
        # Advanced trend analysis with multiple time windows
        recent_scores = [o["sustainability_score"] for o in order_data[:5]]  # Last 5 orders
        mid_term_scores = [o["sustainability_score"] for o in order_data[:15]]  # Last 15 orders
        all_scores = [o["sustainability_score"] for o in order_data]
        
        # Multi-timeframe trend calculation
        short_term_trend = self._calculate_weighted_trend(recent_scores, days=7)
        mid_term_trend = self._calculate_weighted_trend(mid_term_scores, days=30) 
        long_term_trend = self._calculate_weighted_trend(all_scores, days=90)
        
        # Composite trend with different weights for different timeframes
        composite_trend = (short_term_trend * 0.5) + (mid_term_trend * 0.3) + (long_term_trend * 0.2)
        
        # Enhanced prediction with volatility consideration
        recent_avg = np.mean(recent_scores)
        volatility = np.std(all_scores) if len(all_scores) > 1 else 0
        
        # Apply trend with volatility dampening
        volatility_factor = max(0.5, 1.0 - (volatility / 50.0))  # High volatility = less trend extrapolation
        trend_impact = composite_trend * (horizon_days / 30) * volatility_factor
        
        # Seasonal and behavioral adjustments
        seasonal_factor = self._get_enhanced_seasonal_factor()
        behavioral_pattern = self._analyze_behavioral_patterns(order_data)
        
        # Final prediction with bounds
        base_prediction = recent_avg + trend_impact
        seasonal_adjustment = base_prediction * seasonal_factor
        behavioral_adjustment = seasonal_adjustment * behavioral_pattern["consistency_factor"]
        
        predicted_score = max(10.0, min(100.0, behavioral_adjustment))
        
        # Enhanced improvement potential calculation
        user_max_score = max(all_scores) if all_scores else 60.0
        theoretical_max = 100.0
        current_performance = recent_avg
        
        # Calculate realistic improvement potential based on historical performance
        historical_improvement_rate = user_max_score - np.mean(all_scores)
        realistic_potential = min(
            theoretical_max - predicted_score,
            historical_improvement_rate * 1.5  # 50% more than historical best improvement
        )
        improvement_potential = max(0.0, realistic_potential)
        
        # Advanced confidence scoring
        confidence_factors = {
            "data_quantity": min(1.0, len(all_scores) / 20),  # More data = higher confidence
            "data_recency": min(1.0, 30 / (order_data[0]["days_ago"] + 1)),  # Recent data = higher confidence
            "trend_consistency": max(0.3, 1.0 - abs(short_term_trend - long_term_trend) / 20),
            "volatility_penalty": max(0.5, 1.0 - volatility / 30),
            "behavioral_consistency": behavioral_pattern["consistency_score"]
        }
        
        confidence_score = np.mean(list(confidence_factors.values()))
        
        # Determine trend direction using valid enum values
        if composite_trend > 2.0:
            trend_direction = "improving"  # Very positive trend
        elif composite_trend > 0.5:
            trend_direction = "improving"
        elif composite_trend > -0.5:
            trend_direction = "stable"
        elif composite_trend > -2.0:
            trend_direction = "declining"
        else:
            trend_direction = "declining"  # Very negative trend
        
        # Add volatility check
        if volatility > 15:  # High volatility
            trend_direction = "volatile"
        
        return ForecastResult(
            predicted_emissions=float(predicted_score),
            predicted_reduction=float(improvement_potential),
            confidence_score=float(confidence_score),
            trend_direction=trend_direction,
            seasonal_factor=float(seasonal_factor),
            behavioral_score=float(behavioral_pattern["consistency_score"]),
            prediction_factors={
                "data_points": len(all_scores),
                "short_term_trend": float(short_term_trend),
                "mid_term_trend": float(mid_term_trend),
                "long_term_trend": float(long_term_trend),
                "composite_trend": float(composite_trend),
                "volatility": float(volatility),
                "recent_avg": float(recent_avg),
                "confidence_breakdown": confidence_factors
            },
            algorithm_metadata={
                "algorithm": "enhanced_multi_timeframe_forecasting",
                "version": "2.0",
                "volatility_factor": float(volatility_factor),
                "behavioral_insights": behavioral_pattern
            }
        )
    
    def _calculate_enhanced_sustainability_score(self, order_value: float, sustainability_rating: float, item_count: int) -> float:
        """Enhanced sustainability score calculation with multiple factors"""
        order_value = safe_float_convert(order_value)
        sustainability_rating = safe_float_convert(sustainability_rating)
        item_count = max(1, safe_float_convert(item_count))
        
        # Base score from sustainability rating
        if sustainability_rating <= 5.0:
            base_score = sustainability_rating * 20  # Convert 0-5 to 0-100
        else:
            base_score = sustainability_rating  # Already 0-100
        
        # Item diversity factor (more items per order = better planning)
        diversity_factor = min(1.2, 1.0 + (item_count - 1) * 0.02)  # Small bonus for more items
        
        # Order efficiency factor (value per item)
        avg_item_value = order_value / item_count
        if avg_item_value > 50:  # Premium items might be more sustainable
            efficiency_factor = min(1.1, 1.0 + (avg_item_value - 50) * 0.001)
        else:
            efficiency_factor = 1.0
        
        # Calculate final score
        final_score = base_score * diversity_factor * efficiency_factor
        return min(100.0, max(0.0, final_score))
    
    def _calculate_time_weight(self, days_ago: int) -> float:
        """Calculate weight based on recency (exponential decay)"""
        return math.exp(-days_ago / 30.0)  # 30-day half-life
    
    def _calculate_weighted_trend(self, scores: List[float], days: int) -> float:
        """Calculate trend with time weighting"""
        if len(scores) < 2:
            return 0.0
        
        # Simple linear regression with equal weights for now
        x = np.arange(len(scores))
        if len(scores) > 1:
            trend_slope = np.polyfit(x, scores, 1)[0]
            # Scale trend to represent change per day
            return trend_slope * (30 / days)  # Normalize to 30-day change
        return 0.0
    
    def _get_enhanced_seasonal_factor(self) -> float:
        """Enhanced seasonal adjustment with more granular factors"""
        month = datetime.now().month
        day_of_month = datetime.now().day
        
        # Base seasonal factors
        base_factors = {
            12: 1.15, 1: 1.1, 2: 0.95,  # Winter - holiday season affects purchasing
            3: 0.98, 4: 0.92, 5: 0.88,  # Spring - fresh start mentality
            6: 0.85, 7: 0.88, 8: 0.92,  # Summer - vacation/outdoor focus
            9: 0.96, 10: 1.02, 11: 1.08  # Fall - preparation for winter
        }
        
        base_factor = base_factors.get(month, 1.0)
        
        # Monthly progression factor (early vs late month)
        if day_of_month <= 10:
            progression_factor = 1.02  # Early month - fresh motivation
        elif day_of_month <= 20:
            progression_factor = 1.0   # Mid month - normal
        else:
            progression_factor = 0.98  # Late month - planning for next month
        
        return base_factor * progression_factor
    
    def _analyze_behavioral_patterns(self, order_data: List[Dict]) -> Dict[str, float]:
        """Analyze user behavioral patterns for prediction accuracy"""
        if len(order_data) < 3:
            return {"consistency_factor": 1.0, "consistency_score": 0.5}
        
        # Calculate ordering frequency consistency
        time_gaps = []
        for i in range(1, len(order_data)):
            gap = order_data[i]["days_ago"] - order_data[i-1]["days_ago"]
            time_gaps.append(abs(gap))
        
        # Consistency based on standard deviation of time gaps
        if time_gaps:
            gap_std = np.std(time_gaps)
            gap_mean = np.mean(time_gaps)
            frequency_consistency = max(0.3, 1.0 - (gap_std / max(gap_mean, 1.0)))
        else:
            frequency_consistency = 0.5
        
        # Sustainability score consistency
        scores = [o["sustainability_score"] for o in order_data]
        if len(scores) > 1:
            score_cv = np.std(scores) / max(np.mean(scores), 1.0)  # Coefficient of variation
            score_consistency = max(0.3, 1.0 - score_cv)
        else:
            score_consistency = 0.5
        
        # Order value consistency (indicates planning vs impulse buying)
        values = [o["value"] for o in order_data]
        if len(values) > 1:
            value_cv = np.std(values) / max(np.mean(values), 1.0)
            value_consistency = max(0.3, 1.0 - min(value_cv, 1.0))
        else:
            value_consistency = 0.5
        
        # Overall consistency score
        overall_consistency = (frequency_consistency * 0.4 + 
                             score_consistency * 0.4 + 
                             value_consistency * 0.2)
        
        # Consistency factor affects prediction confidence
        consistency_factor = 0.8 + (overall_consistency * 0.4)  # Range: 0.8 to 1.2
        
        return {
            "consistency_factor": consistency_factor,
            "consistency_score": overall_consistency,
            "frequency_consistency": frequency_consistency,
            "score_consistency": score_consistency,
            "value_consistency": value_consistency
        }
    
    def _get_seasonal_factor(self) -> float:
        """Get seasonal adjustment factor (kept for backward compatibility)"""
        return self._get_enhanced_seasonal_factor()
    
    def _default_forecast(self) -> ForecastResult:
        """Default forecast for users with insufficient data - more conservative"""
        return ForecastResult(
            predicted_emissions=55.0,     # More conservative default sustainability score
            predicted_reduction=15.0,     # Realistic improvement potential for new users
            confidence_score=0.3,         # Low confidence due to lack of data
            trend_direction="stable",
            seasonal_factor=1.0,
            behavioral_score=0.4,         # Lower behavioral score for new users
            prediction_factors={
                "note": "Insufficient data - using conservative default estimates",
                "recommendation": "Make 5+ purchases to get accurate forecasting"
            },
            algorithm_metadata={
                "algorithm": "default_conservative_scoring",
                "version": "2.0"
            }
        )

# Service Functions
async def generate_carbon_forecast(user_id: str, horizon_days: int, db: Session) -> Dict[str, Any]:
    """Generate carbon forecast for user"""
    
    engine = SimpleCarbonForecastingEngine(db)
    forecast = await engine.generate_forecast(user_id, horizon_days)
    
    return {
        "status": "success",
        "forecast": {
            "predicted_sustainability_score": forecast.predicted_emissions,  # Now sustainability score 0-100
            "improvement_potential": forecast.predicted_reduction,            # Now improvement potential 0-100
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
    
    # Initialize default insights first
    insights = {
        "latest_forecast": {
            "predicted_sustainability_score": 65.0,
            "improvement_potential": 25.0,
            "confidence": 0.5,
            "trend": "stable",
            "created_at": datetime.utcnow().isoformat()
        },
        "shopping_patterns": {
            "avg_orders_per_week": 1.0,
            "eco_consciousness_score": 60.0,
            "sustainability_trend_30d": 2.0,
            "goals_achievement_rate": 0.65
        },
        "impact_metrics": None,
        "recommendations": ["Start shopping to see personalized insights"]
    }
    
    try:
        engine = SimpleCarbonForecastingEngine(db)
        user_data = await engine._gather_user_data(user_id)
        orders = user_data["orders"]
        
        if orders:
            # Generate fresh forecast
            forecast = await engine.generate_forecast(user_id, 30)
            
            insights["latest_forecast"] = {
                "predicted_sustainability_score": max(0.0, min(100.0, forecast.predicted_emissions * 2.5)),  # Convert to 0-100 scale
                "improvement_potential": max(0.0, min(100.0, forecast.predicted_reduction * 3.0)),  # Convert to 0-100 scale  
                "confidence": forecast.confidence_score,
                "trend": forecast.trend_direction,
                "created_at": datetime.utcnow().isoformat()
            }
            
            # Calculate shopping patterns
            order_values = [safe_float_convert(o["order_value"]) for o in orders if o["order_value"]]
            sustainability_values = [safe_float_convert(o["avg_sustainability_rating"]) for o in orders if o["avg_sustainability_rating"]]
            
            if order_values:
                avg_order_value = np.mean(order_values)
                avg_sustainability = np.mean(sustainability_values) if sustainability_values else 50.0
                
                # Calculate actual orders per week based on date range
                if orders:
                    order_dates = []
                    for o in orders:
                        try:
                            if isinstance(o["created_at"], str):
                                # Handle string datetime
                                date_obj = datetime.fromisoformat(str(o["created_at"]).replace('Z', '+00:00'))
                            else:
                                # Handle datetime object
                                date_obj = o["created_at"]
                            
                            # Remove timezone info for consistency
                            if date_obj.tzinfo:
                                date_obj = date_obj.replace(tzinfo=None)
                            order_dates.append(date_obj)
                        except Exception as e:
                            logger.warning(f"Error parsing order date {o.get('created_at')}: {str(e)}")
                            continue
                    
                    if len(order_dates) > 1:
                        date_range = max(order_dates) - min(order_dates)
                        weeks_span = max(1, date_range.days / 7)  # At least 1 week
                        actual_orders_per_week = len(orders) / weeks_span
                    elif len(order_dates) == 1:
                        # Single order, estimate based on recency
                        days_since_order = (datetime.utcnow() - order_dates[0]).days
                        weeks_since_order = max(1, days_since_order / 7)
                        actual_orders_per_week = 1 / weeks_since_order
                    else:
                        actual_orders_per_week = 0
                else:
                    actual_orders_per_week = 0
                
                # Calculate goal achievement rate using the same method as carbon_goals_service
                goals = user_data.get("goals", {})
                goal_achievement_rates = []
                current_year = datetime.utcnow().year
                
                if goals:
                    logger.info(f"Processing {len(goals)} goals for user {user_id}: {goals}")
                    
                    for month_key, goal_value in goals.items():
                        try:
                            # Handle both integer month and string month formats
                            if isinstance(month_key, str) and '-' in month_key:
                                # Format: "2025-09" -> month=9, year=2025
                                year, month = map(int, month_key.split('-'))
                            else:
                                # Format: 9 -> month=9, year=current_year
                                month = int(month_key)
                                year = current_year
                            
                            # Calculate monthly carbon footprint (sustainability score) for this month
                            month_orders = []
                            for o in orders:
                                if o["created_at"]:
                                    try:
                                        if isinstance(o["created_at"], str):
                                            order_date = datetime.fromisoformat(str(o["created_at"]).replace('Z', '+00:00'))
                                        else:
                                            order_date = o["created_at"]
                                        
                                        if order_date.month == month and order_date.year == year:
                                            month_orders.append(o)
                                    except Exception as e:
                                        continue
                            
                            if month_orders:
                                # Calculate average sustainability score for this month (same as carbon_goals_service)
                                month_sustainability_values = [
                                    safe_float_convert(o["avg_sustainability_rating"]) 
                                    for o in month_orders 
                                    if o["avg_sustainability_rating"] is not None
                                ]
                                
                                if month_sustainability_values:
                                    # This is the actual monthly carbon footprint score
                                    actual_monthly_score = np.mean(month_sustainability_values)
                                    
                                    # Compare actual vs goal (both are 0-100 sustainability scores)
                                    if goal_value > 0:
                                        # If actual score meets or exceeds goal, achievement = 1.0
                                        # If actual score is below goal, achievement = actual/goal
                                        achievement_rate = min(1.0, actual_monthly_score / goal_value)
                                        goal_achievement_rates.append(achievement_rate)
                                        
                                        logger.info(f"Month {month}/{year}: Goal={goal_value}, Actual={actual_monthly_score:.1f}, Achievement={achievement_rate:.2f}")
                                        
                                        # If not meeting goal, the achievement rate will be < 1.0
                                        if achievement_rate < 1.0:
                                            logger.info(f"Goal NOT MET for {month}/{year}: {actual_monthly_score:.1f} < {goal_value}")
                            else:
                                # No orders in this month = 0% achievement for that goal
                                goal_achievement_rates.append(0.0)
                                logger.info(f"Month {month}/{year}: No orders, 0% achievement")
                        
                        except Exception as e:
                            logger.warning(f"Error processing goal for month {month_key}: {str(e)}")
                            # If we can't process a goal, assume it wasn't met
                            goal_achievement_rates.append(0.0)
                
                # Calculate overall goal achievement rate
                if goal_achievement_rates:
                    overall_goal_achievement = np.mean(goal_achievement_rates)
                    logger.info(f"Overall goal achievement: {goal_achievement_rates} = {overall_goal_achievement:.2f}")
                else:
                    # No goals set = neutral score
                    overall_goal_achievement = 0.0
                    logger.info("No goals found or processed, achievement = 0.0")
                
                insights["shopping_patterns"] = {
                    "avg_orders_per_week": round(actual_orders_per_week, 2),
                    "eco_consciousness_score": min(100.0, avg_sustainability),
                    "sustainability_trend_30d": forecast.prediction_factors.get("trend_slope", 0) * 30,
                    "goals_achievement_rate": round(overall_goal_achievement, 2)
                }
            
            # Generate recommendations based on sustainability scores
            recommendations = []
            if forecast.trend_direction == "declining":
                recommendations.append("Consider choosing more sustainable products to improve your sustainability trend")
            if forecast.confidence_score < 0.6:
                recommendations.append("More shopping data will improve forecast accuracy")
            if forecast.behavioral_score < 0.6:
                recommendations.append("Try to maintain consistent sustainable shopping habits")
            
            insights["recommendations"] = recommendations
    except Exception as e:
        logger.error(f"Error processing user insights for user {user_id}: {str(e)}")
        # Keep the default insights from the first try-catch block
    
    return insights

async def update_forecast_accuracy(forecast_id: int, actual_sustainability_score: float, db: Session):
    """Placeholder for sustainability score accuracy tracking"""
    logger.info(f"Would track accuracy for forecast {forecast_id} vs actual sustainability score {actual_sustainability_score}")
    pass