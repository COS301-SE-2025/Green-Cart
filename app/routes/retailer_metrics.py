from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.database import SessionLocal
import calendar

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/retailer/metrics/{retailer_id}")
def get_retailer_metrics(retailer_id: int, db: Session = Depends(get_db)):
    metrics = {}

    # 1. Total Number of Products
    metrics["total_products"] = db.execute(text("""
        SELECT COUNT(*) FROM products WHERE retailer_id = :retailer_id
    """), {"retailer_id": retailer_id}).scalar() or 0

    # 2. Product Availability
    stock_counts = db.execute(text("""
        SELECT
            COUNT(*) FILTER (WHERE in_stock = true) AS in_stock,
            COUNT(*) FILTER (WHERE in_stock = false) AS out_of_stock
        FROM products
        WHERE retailer_id = :retailer_id
    """), {"retailer_id": retailer_id}).fetchone()

    in_stock = stock_counts[0] if stock_counts and stock_counts[0] is not None else 0
    out_of_stock = stock_counts[1] if stock_counts and stock_counts[1] is not None else 0

    metrics["availability"] = {
        "in_stock": in_stock,
        "out_of_stock": out_of_stock,
        "discontinued": 0
    }

    # 3. Average Sustainability Rating
    avg_rating = db.execute(text("""
        SELECT ROUND(AVG(sustainability_ratings.value)::numeric, 2)
        FROM sustainability_ratings
        JOIN products ON sustainability_ratings.product_id = products.id
        WHERE products.retailer_id = :retailer_id
    """), {"retailer_id": retailer_id}).scalar()
    metrics["avg_sustainability_rating"] = float(avg_rating or 0.0)

    # 4. Total Units Sold (excluding Cancelled orders)
    total_units = db.execute(text("""
        SELECT SUM(ci.quantity)
        FROM orders o
        JOIN carts c ON o.cart_id = c.id
        JOIN cart_items ci ON ci.cart_id = c.id
        JOIN products p ON ci.product_id = p.id
        WHERE p.retailer_id = :retailer_id
          AND o.state != 'Cancelled'
    """), {"retailer_id": retailer_id}).scalar()
    metrics["total_units_sold"] = int(total_units or 0)

    # 5. Total Revenue (excluding Cancelled orders)
    total_revenue = db.execute(text("""
        SELECT ROUND(SUM(ci.quantity * p.price)::numeric, 2)
        FROM orders o
        JOIN carts c ON o.cart_id = c.id
        JOIN cart_items ci ON ci.cart_id = c.id
        JOIN products p ON ci.product_id = p.id
        WHERE p.retailer_id = :retailer_id
          AND o.state != 'Cancelled'
    """), {"retailer_id": retailer_id}).scalar()
    metrics["total_revenue"] = float(total_revenue or 0.0)

    # 6. Monthly Revenue (fill 12 months, exclude Cancelled)
    revenue_rows = db.execute(text("""
        SELECT DATE_TRUNC('month', o.created_at) AS month,
               ROUND(SUM(ci.quantity * p.price)::numeric, 2) AS revenue
        FROM orders o
        JOIN carts c ON o.cart_id = c.id
        JOIN cart_items ci ON ci.cart_id = c.id
        JOIN products p ON ci.product_id = p.id
        WHERE p.retailer_id = :retailer_id
          AND o.state != 'Cancelled'
        GROUP BY month
    """), {"retailer_id": retailer_id}).fetchall()

    # Convert DB results into dict: {"01": 123.45, "02": 0.0, ...}
    monthly_data = {row[0].month: float(row[1] or 0.0) for row in revenue_rows}

    # Pad to ensure Jan–Dec are included
    metrics["monthly_revenue"] = []
    for m in range(1, 13):
        metrics["monthly_revenue"].append({
            "month": calendar.month_abbr[m],
            "revenue": monthly_data.get(m, 0.0)
        })

    return {
        "status": 200,
        "message": "Retailer metrics retrieved successfully",
        "data": metrics
    }
