from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db 
from app.schemas.admin import AdminOrderOverviewRequest, AdminOrderOverviewResponse
from app.services.admin_overview_services import get_orders_overview

router = APIRouter(prefix="/admin/orders", tags=["Admin"])

@router.post("/overview", response_model=AdminOrderOverviewResponse)
def admin_orders_overview(request: AdminOrderOverviewRequest, db: Session = Depends(get_db)):
    return get_orders_overview(request, db)
