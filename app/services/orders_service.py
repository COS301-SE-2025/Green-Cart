from app.models.orders import Order
from fastapi import HTTPException
from sqlalchemy.orm import Session

def get_all_orders(request, Session db):
    