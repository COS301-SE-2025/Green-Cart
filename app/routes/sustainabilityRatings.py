from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.schemas.sustainability_ratings import fetchSustainabilityRatingsRequest, fetchSustainabilityRatingsResponse 
from app.services.sustainabilityRatings_service import fetchSustainabilityRatings

router = APIRouter(prefix="/sustainability", tags=["sustainability"])

@router.post("/ratings", response_model=fetchSustainabilityRatingsResponse)
def fetch_sustainability_ratings(request: fetchSustainabilityRatingsRequest, db: Session = Depends(get_db)):
    return fetchSustainabilityRatings(request.model_dump(), db)