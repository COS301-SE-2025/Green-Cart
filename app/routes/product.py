from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.schemas.product import ProductResponse
from app.services.product_service import get_all_products

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("/", response_model=List[ProductResponse])
def list_products(db: Session = Depends(get_db)):
    return get_all_products(db)
