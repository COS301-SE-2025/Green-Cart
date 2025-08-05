from fastapi import APIRouter, Depends, HTTPException
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

@router.delete("/retailers/{retailer_id}")
def delete_retailer(retailer_id: int, db: Session = Depends(get_db)):
    retailer = db.query(RetailerInformation).filter(RetailerInformation.id == retailer_id).first()
    if not retailer:
        raise HTTPException(status_code=404, detail="Retailer not found")
    
    db.delete(retailer)
    db.commit()
    return {
        "status": 200,
        "message": "Retailer deleted successfully"
    }
