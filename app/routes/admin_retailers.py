from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.retailer_information import RetailerInformation

router = APIRouter(prefix="/admin", tags=["Admin Retailers"])

@router.get("/retailers")
def get_all_retailers(db: Session = Depends(get_db)):
    retailers = db.query(RetailerInformation).all()
    return {
        "status": 200,
        "message": "Success", 
        "data": retailers
    }
