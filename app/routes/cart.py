from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db  # adjust if your db file has a different name
from app.schemas.cart import CartItemCreate, CartOut
from app.services import cart as cart_service

router = APIRouter(prefix="/cart", tags=["Cart"])

@router.post("/add", response_model=CartOut)
def add_to_cart(user_id: str, item: CartItemCreate, db: Session = Depends(get_db)):
    cart_service.add_item(db, user_id, item)
    cart = cart_service.get_cart(db, user_id)
    return cart

@router.get("/{user_id}", response_model=CartOut)
def view_cart(user_id: str, db: Session = Depends(get_db)):
    cart = cart_service.get_cart(db, user_id)
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    return cart

@router.delete("/remove", response_model=dict)
def remove_from_cart(user_id: str, product_id: int, db: Session = Depends(get_db)):
    success = cart_service.remove_item(db, user_id, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    return {"detail": "Item removed"}
