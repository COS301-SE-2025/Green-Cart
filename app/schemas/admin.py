from datetime import datetime
from pydantic import BaseModel, EmailStr




class AdminLogin(BaseModel):
    email: EmailStr
    password: str


class AdminLoginResponse(BaseModel):
    status: int
    message: str
    user_id: str
    name: str | None = None
    email: EmailStr
    role: str

class AdminOrderOverviewRequest(BaseModel):
    time: int

class AdminOrderOverviewResponse(BaseModel):
    status: int
    message: str
    total_orders: int
    total_pending: int
    total_ready: int
    total_transit: int
    total_delivered: int
    total_cancelled: int
    monthly_comparison: float

class AdminOrderList(BaseModel):
    order_id: int
    user_id: str
    user_email: EmailStr
    date: datetime
    address: str
    state: str

class AdminOrderListResponse(BaseModel):
    status: int
    message: str
    orders: list[AdminOrderList]
