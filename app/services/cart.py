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
    from app.models.product import Product
    from fastapi import HTTPException
    from app.utilities.stock_utils import sync_stock_status, is_product_available
    
    # Check if product exists
    product = db.query(Product).filter(Product.id == item.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Sync stock status first to ensure data consistency
    sync_stock_status(db, product.id)
    
    # Refresh product data after sync
    db.refresh(product)
    
    # Check if product is available for the requested quantity
    is_available, reason = is_product_available(product, item.quantity)
    if not is_available:
        raise HTTPException(status_code=400, detail=reason)
    
    cart = get_cart(db, user_id)
    existing = db.query(CartItem).filter_by(cart_id=cart.id, product_id=item.product_id).first()

    if existing:
        # Check if adding more would exceed available stock
        new_quantity = existing.quantity + item.quantity
        is_available, reason = is_product_available(product, new_quantity)
        if not is_available:
            raise HTTPException(
                status_code=400, 
                detail=f"Cannot add {item.quantity} more of '{product.name}'. You already have {existing.quantity} in cart. {reason}"
            )
        existing.quantity = new_quantity
    else:
        existing = CartItem(cart_id=cart.id, product_id=item.product_id, quantity=item.quantity)
        db.add(existing)

    db.commit()
    db.refresh(existing)
    return existing

def get_cart(db: Session, user_id: str):
    cart = db.query(Cart).filter(Cart.user_id == user_id).order_by(Cart.created_at.desc()).first()
    
    # If no cart exists for this user, create a new one
    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
        return cart
    
    # Check if this cart is already used in an order
    order = db.query(Order).filter(Order.user_id == user_id, Order.cart_id == cart.id).first()
    if order:
        # If cart is already used in an order, create a new cart
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


