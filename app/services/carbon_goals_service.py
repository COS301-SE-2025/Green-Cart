from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from decimal import Decimal
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

def get_user_carbon_goals(user_id: str, db: Session):
    """Get all carbon goals for a user"""
    try:
        result = db.execute(
            text("SELECT month, goal_value FROM public.carbon_goals WHERE user_id = :user_id ORDER BY month"),
            {"user_id": user_id}
        )
        goals = result.fetchall()
        
        # Convert to dictionary for easier access
        goals_dict = {goal.month: float(goal.goal_value) for goal in goals}
        
        return {
            "status": 200,
            "message": "Success",
            "goals": goals_dict
        }
    except Exception as e:
        logger.error(f"Error fetching carbon goals for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching carbon goals: {str(e)}")

def set_carbon_goal(user_id: str, month: int, goal_value: float, db: Session):
    """Set or update a carbon goal for a specific month"""
    try:
        result = db.execute(
            text("SELECT public.set_carbon_goal(:user_id, :month, :goal_value)"),
            {"user_id": user_id, "month": month, "goal_value": goal_value}
        )
        success = result.scalar()
        
        if success:
            db.commit()
            return {
                "status": 200,
                "message": "Carbon goal updated successfully",
                "month": month,
                "goal_value": goal_value
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to update carbon goal")
            
    except Exception as e:
        db.rollback()
        logger.error(f"Error setting carbon goal for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error setting carbon goal: {str(e)}")

def get_carbon_goal(user_id: str, month: int, db: Session):
    """Get carbon goal for a specific month"""
    try:
        result = db.execute(
            text("SELECT public.get_carbon_goal(:user_id, :month)"),
            {"user_id": user_id, "month": month}
        )
        goal_value = result.scalar()
        
        return {
            "status": 200,
            "message": "Success",
            "month": month,
            "goal_value": float(goal_value)
        }
    except Exception as e:
        logger.error(f"Error fetching carbon goal for user {user_id}, month {month}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching carbon goal: {str(e)}")

def get_monthly_carbon_footprint(user_id: str, month: int, year: int, db: Session):
    """Get carbon footprint score (0-100) for a specific month from orders"""
    try:
        # Get all orders for the user in the specified month/year
        query = """
        SELECT o.id, o.created_at, AVG(sr.value) as avg_sustainability
        FROM orders o
        JOIN cart_items ci ON ci.cart_id = o.cart_id
        JOIN products p ON p.id = ci.product_id
        LEFT JOIN sustainability_ratings sr ON sr.product_id = p.id
        WHERE o.user_id = :user_id 
        AND EXTRACT(MONTH FROM o.created_at) = :month
        AND EXTRACT(YEAR FROM o.created_at) = :year
        AND o.state != 'Cancelled'
        AND sr.value IS NOT NULL
        GROUP BY o.id, o.created_at
        """
        
        result = db.execute(
            text(query),
            {"user_id": user_id, "month": month, "year": year}
        )
        orders = result.fetchall()
        
        if not orders:
            return None  # Return None if no orders for this month
        
        # Calculate average sustainability score across all orders
        total_sustainability = 0.0
        valid_orders = 0
        
        for order in orders:
            avg_rating = order.avg_sustainability if order.avg_sustainability else 50.0
            total_sustainability += avg_rating
            valid_orders += 1
        
        # Return average sustainability score (higher = better environmental impact)
        average_score = total_sustainability / valid_orders if valid_orders > 0 else None
        
        return round(average_score, 1) if average_score is not None else None
        
    except Exception as e:
        logger.error(f"Error calculating monthly footprint for user {user_id}: {str(e)}")
        return None  # Return None on error instead of default score

def get_user_carbon_data(user_id: str, db: Session):
    """Get complete carbon data for the user including monthly sustainability scores and goals"""
    try:
        current_date = datetime.now()
        current_month = current_date.month
        current_year = current_date.year
        
        # Get monthly data for all 12 months of the current year
        monthly_data = []
        valid_monthly_scores = []  # Only scores from months with actual orders
        
        for month_num in range(1, 13):  # January to December
            # Get month name
            month_name = datetime(current_year, month_num, 1).strftime('%b')
            
            # Get sustainability score for this month (0-100)
            score = get_monthly_carbon_footprint(user_id, month_num, current_year, db)
            
            # Get goal for this month
            goal_result = get_carbon_goal(user_id, month_num, db)
            goal = goal_result["goal_value"]
            
            monthly_data.append({
                "month": month_name,
                "footprint": score if score is not None else 0,  # Use 0 for months with no orders
                "goal": goal
            })
            
            # Only include months with actual orders in yearly average calculation
            if score is not None and score > 0:
                valid_monthly_scores.append(score)
                logger.info(f"Including {month_name} ({month_num}) with score {score} in yearly average")
        
        # Calculate current and last month scores
        monthly_score = get_monthly_carbon_footprint(user_id, current_month, current_year, db)
        
        last_month = current_month - 1
        last_year = current_year
        if last_month == 0:
            last_month = 12
            last_year -= 1
        last_month_score = get_monthly_carbon_footprint(user_id, last_month, last_year, db)
        
        # Calculate average score for the year (only from months with actual orders)
        if len(valid_monthly_scores) > 0:
            average_yearly_score = sum(valid_monthly_scores) / len(valid_monthly_scores)
            logger.info(f"Yearly average calculation: {valid_monthly_scores} = {average_yearly_score}")
        else:
            average_yearly_score = 0
            logger.info("No months with orders found, yearly average = 0")
        
        logger.info(f"User {user_id} - Yearly calculation: valid_scores={valid_monthly_scores}, average={average_yearly_score}")
        
        return {
            "status": 200,
            "message": "Success",
            "data": {
                "totalFootprint": round(average_yearly_score, 1) if len(valid_monthly_scores) > 0 else 0,  # Average sustainability score this year
                "monthlyFootprint": monthly_score if monthly_score is not None else 0,  # Current month sustainability score
                "lastMonthFootprint": last_month_score if last_month_score is not None else 0,  # Last month sustainability score
                "yearlyGoal": 90.0,  # Target sustainability score for the year
                "monthlyData": monthly_data
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching carbon data for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching carbon data: {str(e)}")
