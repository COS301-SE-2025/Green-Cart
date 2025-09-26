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
        
        # Check if user has sufficient data for meaningful forecasting
        orders = user_data.get("orders", [])
        
        # For new users, return baseline forecast
        if len(orders) == 0:
            return self._new_user_forecast()
        
        # For users with 1-2 orders, provide a simple prediction based on their actual data
        if len(orders) < 3:
            return await self._simple_prediction_from_orders(orders, len(orders))
        
        # Generate forecast only for users with sufficient purchase history
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
        """Simple, accurate forecast based on actual behavior: order sustainability averages and goal achievement"""
        
        orders = user_data["orders"]
        goals = user_data.get("goals", {})
        
        if len(orders) < 3:
            return self._insufficient_data_forecast(len(orders))
        
        # Step 1: Calculate simple average order sustainability
        monthly_sustainability = {}
        current_time = datetime.utcnow()
        
        for order in orders:
            sustainability_val = safe_float_convert(order["avg_sustainability_rating"])
            order_date = order.get("created_at")
            
            if order_date and sustainability_val > 0:
                if isinstance(order_date, str):
                    order_datetime = datetime.fromisoformat(order_date.replace('Z', '+00:00'))
                else:
                    order_datetime = order_date
                
                month_key = f"{order_datetime.year}-{order_datetime.month:02d}"
                
                # Convert sustainability rating to 0-100 scale
                if sustainability_val <= 5.0:
                    sustainability_score = sustainability_val * 20
                elif sustainability_val <= 10.0:
                    sustainability_score = sustainability_val * 10
                else:
                    sustainability_score = min(100.0, sustainability_val)
                
                if month_key not in monthly_sustainability:
                    monthly_sustainability[month_key] = []
                monthly_sustainability[month_key].append(sustainability_score)
        
        if not monthly_sustainability:
            return self._insufficient_data_forecast(len(orders))
        
        # Step 2: Calculate monthly averages and check goal achievement
        monthly_averages = {}
        goal_achievements = {}
        
        for month, scores in monthly_sustainability.items():
            monthly_avg = np.mean(scores)
            monthly_averages[month] = monthly_avg
            
            # Check if goals were set and met for this month
            if month in goals:
                goal_value = float(goals[month])
                achieved = monthly_avg >= goal_value
                goal_achievements[month] = {
                    "goal": goal_value,
                    "actual": monthly_avg,
                    "achieved": achieved,
                    "difference": monthly_avg - goal_value
                }
        
        # Step 3: Simple trend analysis - last 3 months vs previous months
        recent_months = sorted(monthly_averages.keys())[-3:]
        older_months = sorted(monthly_averages.keys())[:-3] if len(monthly_averages) > 3 else []
        
        recent_avg = np.mean([monthly_averages[m] for m in recent_months])
        
        if older_months:
            older_avg = np.mean([monthly_averages[m] for m in older_months])
            trend_change = recent_avg - older_avg
        else:
            trend_change = 0
        
        # Step 4: Simple prediction based on recent average and trend
        predicted_score = recent_avg + (trend_change * 0.3)  # Conservative trend continuation
        predicted_score = max(0.0, min(100.0, predicted_score))
        
        # Step 5: Calculate improvement potential based on goal history
        if goal_achievements:
            unmet_goals = [ga for ga in goal_achievements.values() if not ga["achieved"]]
            if unmet_goals:
                avg_shortfall = np.mean([abs(ga["difference"]) for ga in unmet_goals])
                improvement_potential = min(25.0, avg_shortfall)
            else:
                improvement_potential = min(10.0, 100.0 - predicted_score)  # Small improvement if goals are met
        else:
            improvement_potential = min(15.0, 100.0 - predicted_score)
        
        # Step 6: Simple confidence based on data consistency
        score_variance = np.var(list(monthly_averages.values()))
        if score_variance < 100:  # Low variance = high confidence
            confidence = 0.8
        elif score_variance < 400:  # Medium variance
            confidence = 0.6
        else:  # High variance = low confidence
            confidence = 0.4
        
        # Adjust confidence based on data amount
        confidence *= min(1.0, len(monthly_averages) / 6)  # Need 6 months for full confidence
        
        # Step 7: Simple trend direction
        if trend_change > 5:
            trend_direction = "improving"
        elif trend_change < -5:
            trend_direction = "declining"
        elif score_variance > 400:
            trend_direction = "volatile"
        else:
            trend_direction = "stable"
        
        return ForecastResult(
            predicted_emissions=float(predicted_score),
            predicted_reduction=float(improvement_potential),
            confidence_score=float(confidence),
            trend_direction=trend_direction,
            seasonal_factor=1.0,  # Simplified - no seasonal adjustment
            behavioral_score=float(min(0.9, 1.0 - score_variance / 1000)),
            prediction_factors={
                "monthly_averages": monthly_averages,
                "goal_achievements": goal_achievements,
                "recent_avg": float(recent_avg),
                "trend_change": float(trend_change),
                "data_months": len(monthly_averages),
                "score_variance": float(score_variance)
            },
            algorithm_metadata={
                "algorithm": "simple_behavior_analysis",
                "version": "3.0",
                "approach": "monthly_sustainability_average_with_goal_tracking"
            }
        )
    
    def _calculate_simple_sustainability_score(self, sustainability_rating: float) -> float:
        """Simple sustainability score normalization - just convert to 0-100 scale"""
        sustainability_rating = safe_float_convert(sustainability_rating)
        
        if sustainability_rating <= 0:
            return 0.0
        
        # Convert different scales to 0-100
        if sustainability_rating <= 5.0:
            return sustainability_rating * 20  # 0-5 scale to 0-100
        elif sustainability_rating <= 10.0:
            return sustainability_rating * 10  # 0-10 scale to 0-100
        else:
            return min(100.0, sustainability_rating)  # Already 0-100 or cap at 100
    
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
    
    def _new_user_forecast(self) -> ForecastResult:
        """Forecast for completely new users with no purchase history"""
        return ForecastResult(
            predicted_emissions=50.0,     # Default middle score - no data to predict otherwise
            predicted_reduction=20.0,     # Potential for improvement from average baseline
            confidence_score=0.1,         # Very low confidence - no data
            trend_direction="stable",     # Use valid enum value instead of "unknown"
            seasonal_factor=1.0,
            behavioral_score=0.0,         # No behavioral data
            prediction_factors={
                "status": "no_data",
                "message": "No purchase history available for accurate forecasting",
                "recommendation": "Make your first sustainable purchase to start building your carbon profile",
                "baseline_explanation": "Using average sustainability score as baseline prediction"
            },
            algorithm_metadata={
                "algorithm": "new_user_baseline",
                "version": "3.0",
                "data_points": 0
            }
        )
    
    async def _simple_prediction_from_orders(self, orders: List[Dict], order_count: int) -> ForecastResult:
        """Simple prediction based on actual order data for users with 1-2 orders"""
        
        # Calculate average sustainability from their actual orders
        sustainability_scores = []
        for order in orders:
            sustainability_val = safe_float_convert(order["avg_sustainability_rating"])
            if sustainability_val > 0:
                # Convert to 0-100 scale
                if sustainability_val <= 5.0:
                    score = sustainability_val * 20
                elif sustainability_val <= 10.0:
                    score = sustainability_val * 10
                else:
                    score = min(100.0, sustainability_val)
                sustainability_scores.append(score)
        
        if sustainability_scores:
            # Use their actual average as prediction
            predicted_score = np.mean(sustainability_scores)
            # Small improvement potential based on their current performance
            improvement_potential = min(20.0, 100.0 - predicted_score)
            confidence = 0.4 if order_count == 2 else 0.25  # Slightly higher confidence with 2 orders
        else:
            # Fallback if no valid sustainability data
            predicted_score = 50.0
            improvement_potential = 20.0
            confidence = 0.2
        
        return ForecastResult(
            predicted_emissions=float(predicted_score),
            predicted_reduction=float(improvement_potential),
            confidence_score=float(confidence),
            trend_direction="stable",
            seasonal_factor=1.0,
            behavioral_score=0.5,
            prediction_factors={
                "status": "early_prediction",
                "current_orders": order_count,
                "actual_avg_sustainability": float(predicted_score),
                "message": f"Prediction based on your {order_count} order(s) with {predicted_score:.1f} average sustainability",
                "recommendation": f"Make {3 - order_count} more purchase(s) to unlock more accurate trend analysis"
            },
            algorithm_metadata={
                "algorithm": "simple_order_average",
                "version": "3.0",
                "data_points": order_count
            }
        )
    
    def _insufficient_data_forecast(self, order_count: int) -> ForecastResult:
        """Fallback forecast for edge cases (kept for compatibility)"""
        return ForecastResult(
            predicted_emissions=55.0,     # Slightly above average - they're making sustainable purchases
            predicted_reduction=15.0,     # Conservative improvement potential
            confidence_score=0.3,         # Low but not zero confidence
            trend_direction="stable",     # Use valid enum value
            seasonal_factor=1.0,
            behavioral_score=0.4,         # Some behavioral data
            prediction_factors={
                "status": "limited_data_fallback",
                "current_orders": order_count,
                "recommended_orders": 3,
                "message": f"Fallback prediction - improve with more purchase history",
                "recommendation": f"Make more purchases to get personalized forecasting"
            },
            algorithm_metadata={
                "algorithm": "limited_data_fallback", 
                "version": "3.0",
                "data_points": order_count
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