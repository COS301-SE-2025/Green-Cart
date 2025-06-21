from pydantic import BaseModel
from typing import Optional, List, Dict
from decimal import Decimal
from datetime import datetime

class OrderResponse(BaseModel):
    id: int
    user_id: str
    product_id: int
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
