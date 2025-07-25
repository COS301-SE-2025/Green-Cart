from fastapi import HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal

from app.models.orders import Order
from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.product import Product
from app.models.user import User
from app.services.product_service import fetchProductImages
from app.services.sustainabilityRatings_service import fetchSustainabilityRatings

def fetchAllOrders(request, db: Session):
    orders = db.query(Order).filter(Order.user_id == request.userID).order_by(Order.created_at.desc()).all()
    return {
        "status": 200,
        "message": "Success",
        "orders": orders
    }

def fetchOrderById(request, db: Session):
    order = db.query(Order).filter(Order.id == request.orderID, Order.user_id == request.userID).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    cart = db.query(Cart).filter(Cart.id == order.cart_id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    cartItems = db.query(CartItem).filter(CartItem.cart_id == cart.id).all()

    products, images, quantities, rating = [], [], [], []

    for item in cartItems:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            continue

        products.append(product)
        fetched_images = fetchProductImages(db, product.id)
        images.append(fetched_images[0].image_url if fetched_images else None)
        quantities.append(item.quantity)
        res = fetchSustainabilityRatings({"product_id": product.id}, db)
        rating.append(res.get("rating", 0))

    avg_rating = round(sum(rating) / len(rating), 2) if rating else 0.0

    return {
        "status": 200,
        "message": "Success",
        "order": order,
        "products": products,
        "images": images,
        "quantities": quantities,
        "rating": rating,
        "average_sustainability": Decimal(avg_rating)
    }

def createOrder(request, db: Session):
    user = db.query(User).filter(User.id == request.userID).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing_order = db.query(Order).filter(Order.cart_id == request.cartID, Order.user_id == user.id).first()
    if existing_order:
        raise HTTPException(status_code=409, detail="Cart is already in an order")

    cart_items = db.query(CartItem).filter(CartItem.cart_id == request.cartID).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty or not found")

    try:
        for item in cart_items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Product with ID {item.product_id} not found")
            if product.quantity is None or product.quantity < item.quantity:
                raise HTTPException(status_code=400, detail=f"Not enough stock for product: {product.name}")

            product.quantity -= item.quantity
            if product.quantity <= 0:
                product.quantity = 0
                product.in_stock = False

        order = Order(user_id=user.id, cart_id=request.cartID, state="Preparing Order")
        db.add(order)
        db.commit()
        db.refresh(order)

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating order: {str(e)}")

    return {
        "status": 201,
        "message": "Order created successfully",
        "order_id": order.id
    }

def cancellOrder(request, db: Session):
    order = db.query(Order).filter(Order.id == request.orderID, Order.user_id == request.userID).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.state = "Cancelled"
    db.commit()
    db.refresh(order)

    return {
        "status": 204,
        "message": "Success",
        "order_id": order.id
    }
