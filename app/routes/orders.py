from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
# from app.schemas.sustainability_ratings import fetchSustainabilityRatingsRequest, fetchSustainabilityRatingsResponse 
from app.services.orders_service import get_all_orders

router = APIRouter(prefix="/orders", tags=["Orders"])

# @router.post("getAllOrders")
# def get_all_orders_route(db: Session = Depends(get_db)):
#     return get_all_orders(db)

