"""
Simplified Carbon Forecasting API Endpoints
==========================================
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Path
from sqlalchemy.orm import Session
from typing import Optional
import logging
from datetime import datetime

from app.db.session import get_db
from app.services.carbon_forecasting import (
    generate_carbon_forecast,
    get_user_carbon_insights,
    update_forecast_accuracy
)
from app.schemas.carbon_forecasting import (
    GenerateForecastRequest, GenerateForecastResponse,
    GetUserInsightsRequest, GetUserInsightsResponse,
    UpdateForecastAccuracyRequest, UpdateForecastAccuracyResponse,
    ErrorResponse, SuccessResponse
)

router = APIRouter(prefix="/carbon-forecasting", tags=["Carbon Forecasting"])
logger = logging.getLogger(__name__)

@router.post("/generate-forecast", response_model=GenerateForecastResponse)
async def generate_forecast_endpoint(
    request: GenerateForecastRequest,
    db: Session = Depends(get_db)
):

    try:
        logger.info(f"Generating forecast for user {request.user_id}")
        
        result = await generate_carbon_forecast(
            user_id=request.user_id,
            horizon_days=request.horizon_days,
            db=db
        )
        
        return GenerateForecastResponse(**result)
        
    except Exception as e:
        logger.error(f"Error generating forecast: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Forecast generation failed: {str(e)}")

@router.post("/user-insights", response_model=GetUserInsightsResponse)
async def get_user_insights_endpoint(
    request: GetUserInsightsRequest,
    db: Session = Depends(get_db)
):

    try:
        insights = await get_user_carbon_insights(request.user_id, db)
        return GetUserInsightsResponse(**insights)
        
    except Exception as e:
        logger.error(f"Error fetching user insights: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch insights: {str(e)}")

@router.patch("/update-accuracy", response_model=UpdateForecastAccuracyResponse)
async def update_forecast_accuracy_endpoint(
    request: UpdateForecastAccuracyRequest,
    db: Session = Depends(get_db)
):

    try:
        await update_forecast_accuracy(request.forecast_id, request.actual_sustainability_score, db)
        
        return UpdateForecastAccuracyResponse(
            status="success",
            message="Forecast accuracy logged",
            accuracy_percentage=85.0  # Placeholder
        )
            
    except Exception as e:
        logger.error(f"Error updating forecast accuracy: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update accuracy: {str(e)}")

@router.get("/quick-forecast/{user_id}")
async def quick_forecast(
    user_id: str = Path(..., description="User ID"),
    days: int = Query(30, ge=1, le=90, description="Forecast horizon in days"),
    db: Session = Depends(get_db)
):

    try:
        result = await generate_carbon_forecast(user_id, days, db)
        
        return {
            "predicted_sustainability_score": result["forecast"]["predicted_sustainability_score"],
            "improvement_potential": result["forecast"]["improvement_potential"],
            "confidence": result["forecast"]["confidence_score"],
            "trend": result["forecast"]["trend_direction"]
        }
        
    except Exception as e:
        logger.error(f"Error in quick forecast: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user-score/{user_id}")
async def get_user_carbon_score(
    user_id: str = Path(..., description="User ID"),
    db: Session = Depends(get_db)
):
    try:
        insights = await get_user_carbon_insights(user_id, db)
        
        if not insights.get("shopping_patterns"):
            return {"score": 50, "level": "Beginner", "message": "Start shopping to get your score"}
        
        patterns = insights["shopping_patterns"]
        forecast = insights.get("latest_forecast", {})
        
        # Calculate composite score using stricter 0-100 scoring system
        # Eco consciousness (40% weight) - based on actual sustainability ratings
        eco_base = patterns.get("eco_consciousness_score", 50)
        eco_score = (eco_base * 0.4) if eco_base >= 60 else (eco_base * 0.3)  # Penalty for low eco scores
        
        # Trend score (25% weight) - more restrictive trend calculation
        trend_raw = patterns.get("sustainability_trend_30d", 0)
        if trend_raw > 10:
            trend_score = 25  # Excellent positive trend
        elif trend_raw > 5:
            trend_score = 20  # Good positive trend
        elif trend_raw > 0:
            trend_score = 15  # Slight positive trend
        elif trend_raw >= -5:
            trend_score = 10  # Stable/slight decline
        else:
            trend_score = 5   # Significant decline
        
        # Efficiency score (20% weight) - based on order frequency and value
        avg_orders_per_week = patterns.get("avg_orders_per_week", 0)
        if avg_orders_per_week > 0:
            # Reward consistent but not excessive shopping
            if 1 <= avg_orders_per_week <= 3:
                efficiency_score = 20  # Optimal frequency
            elif avg_orders_per_week <= 5:
                efficiency_score = 15  # Good frequency
            elif avg_orders_per_week <= 7:
                efficiency_score = 10  # High frequency
            else:
                efficiency_score = 5   # Excessive shopping
        else:
            efficiency_score = 0  # No shopping data
        
        # Consistency score (15% weight) - based on forecast confidence and achievement rate
        confidence = forecast.get("confidence", 0)
        achievement_rate = patterns.get("goals_achievement_rate", 0)
        consistency_score = (confidence * 7.5) + (achievement_rate * 7.5)  # Both contribute to consistency
        
        total_score = eco_score + trend_score + efficiency_score + consistency_score
        
        # More stringent level thresholds
        if total_score >= 85:
            level = "Sustainability Champion"
        elif total_score >= 70:
            level = "Eco Warrior" 
        elif total_score >= 55:
            level = "Green Learner"
        elif total_score >= 35:
            level = "Getting Started"
        else:
            level = "Needs Improvement"
        
        return {
            "score": round(total_score, 1),
            "level": level,
            "breakdown": {
                "eco_consciousness": round(eco_score, 1),
                "sustainability_trend": round(trend_score, 1),
                "efficiency": round(efficiency_score, 1),
                "consistency": round(consistency_score, 1)
            },
            "criteria": {
                "eco_consciousness": "40% - Based on sustainability ratings of purchased products",
                "sustainability_trend": "25% - 30-day sustainability improvement trend",
                "efficiency": "20% - Shopping frequency and value optimization", 
                "consistency": "15% - Goal achievement and forecast reliability"
            }
        }
        
    except Exception as e:
        logger.error(f"Error calculating user score: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():

    return {
        "status": "healthy",
        "service": "sustainability-forecasting",
        "version": "2.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }