from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.schemas.product import ProductResponse, FetchAllProductsResponse, FetchAllProductsRequest, FetchProductRequest, FetchProductResponse, SearchProductsRequest, SearchProductsResponse
from app.services.product_service import get_all_products, fetchAllProducts, fetchProduct, searchProducts

router = APIRouter(prefix="/products", tags=["Products"])

# This route should be removed further down the line[Was used for testing purposes]
@router.get("/", response_model=List[ProductResponse])
def list_products(db: Session = Depends(get_db)):
    return get_all_products(db)

@router.post("/FetchAllProducts", response_model=FetchAllProductsResponse)
def fetch_all_products(request: FetchAllProductsRequest, db: Session = Depends(get_db)):
    return fetchAllProducts(request.model_dump(), db)

@router.post("/FetchProduct", response_model=FetchProductResponse)
def fetch_product(request: FetchProductRequest, db: Session = Depends(get_db)):
    return fetchProduct(request.model_dump(), db)

@router.post("/SearchProducts", response_model=SearchProductsResponse)
def search_products(request: SearchProductsRequest, db: Session = Depends(get_db)):
    return searchProducts(request.model_dump(), db)