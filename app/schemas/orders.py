from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal
from datetime import datetime
from app.schemas.product import ProductResponse

class OrderResponse(BaseModel):
    id: int
    user_id: str
    cart_id: int
    state: str
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

class FetchAllOrdersRequest(BaseModel):
    userID: str

class FetchAllOrdersResponse(BaseModel):
    status: int
    message: str
    orders: List[OrderResponse]

class FetchOrderByIdRequest(BaseModel):
    userID: str
    orderID: int

class FetchOrderByIdResponse(BaseModel):
    status: int
    message: str
    order: OrderResponse
    products: List[ProductResponse]
    images: List[str]
    quantities: List[int]
    rating: List[Decimal]
    average_sustainability: Decimal

class CreateOrderRequest(BaseModel):
    userID: str
    cartID: int

class CreateOrderResponse(BaseModel):
    status: int
    message: str
    order_id: int

class CancelOrderRequest(BaseModel):
    userID: str
    orderID: int

class CancelledOrderResponse(BaseModel):
    status: int
    message: str
    order_id: int
