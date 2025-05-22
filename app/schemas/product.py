from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime

class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: Optional[Decimal] = None
    in_stock: Optional[bool] = None
    quantity: Optional[int] = None
    brand: Optional[str] = None
    category_id: Optional[int] = None
    retailer_id: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
