import calendar
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.models.product import Product
from app.models.orders import Order
from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.sustainability_ratings import SustainabilityRating
from app.schemas.retailer_metrics import RetailerMetrics


def get_retailer_metrics_logic(retailer_id: int, db: Session) -> RetailerMetrics:
    # 1. Total Number of Products
    total_products = db.query(Product).filter(Product.retailer_id == retailer_id).count()

    # 2. Product Availability
    in_stock_count = db.query(Product).filter(Product.retailer_id == retailer_id, Product.in_stock == True).count()
    out_of_stock_count = db.query(Product).filter(Product.retailer_id == retailer_id, Product.in_stock == False).count()
    discontinued_count = 0  # Placeholder, adjust if your schema tracks this

    # 3. Average Sustainability Rating
    avg_rating_query = (
        db.query(func.avg(SustainabilityRating.value))
        .join(Product, Product.id == SustainabilityRating.product_id)
        .filter(Product.retailer_id == retailer_id)
        .scalar()
    )
    avg_rating = round(float(avg_rating_query), 2) if avg_rating_query else 0.0

    # 4. Total Units Sold (excluding cancelled)
    total_units_sold = (
        db.query(func.sum(CartItem.quantity))
        .join(Cart, Cart.id == CartItem.cart_id)
        .join(Order, Order.cart_id == Cart.id)
        .join(Product, Product.id == CartItem.product_id)
        .filter(Product.retailer_id == retailer_id, Order.state != "Cancelled")
        .scalar()
    ) or 0

    # 5. Total Revenue (excluding cancelled)
    total_revenue = (
        db.query(func.sum(CartItem.quantity * Product.price))
        .join(Cart, Cart.id == CartItem.cart_id)
        .join(Order, Order.cart_id == Cart.id)
        .join(Product, Product.id == CartItem.product_id)
        .filter(Product.retailer_id == retailer_id, Order.state != "Cancelled")
        .scalar()
    )
    total_revenue = round(float(total_revenue), 2) if total_revenue else 0.0

    # 6. Monthly Revenue (Jan–Dec, ensure 12 months)
    monthly_raw = (
        db.query(
            extract("month", Order.created_at).label("month"),
            func.sum(CartItem.quantity * Product.price).label("revenue")
        )
        .join(Cart, Cart.id == CartItem.cart_id)
        .join(Order, Order.cart_id == Cart.id)
        .join(Product, Product.id == CartItem.product_id)
        .filter(Product.retailer_id == retailer_id, Order.state != "Cancelled")
        .group_by("month")
        .all()
    )

    month_map = {int(month): float(revenue) for month, revenue in monthly_raw}
    monthly_revenue = [
        {"month": calendar.month_abbr[m], "revenue": month_map.get(m, 0.0)}
        for m in range(1, 13)
    ]

    return RetailerMetrics(
        total_products=total_products,
        availability={
            "in_stock": in_stock_count,
            "out_of_stock": out_of_stock_count,
            "discontinued": discontinued_count,
        },
        avg_sustainability_rating=avg_rating,
        total_units_sold=int(total_units_sold),
        total_revenue=total_revenue,
        monthly_revenue=monthly_revenue,
    )
