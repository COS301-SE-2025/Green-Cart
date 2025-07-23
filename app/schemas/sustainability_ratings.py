from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class SustainabilityRating(BaseModel):
    id: int
    product_id: int
    type: str
    value: float = Field(..., ge=0, le=100, description="Sustainability rating as percentage (0-100)")
    created_at: datetime

class fetchSustainabilityRatingsRequest(BaseModel):
    product_id: int
    type: Optional[List[str]] = None

class fetchSustainabilityRatingsResponse(BaseModel):
    status: int
    message: str
    rating: float = Field(..., ge=0, le=100, description="Weighted aggregated rating as percentage (0-100)")
    statistics: Optional[List[SustainabilityRating]] = []
    grade: Optional[str] = Field(None, description="Letter grade (A+ to F)")
    insights: Optional[List[str]] = Field(None, description="Sustainability insights and recommendations")

class agregateSustainabilityRatings(BaseModel):
    rating: float = Field(..., ge=0, le=100, description="Weighted aggregated rating as percentage (0-100)")
    statistics: Optional[List[SustainabilityRating]] = []
    grade: Optional[str] = None
    insights: Optional[List[str]] = None