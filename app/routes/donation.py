from fastapi import APIRouter
from app.schemas.donation import DonationApplyRequest, DonationApplyResponse
from app.services.donation_service import apply_donation_logic

router = APIRouter(prefix="/donations", tags=["Donations"])

@router.post("/apply", response_model=DonationApplyResponse)
def apply_donation(request: DonationApplyRequest):
    return apply_donation_logic(request)
