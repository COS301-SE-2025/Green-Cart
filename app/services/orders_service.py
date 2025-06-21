from app.models.orders import Order
from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.product import Product
from app.models.user import User
from app.services.product_service import fetchProductImages
from app.services.sustainabilityRatings_service import fetchSustainabilityRatings
from fastapi import HTTPException
from sqlalchemy.orm import Session

def fetchAllOrders(request, db : Session):
    if request.fromItem < 0 or request.count <= 0:
        raise HTTPException(status_code=400, detail="Invalid pagination parameters")
    
    orders = db.query(Order).filter(Order.user_id == request.userID).offset(request.fromItem).limit(request.count).all()

    return {
        "status": 200,
        "message": "Success",
        "orders": orders
    }
    

def fetchOrderById(request, db: Session):
    if request.fromItem < 0 or request.count <= 0:
        raise HTTPException(status_code=400, detail="Invalid pagination parameters")

    order = db.query(Order).filter(Order.id == request.orderID, Order.user_id == request.userID).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    cart = db.query(Cart).filter(Cart.id == order.cart_id).first()

    cartItems = db.query(CartItem).filter(CartItem.cart_id == cart.id).offset(request.fromItem).limit(request.count).all()

    products = []
    images = []
    quantities = []
    rating = []

    for item in cartItems:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        
        if product is None:
            continue

        products.append(product)
        images.append(fetchProductImages(db, product.id)[0].image_url if fetchProductImages(db, product.id) else None)
        quantities.append(item.quantity)

        req = {
            "product_id": product.id
        }

        res = fetchSustainabilityRatings(req, db)
        rating.append(res.get("rating",0))

    return {
        "status": 200,
        "message": "Success",
        "order": order,
        "products": products,
        "images": images,
        "rating": rating,
        "quantities": quantities
    }

def createOrder(request, db : Session):
    user = db.query(User).filter(User.id == request.userID).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    cart = db.query(Order).filter(Order.cart_id == request.cartID, Order.user_id == user.id).first()

    if cart:
        raise HTTPException(status_code=409, detail="Cart is already in an order")

    try:
        order = Order(
        user_id = user.id,
        cart_id = request.cartID,
        state = "Preparing Order"
        )

        db.add(order)
        db.commit()
        db.refresh(order)

    except Exception as e:
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