from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.retailer_information import RetailerInformation
from app.models.product import Product

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/metrics")
def get_admin_metrics(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_retailers = db.query(RetailerInformation).count()
    total_products = db.query(Product).count()
    return {
        "total_users": total_users,
        "total_retailers": total_retailers,
        "total_products": total_products
    }
