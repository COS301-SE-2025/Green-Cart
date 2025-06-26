from pydantic import BaseModel
from typing import Optional, List, Dict
from decimal import Decimal
from datetime import datetime
from app.schemas.sustainability_ratings import agregateSustainabilityRatings

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

class FetchAllProductsResponse(BaseModel):
    status: int
    message: str
    data: Optional[List[ProductResponse]] = []
    images: Optional[List[str]] = []
    rating: List[Decimal] = []

class FetchAllProductsRequest(BaseModel):
    apiKey: str 
    filter: Optional[Dict[str, str]] = None
    sort: Optional[List[str]] = None
    fromItem: int
    count: int

class FetchProductRequest(BaseModel):
    apiKey: str
    product_id: int

class FetchProductResponse(BaseModel):
    status: int
    message: str
    data: Optional[ProductResponse] = None
    images: Optional[List[str]] = []
    sustainability: agregateSustainabilityRatings = None

class SearchProductsRequest(BaseModel):
    apiKey: str
    search: str
    filter: Optional[Dict[str, str]] = None
    sort: Optional[List[str]] = None
    fromItem: int
    count: int

class SearchProductsResponse(BaseModel):
    status: int
    message: str
    data: Optional[List[ProductResponse]] = []
    images: Optional[List[str]] = []
    rating: List[Decimal] = []