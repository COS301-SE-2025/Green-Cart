from sqlalchemy.orm import Session
from app.models.orders import Order
from datetime import date
from datetime import timedelta
from sqlalchemy import extract

def get_orders_overview(request, db: Session):
    if request.time == 1:
        time_filter = date.today()
    elif request.time == 2:
        time_filter = date.today() - timedelta(days=7)
    elif request.time == 3:
        time_filter = date.today() - timedelta(days=30)
    else:
        time_filter = date.today() - timedelta(days=365)

    TotalOrders = db.query(Order).filter(Order.created_at >= time_filter).count()
    TotalPending = db.query(Order).filter(Order.state == 'Preparing Order', Order.created_at >= time_filter).count()
    TotalReady = db.query(Order).filter(Order.state == 'Ready for Delivery', Order.created_at >= time_filter).count()
    TotalTransit = db.query(Order).filter(Order.state == 'In Transit', Order.created_at >= time_filter).count()
    TotalDelivered = db.query(Order).filter(Order.state == 'Delivered', Order.created_at >= time_filter).count()
    TotalCancelled = db.query(Order).filter(Order.state == 'Cancelled', Order.created_at >= time_filter).count()

    today = date.today()
    first_day_this_month = today.replace(day=1)
    first_day_last_month = (first_day_this_month - timedelta(days=1)).replace(day=1)
    last_day_last_month = first_day_this_month - timedelta(days=1)

    current_month_orders = db.query(Order).filter( Order.created_at >= first_day_this_month, Order.created_at <= today ).count()

    last_month_orders = db.query(Order).filter( Order.created_at >= first_day_last_month, Order.created_at <= last_day_last_month ).count()

    if last_month_orders == 0:
        percent_change = 1.0 if current_month_orders > 0 else 0.0
    else:
        percent_change = (current_month_orders - last_month_orders) / last_month_orders

    percentage_increase = percent_change
    # print("\n\n\n\n" + str(percentage_increase) + "\n\n\n\n")

    return {
        "status": 200,
        "message": "Orders overview fetched successfully",
        "total_orders": TotalOrders,
        "total_pending": TotalPending,
        "total_ready": TotalReady,
        "total_transit": TotalTransit,
        "total_delivered": TotalDelivered,
        "total_cancelled": TotalCancelled,
        "monthly_comparison": percentage_increase
    }
