from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db
from app.models.categories import Category
import logging

router = APIRouter(prefix="/admin", tags=["Admin"])
logger = logging.getLogger(__name__)

@router.post("/initialize-database")
async def initialize_database(db: Session = Depends(get_db)):
    """
    Initialize database with required categories and fix any schema issues
    """
    try:
        # Create categories if they don't exist
        categories = [
            {"id": 1, "name": "Fruits & Vegetables", "description": "Fresh produce"},
            {"id": 2, "name": "Dairy & Eggs", "description": "Dairy products and eggs"},
            {"id": 3, "name": "Meat & Seafood", "description": "Fresh meat and seafood"},
            {"id": 4, "name": "Pantry Staples", "description": "Rice, pasta, grains, canned goods"},
            {"id": 5, "name": "Snacks & Beverages", "description": "Snacks and drinks"},
            {"id": 6, "name": "Health & Beauty", "description": "Personal care products"},
            {"id": 7, "name": "Household Items", "description": "Cleaning supplies and household goods"},
            {"id": 8, "name": "Organic", "description": "Certified organic products"}
        ]
        
        for cat_data in categories:
            # Check if category exists
            existing = db.query(Category).filter(Category.id == cat_data["id"]).first()
            if not existing:
                category = Category(
                    id=cat_data["id"],
                    name=cat_data["name"],
                    description=cat_data["description"]
                )
                db.add(category)
        
        db.commit()
        
        # Get current category count
        total_categories = db.query(Category).count()
        
        return {
            "status": "success",
            "message": f"Database initialized successfully with {total_categories} categories",
            "categories_created": total_categories
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error initializing database: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error initializing database: {str(e)}")

@router.get("/check-database-health")
async def check_database_health(db: Session = Depends(get_db)):
    """
    Check database health and schema
    """
    try:
        # Check categories
        category_count = db.query(Category).count()
        
        # Check for product_images table schema
        try:
            image_check = text("SELECT column_name FROM information_schema.columns WHERE table_name = 'product_images'")
            image_columns = db.execute(image_check).fetchall()
            image_column_names = [row[0] for row in image_columns]
        except:
            image_column_names = []
        
        # Check for localhost URLs (try different column names)
        localhost_count = 0
        try:
            if 'url' in image_column_names:
                localhost_query = text("SELECT COUNT(*) FROM product_images WHERE url LIKE 'http://localhost:8000%'")
            elif 'image_url' in image_column_names:
                localhost_query = text("SELECT COUNT(*) FROM product_images WHERE image_url LIKE 'http://localhost:8000%'")
            elif 'file_path' in image_column_names:
                localhost_query = text("SELECT COUNT(*) FROM product_images WHERE file_path LIKE 'http://localhost:8000%'")
            else:
                localhost_query = None
                
            if localhost_query:
                result = db.execute(localhost_query)
                localhost_count = result.fetchone()[0]
        except Exception as e:
            logger.warning(f"Could not check localhost URLs: {e}")
        
        return {
            "status": "healthy",
            "categories_count": category_count,
            "product_images_columns": image_column_names,
            "localhost_urls_count": localhost_count,
            "message": "Database health check completed"
        }
        
    except Exception as e:
        logger.error(f"Error checking database health: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error checking database: {str(e)}")
