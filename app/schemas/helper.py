from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class SustainabilityTypeResponse(BaseModel):
    id: int
    type_name: str
    importance_level: int
    description: Optional[str] = None
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CategoriesResponse(BaseModel):
    status: int
    message: str
    data: List[CategoryResponse] = []

class SustainabilityTypesResponse(BaseModel):
    status: int
    message: str
    data: List[SustainabilityTypeResponse] = []
