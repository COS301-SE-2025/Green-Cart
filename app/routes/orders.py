from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.orders import (
    FetchAllOrdersRequest, FetchAllOrdersResponse,
    FetchOrderByIdRequest, FetchOrderByIdResponse,
    CreateOrderRequest, CreateOrderResponse,
    CancelOrderRequest, CancelledOrderResponse
)
from app.services.orders_service import (
    fetchAllOrders, fetchOrderById, createOrder, cancellOrder
)

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/getAllOrders", response_model=FetchAllOrdersResponse)
def fetch_all_orders(request: FetchAllOrdersRequest, db: Session = Depends(get_db)):
    return fetchAllOrders(request, db)

@router.post("/getOrderByID", response_model=FetchOrderByIdResponse)
def fetch_order_by_id(request: FetchOrderByIdRequest, db: Session = Depends(get_db)):
    return fetchOrderById(request, db)

@router.post("/createOrder", response_model=CreateOrderResponse)
def create_order(request: CreateOrderRequest, db: Session = Depends(get_db)):
    return createOrder(request, db)

@router.patch("/cancelOrder", response_model=CancelledOrderResponse)
def cancel_order(request: CancelOrderRequest, db: Session = Depends(get_db)):
    return cancellOrder(request, db)
