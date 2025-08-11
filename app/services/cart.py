from sqlalchemy.orm import Session
from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.orders import Order
from app.schemas.cart import CartItemCreate

def get_or_create_cart(db: Session, user_id: str):
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart

def add_item(db: Session, user_id: str, item: CartItemCreate):
    cart = get_cart(db, user_id)
    existing = db.query(CartItem).filter_by(cart_id=cart.id, product_id=item.product_id).first()

    if existing:
        existing.quantity += item.quantity
    else:
        existing = CartItem(cart_id=cart.id, product_id=item.product_id, quantity=item.quantity)
        db.add(existing)

    db.commit()
    db.refresh(existing)
    return existing

def get_cart(db: Session, user_id: str):
    cart =  db.query(Cart).filter(Cart.user_id == user_id).order_by(Cart.created_at.desc()).first()
    order = db.query(Order).filter(Order.user_id == user_id, Order.cart_id == cart.id).first()
    if order:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)

    return cart

def remove_item(db: Session, user_id: str, product_id: int):
    cart = db.query(Cart).filter(Cart.user_id == user_id).order_by(Cart.created_at.desc()).first()
    if not cart:
        return False
    item = db.query(CartItem).filter_by(cart_id=cart.id, product_id=product_id).first()
    if item:
        db.delete(item)
        db.commit()
        return True
    return False


