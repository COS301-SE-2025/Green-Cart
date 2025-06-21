from pydantic import BaseModel
from typing import Optional, List, Dict
from decimal import Decimal
from datetime import datetime
from app.schemas.product import ProductResponse

class OrderResponse(BaseModel):
    id: int
    user_id: str
    cart_id: int
    state: str
    created_at: Optional[datetime]

class FetchAllOrdersRequst(BaseModel):
    userID: str
    fromItem: int
    count: int

class FetchAllOrdersResponse(BaseModel):
    status: int
    message: str
    orders: List[OrderResponse]

class FetchOrderByIDRequest(BaseModel):
    userID: str
    orderID: int
    fromItem: int = 0
    count: int = 10

class FetchOrderByIDResponse(BaseModel):
    status: int
    message: str
    order: OrderResponse = None
    products: List[ProductResponse] = []
    images: List[str] = []
    quantities: List[int] = []
    rating: List[Decimal]  = []

class CreateOrderRequest(BaseModel):
    userID: str
    cartID: int

class CreateOrderResponse(BaseModel):
    status: int
    message: str
    order_id: int

class cancelledOrderRequest(BaseModel):
    userID: str
    orderID: int

class CancelledOrderResponse(BaseModel):
    status: int
    message: str
    order_id: int