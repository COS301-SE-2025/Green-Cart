from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class SustainabilityMetric(BaseModel):
    id: int
    value: float

class SustainabilityData(BaseModel):
    energyEfficiency: Optional[float] = None
    carbonFootprint: Optional[float] = None
    recyclability: Optional[float] = None
    durability: Optional[float] = None
    materialSustainability: Optional[float] = None

class CreateProductRequest(BaseModel):
    name: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    price: float = Field(..., gt=0)
    quantity: int = Field(..., ge=0)
    brand: str = Field(..., min_length=1)
    category_id: int
    retailer_id: int
    sustainability_metrics: Optional[List[SustainabilityMetric]] = []  # Array of sustainability metrics (old format)
    sustainability: Optional[SustainabilityData] = None  # New format for sustainability data
    images: Optional[List[str]] = []  # List of base64 image strings or URLs

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
