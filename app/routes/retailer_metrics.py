from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.retailer_metrics import RetailerMetricsResponse
from app.services.retailer_metrics_services import get_retailer_metrics_logic

router = APIRouter(prefix="/retailer", tags=["Retailer"])

@router.get("/metrics/{retailer_id}", response_model=RetailerMetricsResponse)
def get_metrics(retailer_id: int, db: Session = Depends(get_db)):
    data = get_retailer_metrics_logic(retailer_id, db)
    return {
        "status": 200,
        "message": "Retailer metrics retrieved successfully",
        "data": data
    }
