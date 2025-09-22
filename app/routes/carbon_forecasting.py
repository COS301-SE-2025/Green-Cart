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
        await update_forecast_accuracy(request.forecast_id, request.actual_emissions, db)
        
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
            "predicted_emissions": result["forecast"]["predicted_emissions_kg_co2"],
            "predicted_reduction": result["forecast"]["predicted_reduction_kg_co2"],
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
        
        # Calculate composite score
        eco_score = patterns.get("eco_consciousness_score", 0.5) * 30
        trend_score = max(0, min(25, 25 + patterns.get("carbon_trend_30d", 0))) 
        efficiency_score = 25  # Placeholder
        consistency_score = 20  # Placeholder
        
        total_score = eco_score + trend_score + efficiency_score + consistency_score
        
        # Determine level
        if total_score >= 80:
            level = "Carbon Champion"
        elif total_score >= 60:
            level = "Eco Warrior" 
        elif total_score >= 40:
            level = "Green Learner"
        else:
            level = "Getting Started"
        
        return {
            "score": round(total_score, 1),
            "level": level,
            "breakdown": {
                "eco_consciousness": round(eco_score, 1),
                "trend_improvement": round(trend_score, 1),
                "efficiency": round(efficiency_score, 1),
                "consistency": round(consistency_score, 1)
            }
        }
        
    except Exception as e:
        logger.error(f"Error calculating user score: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():

    return {
        "status": "healthy",
        "service": "carbon-forecasting-simple",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }