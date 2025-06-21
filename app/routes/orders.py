from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.orders import FetchAllOrdersResponse, FetchAllOrdersRequst, FetchOrderByIDRequest, FetchOrderByIDResponse, CreateOrderRequest, CreateOrderResponse
from app.services.orders_service import fetchAllOrders, fetchOrderById, createOrder

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("getAllOrders", response_model=FetchAllOrdersResponse)
def fetch_all_orders(request: FetchAllOrdersRequst, db: Session = Depends(get_db)):
    return fetchAllOrders(request, db)

@router.post("getOrderByID", response_model=FetchOrderByIDResponse)
def fetch_order_by_id(request: FetchOrderByIDRequest, db: Session = Depends(get_db)):
    return fetchOrderById(request, db)

@router.post("createOrder", response_model=CreateOrderResponse)
def create_order(request: CreateOrderRequest, db: Session = Depends(get_db)):
    return createOrder(request, db)