from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db 
from app.schemas.admin import AdminOrderOverviewRequest, AdminOrderOverviewResponse, AdminOrderListResponse, AdminMonthlyOrdersResponse, AdminRevenueOverviewResponse
from app.services.admin_overview_services import get_orders_overview, get_orders_list, get_monthly_orders, get_revenue_overview

router = APIRouter(prefix="/admin/orders", tags=["Admin"])

@router.post("/overview", response_model=AdminOrderOverviewResponse)
def admin_orders_overview(request: AdminOrderOverviewRequest, db: Session = Depends(get_db)):
    return get_orders_overview(request, db)

@router.get("/list", response_model=AdminOrderListResponse)
def admin_orders_list(db: Session = Depends(get_db)):
    return get_orders_list(db)

@router.get("/monthly/{period}", response_model=AdminMonthlyOrdersResponse)
def get_monthly_orders_endpoint(period: int, db: Session = Depends(get_db)):
    return get_monthly_orders(period, db)

@router.get("/revenue/{period}", response_model=AdminRevenueOverviewResponse)
def get_revenue_overview_endpoint(period: int, db: Session = Depends(get_db)):
    return get_revenue_overview(period, db)