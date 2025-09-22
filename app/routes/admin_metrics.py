from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.db.session import get_db
from app.models.user import User
from app.models.retailer_information import RetailerInformation
from app.models.product import Product
from app.models.orders import Order
from app.models.categories import Category
from app.models.cart_item import CartItem
from app.models.cart import Cart
from datetime import datetime, timedelta
from typing import List, Dict

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/metrics")
def get_admin_metrics(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_retailers = db.query(RetailerInformation.user_id).group_by(RetailerInformation.user_id).count()
    total_products = db.query(Product).count()
    
    # Get verified and unverified product counts
    verified_products = db.query(Product).filter(Product.verified == True).count()
    unverified_products = db.query(Product).filter(Product.verified == False).count()
    
    # Get recent orders as a proxy for user activity
    week_ago = datetime.now() - timedelta(days=7)
    recent_orders = db.query(Order).filter(
        Order.created_at >= week_ago
    ).count()
    
    # Get retailers with products (active retailers)
    active_retailers = db.query(RetailerInformation).join(Product).distinct().count()
    
    # Get top 3 categories based on order volume (how much was ordered from each category)
    top_categories = db.query(
        Category.name,
        func.sum(CartItem.quantity).label('total_ordered')
    ).join(Product, Category.id == Product.category_id)\
     .join(CartItem, Product.id == CartItem.product_id)\
     .join(Cart, CartItem.cart_id == Cart.id)\
     .join(Order, Cart.id == Order.cart_id)\
     .group_by(Category.id, Category.name)\
     .order_by(func.sum(CartItem.quantity).desc())\
     .limit(3).all()
    
    # If we have fewer than 3 categories with orders, get categories by product count to fill up to 3
    if len(top_categories) < 3:
        # Get categories ordered by product count that aren't already in top_categories
        ordered_category_names = [cat.name for cat in top_categories]
        additional_categories = db.query(
            Category.name,
            func.count(Product.id).label('product_count')
        ).join(Product, Category.id == Product.category_id)\
         .filter(~Category.name.in_(ordered_category_names))\
         .group_by(Category.id, Category.name)\
         .order_by(func.count(Product.id).desc())\
         .limit(3 - len(top_categories)).all()
        
        # Convert additional categories to the same format
        for cat in additional_categories:
            # Create a mock result object with total_ordered = 0
            class MockResult:
                def __init__(self, name, total_ordered):
                    self.name = name
                    self.total_ordered = total_ordered
            
            top_categories.append(MockResult(cat.name, 0))
    
    # Calculate total ordered items for percentage calculations
    total_ordered_items = sum([cat.total_ordered for cat in top_categories if cat.total_ordered > 0])
    
    # Format categories for frontend (top 3)
    categories_data = []
    colors = ['#1f2937', '#4b5563', '#9ca3af']  # 3 distinct colors for top 3 categories
    
    for i, category in enumerate(top_categories):
        if total_ordered_items > 0 and category.total_ordered > 0:
            percentage = (category.total_ordered / total_ordered_items * 100)
        else:
            # For categories with no orders, distribute remaining percentage evenly
            percentage = 0
        
        categories_data.append({
            "name": category.name,
            "count": int(category.total_ordered) if category.total_ordered else 0,
            "percentage": round(percentage, 1),
            "color": colors[i] if i < len(colors) else '#e5e7eb'
        })
    
    # If we only have categories with orders, make sure percentages add up to 100
    if total_ordered_items > 0:
        ordered_categories = [cat for cat in categories_data if cat['count'] > 0]
        if len(ordered_categories) == 1:
            ordered_categories[0]['percentage'] = 100.0
    
    # Get monthly order data for the last 12 months
    current_date = datetime.now()
    monthly_orders = []
    
    for i in range(12):
        # Calculate the target month and year
        target_date = current_date - timedelta(days=30 * i)
        month = target_date.month
        year = target_date.year
        
        # Query orders for this month
        orders_count = db.query(Order).filter(
            extract('year', Order.created_at) == year,
            extract('month', Order.created_at) == month
        ).count()
        
        # Format month name
        month_name = target_date.strftime('%b %Y')
        
        monthly_orders.append({
            "month": month_name,
            "orders": orders_count,
            "year": year,
            "month_num": month
        })
    
    # Reverse to get chronological order (oldest to newest)
    monthly_orders.reverse()
    
    return {
        "total_users": total_users,
        "total_retailers": total_retailers,
        "total_products": total_products,
        "verified_products": verified_products,
        "unverified_products": unverified_products,
        "recent_orders": recent_orders,
        "active_retailers": active_retailers,
        "top_categories": categories_data,
        "monthly_orders": monthly_orders
    }
