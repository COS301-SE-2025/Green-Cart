from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class CreateProductRequest(BaseModel):
    name: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    price: float = Field(..., gt=0)
    quantity: int = Field(..., ge=0)
    brand: str = Field(..., min_length=1)
    category_id: int
    retailer_id: int
    sustainability_metrics: dict  # Contains sustainability metrics

class ProductResponse(BaseModel):
    id: int
    name: str
    description: str
    price: float
    in_stock: bool
    quantity: int
    brand: str
    category_id: int
    retailer_id: int
    created_at: Optional[datetime] = None
    image_url: Optional[str] = None
    sustainability_rating: Optional[float] = None
