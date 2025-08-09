from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from app.db.session import get_db
from app.services.carbon_goals_service import (
    get_user_carbon_goals,
    set_carbon_goal,
    get_carbon_goal,
    get_user_carbon_data
)

router = APIRouter()

class SetCarbonGoalRequest(BaseModel):
    user_id: str
    month: int
    goal_value: float

class GetCarbonGoalRequest(BaseModel):
    user_id: str
    month: int

class GetCarbonDataRequest(BaseModel):
    user_id: str

@router.get("/carbon-goals/{user_id}")
async def get_user_goals(user_id: str, db: Session = Depends(get_db)):
    """Get all carbon goals for a user"""
    return get_user_carbon_goals(user_id, db)

@router.post("/carbon-goals/set")
async def set_goal(request: SetCarbonGoalRequest, db: Session = Depends(get_db)):
    """Set or update a carbon goal for a specific month"""
    return set_carbon_goal(request.user_id, request.month, request.goal_value, db)

@router.post("/carbon-goals/get")
async def get_goal(request: GetCarbonGoalRequest, db: Session = Depends(get_db)):
    """Get carbon goal for a specific month"""
    return get_carbon_goal(request.user_id, request.month, db)

@router.post("/carbon-data")
async def get_carbon_data(request: GetCarbonDataRequest, db: Session = Depends(get_db)):
    """Get complete carbon footprint data for user including monthly footprints and goals"""
    return get_user_carbon_data(request.user_id, db)

@router.put("/carbon-goals/update")
async def update_goal(request: SetCarbonGoalRequest, db: Session = Depends(get_db)):
    """Update a carbon goal (same as set but with PUT method for chart drag updates)"""
    return set_carbon_goal(request.user_id, request.month, request.goal_value, db)

@router.get("/debug/user-orders/{user_id}")
async def debug_user_orders(user_id: str, db: Session = Depends(get_db)):
    """Debug endpoint to see all user orders and their sustainability ratings"""
    try:
        query = """
        SELECT 
            o.id as order_id,
            o.created_at,
            o.state,
            EXTRACT(MONTH FROM o.created_at) as month,
            EXTRACT(YEAR FROM o.created_at) as year,
            COUNT(ci.id) as total_items,
            AVG(sr.value) as avg_sustainability,
            STRING_AGG(DISTINCT p.name, ', ') as products
        FROM orders o
        JOIN cart_items ci ON ci.cart_id = o.cart_id
        JOIN products p ON p.id = ci.product_id
        LEFT JOIN sustainability_ratings sr ON sr.product_id = p.id AND sr.verification = true
        WHERE o.user_id = :user_id
        GROUP BY o.id, o.created_at, o.state
        ORDER BY o.created_at DESC
        """
        
        result = db.execute(text(query), {"user_id": user_id})
        orders = result.fetchall()
        
        # Convert to list of dictionaries
        orders_data = []
        for order in orders:
            orders_data.append({
                "order_id": order.order_id,
                "created_at": str(order.created_at),
                "state": order.state,
                "month": order.month,
                "year": order.year,
                "total_items": order.total_items,
                "avg_sustainability": float(order.avg_sustainability) if order.avg_sustainability else None,
                "products": order.products
            })
        
        return {
            "user_id": user_id,
            "total_orders": len(orders_data),
            "orders": orders_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching debug data: {str(e)}")
