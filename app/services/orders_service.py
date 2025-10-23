from fastapi import HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal
from datetime import datetime, timedelta
import asyncio

from app.models.orders import Order
from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.product import Product
from app.models.user import User
from app.services.product_service import fetchProductImages
from app.services.sustainabilityRatings_service import fetchSustainabilityRatings
from app.services.email_service import email_service

async def send_order_confirmation_email(order, cart_items, user, db: Session):
    """Helper function to prepare and send order confirmation email"""
    try:
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f"Preparing email data for order {order.id}")
        
        # Calculate estimated delivery date (5-7 business days)
        delivery_date = datetime.now() + timedelta(days=6)  # 6 days for business days
        
        # Prepare order items with details
        email_items = []
        total_amount = Decimal('0.00')
        sustainability_ratings = []
        
        for item in cart_items:
            # Get product details
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if not product:
                continue
                
            # Get product images
            product_images = fetchProductImages(db, product.id)
            image_url = product_images[0].image_url if product_images else None
            
            # Get sustainability rating
            sustainability_response = fetchSustainabilityRatings({"product_id": product.id}, db)
            sustainability_rating = sustainability_response.get("rating", 0)
            sustainability_ratings.append(sustainability_rating)
            
            # Calculate item total
            item_price = Decimal(str(product.price))
            item_total = item_price * item.quantity
            total_amount += item_total
            
            email_items.append({
                'name': product.name,
                'quantity': item.quantity,
                'price': float(item_price),
                'sustainability_rating': sustainability_rating,
                'image_url': image_url
            })
        
        # Calculate average sustainability
        average_sustainability = sum(sustainability_ratings) / len(sustainability_ratings) if sustainability_ratings else 0
        
        # Prepare email data
        order_data = {
            'order_id': order.id,
            'order_date': order.created_at.strftime('%Y-%m-%d %H:%M') if order.created_at else datetime.now().strftime('%Y-%m-%d %H:%M'),
            'delivery_date': delivery_date.strftime('%Y-%m-%d'),
            'status': order.state,
            'items': email_items,
            'total_amount': float(total_amount),
            'average_sustainability': float(average_sustainability),
            'co2_saved': f"{float(average_sustainability) * 0.05:.1f}",  # Estimated based on sustainability
            'water_saved': f"{len(email_items) * 3 + int(float(average_sustainability) * 0.2)}",  # Estimated
            'waste_reduced': f"{min(int(float(average_sustainability) * 0.8), 95)}"  # Estimated percentage
        }
        
        # Send email
        if user.email:
            logger.info(f"Sending order confirmation email to {user.email}")
            email_sent = await email_service.send_order_confirmation(
                customer_email=user.email,
                customer_name=user.name or "Valued Customer",
                order_data=order_data
            )
            
            if email_sent:
                logger.info(f"✅ Order confirmation email sent successfully for order {order.id}")
            else:
                logger.warning(f"❌ Failed to send order confirmation email for order {order.id}")
        else:
            logger.warning(f"No email address found for user {user.id}")
            
    except Exception as e:
        logger.error(f"Error in send_order_confirmation_email: {e}")
        # Don't raise the exception as we don't want to fail order creation

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

async def createOrder(request, db: Session):
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info(f"Creating order for userID: {request.userID}, cartID: {request.cartID}")
    
    user = db.query(User).filter(User.id == request.userID).first()
    if not user:
        logger.error(f"User not found: {request.userID}")
        raise HTTPException(status_code=404, detail="User not found")

    logger.info(f"User found: {user.id}")

    existing_order = db.query(Order).filter(Order.cart_id == request.cartID, Order.user_id == user.id).first()
    if existing_order:
        logger.error(f"Cart {request.cartID} is already in an order: {existing_order.id}")
        raise HTTPException(status_code=409, detail="Cart is already in an order")

    cart_items = db.query(CartItem).filter(CartItem.cart_id == request.cartID).all()
    if not cart_items:
        logger.error(f"Cart {request.cartID} is empty or not found")
        raise HTTPException(status_code=400, detail="Cart is empty or not found")

    logger.info(f"Found {len(cart_items)} items in cart {request.cartID}")

    try:
        # Simplified version - skip stock validation for now to test email functionality
        logger.info(f"Creating order with user_id={user.id}, cart_id={request.cartID}")
        order = Order(user_id=user.id, cart_id=request.cartID, state="Preparing Order")
        db.add(order)
        db.commit()
        db.refresh(order)

        products = db.query(CartItem).filter(CartItem.cart_id == order.cart_id).all()

        for x in products:
            product = db.query(Product).filter(Product.id == x.product_id).first()
            product.quantity += 1
            db.commit()
            db.refresh(product)
        
        
        logger.info(f"Order created successfully with ID: {order.id}")
        
        # Send order confirmation email asynchronously
        try:
            logger.info("Attempting to send order confirmation email...")
            await send_order_confirmation_email(order, cart_items, user, db)
            logger.info("Order confirmation email process completed")
        except Exception as email_error:
            # Log email error but don't fail the order creation
            logger.error(f"Failed to send order confirmation email: {email_error}")
            import traceback
            logger.error(f"Email error traceback: {traceback.format_exc()}")

    except HTTPException:
        # Re-raise HTTPExceptions as-is (these are intentional errors with proper status codes)
        db.rollback()
        raise
    except Exception as e:
        # Only catch unexpected errors and convert them to 500
        logger.error(f"Unexpected error creating order: {str(e)}")
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
