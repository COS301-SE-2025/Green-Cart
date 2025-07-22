from app.schemas.donation import DonationApplyRequest, DonationApplyResponse

donation_offsets = {
    10: 0.10,
    20: 0.20,
    30: 0.30
}


def apply_donation_logic(request: DonationApplyRequest) -> DonationApplyResponse:
    percent = donation_offsets.get(int(request.donation_amount), 0)
    offset_amount = request.base_carbon_footprint * percent
    adjusted = request.base_carbon_footprint - offset_amount

    return DonationApplyResponse(
        adjusted_carbon_footprint=round(adjusted, 2),
        reduction_percent=percent * 100,
        offset_amount=round(offset_amount, 2)
    )
