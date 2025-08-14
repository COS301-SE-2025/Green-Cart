from pydantic import BaseModel
from typing import List

class MonthlyRevenue(BaseModel):
    month: str
    revenue: float

class RetailerMetrics(BaseModel):
    total_products: int
    availability: dict
    avg_sustainability_rating: float
    total_units_sold: int
    total_revenue: float
    monthly_revenue: List[MonthlyRevenue]

class RetailerMetricsResponse(BaseModel):
    status: int
    message: str
    data: RetailerMetrics
