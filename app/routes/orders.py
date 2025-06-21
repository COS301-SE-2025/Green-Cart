from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.orders import FetchAllOrdersResponse, FetchAllOrdersRequst
from app.services.orders_service import fetch_all_orders

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("getAllOrders", response_model=FetchAllOrdersResponse)
def fetch_all_orders(request: FetchAllOrdersRequst, db: Session = Depends(get_db)):
    return fetch_all_orders(request, db)
