from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.product import Product
from app.models.orders import Order
from app.models.cart import Cart
from app.models.cart_item import CartItem
from sqlalchemy import func

router = APIRouter(prefix="/products", tags=["Products"])
@router.post("/sales_metrics")
def get_product_sales_metrics(product_id: int = Body(...), db: Session = Depends(get_db)):
    valid_states = ["Preparing Order", "Ready for Delivery", "In Transit", "Delivered"]
    valid_order_cart_ids = db.query(Order.cart_id).filter(Order.state.in_(valid_states)).subquery()
    cart_items = db.query(CartItem).filter(
        CartItem.product_id == product_id,
        CartItem.cart_id.in_(valid_order_cart_ids)
    ).all()
    units_sold = sum(item.quantity for item in cart_items)
    product = db.query(Product).filter(Product.id == product_id).first()
    price = float(product.price) if product and product.price else 0.0
    revenue = sum(item.quantity * price for item in cart_items)
    return {
        "status": 200,
        "message": "Success",
        "product_id": product_id,
        "units_sold": units_sold,
        "revenue": revenue
    }
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

