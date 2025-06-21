from app.models.orders import Order
from app.models.product import Product
from fastapi import HTTPException
from sqlalchemy.orm import Session

def fetch_all_orders(request, db : Session):
    orders = db.query(Order).filter(Order.user_id == request.userID).offset(request.fromItem).limit(request.count).all()

    return {
        "status": 200,
        "message": "Success",
        "orders": orders
    }
    