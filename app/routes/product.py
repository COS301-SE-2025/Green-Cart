from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.db.session import get_db
from app.schemas.product import ProductResponse, FetchAllProductsResponse
from app.services.product_service import get_all_products, fetchAllProducts

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("/", response_model=List[ProductResponse])
def list_products(db: Session = Depends(get_db)):
    return get_all_products(db)

@router.post("/FetchAllProducts", response_model=FetchAllProductsResponse)
async def fetch_all_products(request: Request, db: Session = Depends(get_db)):
    JSONRequest = await request.json();
    return fetchAllProducts(JSONRequest, db)