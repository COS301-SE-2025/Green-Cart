from pydantic import BaseModel
from uuid import UUID


class DonationApplyRequest(BaseModel):
    user_id: UUID
    cart_id: int
    donation_amount: float  # R10, R20, or R30
    base_carbon_footprint: float


class DonationApplyResponse(BaseModel):
    adjusted_carbon_footprint: float
    reduction_percent: float
    offset_amount: float
