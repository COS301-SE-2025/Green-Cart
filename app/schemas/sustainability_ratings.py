from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict

class SustainabilityRating(BaseModel):
    id: int
    product_id: int
    type: str
    value: int
    created_at: datetime

class fetchSustainabilityRatingsRequest(BaseModel):
    product_id: int
    type: Optional[List[str]] = None

class fetchSustainabilityRatingsResponse(BaseModel):
    status: int
    message: str
    rating: float
    statistics: Optional[List[SustainabilityRating]] = []

class agregateSustainabilityRatings(BaseModel):
    rating: float
    statistics: Optional[List[SustainabilityRating]] = []

