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

@router.post("/fix-localhost-urls")
async def fix_localhost_urls(db: Session = Depends(get_db)):
    """
    Fix any localhost URLs in the database to use S3 bucket URLs
    """
    try:
        # S3 bucket base URL
        s3_base_url = "https://greencart-images-cos-301.s3.amazonaws.com"
        
        # Check product_images table schema first
        image_check = text("SELECT column_name FROM information_schema.columns WHERE table_name = 'product_images'")
        image_columns = db.execute(image_check).fetchall()
        image_column_names = [row[0] for row in image_columns]
        
        updates_made = 0
        
        # Update localhost URLs based on available columns
        if 'url' in image_column_names:
            update_query = text("""
                UPDATE product_images 
                SET url = REPLACE(url, 'http://localhost:8000/images/', :s3_base_url || '/')
                WHERE url LIKE 'http://localhost:8000/images/%'
            """)
            result = db.execute(update_query, {"s3_base_url": s3_base_url})
            updates_made += result.rowcount
            
        elif 'image_url' in image_column_names:
            update_query = text("""
                UPDATE product_images 
                SET image_url = REPLACE(image_url, 'http://localhost:8000/images/', :s3_base_url || '/')
                WHERE image_url LIKE 'http://localhost:8000/images/%'
            """)
            result = db.execute(update_query, {"s3_base_url": s3_base_url})
            updates_made += result.rowcount
            
        elif 'file_path' in image_column_names:
            update_query = text("""
                UPDATE product_images 
                SET file_path = REPLACE(file_path, 'http://localhost:8000/images/', :s3_base_url || '/')
                WHERE file_path LIKE 'http://localhost:8000/images/%'
            """)
            result = db.execute(update_query, {"s3_base_url": s3_base_url})
            updates_made += result.rowcount
        
        # Also check products table for any image URLs
        try:
            product_check = text("SELECT column_name FROM information_schema.columns WHERE table_name = 'products'")
            product_columns = db.execute(product_check).fetchall()
            product_column_names = [row[0] for row in product_columns]
            
            if 'image_url' in product_column_names:
                product_update = text("""
                    UPDATE products 
                    SET image_url = REPLACE(image_url, 'http://localhost:8000/images/', :s3_base_url || '/')
                    WHERE image_url LIKE 'http://localhost:8000/images/%'
                """)
                result = db.execute(product_update, {"s3_base_url": s3_base_url})
                updates_made += result.rowcount
        except:
            pass  # Products table might not have image_url column
        
        db.commit()
        
        return {
            "status": "success",
            "message": f"Fixed {updates_made} localhost URLs",
            "s3_base_url": s3_base_url,
            "updates_made": updates_made,
            "columns_found": image_column_names
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error fixing localhost URLs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fixing URLs: {str(e)}")

@router.get("/debug-env")
async def debug_environment():
    """
    Debug endpoint to check environment variables (remove in production)
    """
    import os
    
    return {
        "status": "debug",
        "environment": {
            "AWS_REGION": os.getenv("AWS_REGION", "NOT_SET"),
            "AWS_S3_BUCKET_NAME": os.getenv("AWS_S3_BUCKET_NAME", "NOT_SET"),
            "BASE_URL": os.getenv("BASE_URL", "NOT_SET"),
            "DATABASE_URL": "***HIDDEN***" if os.getenv("DATABASE_URL") else "NOT_SET"
        }
    }

@router.post("/clear-all-products")
async def clear_all_products(db: Session = Depends(get_db)):
    """
    DANGER: Clear all products and related data from database
    This endpoint should only be accessible to admins!
    """
    try:
        logger.info("🗑️  Starting product deletion process...")
        
        # Step 1: Get counts before deletion
        products_count = db.execute(text("SELECT COUNT(*) FROM products")).scalar()
        images_count = db.execute(text("SELECT COUNT(*) FROM product_images")).scalar()
        sustainability_count = db.execute(text("SELECT COUNT(*) FROM sustainability_ratings")).scalar()
        cart_items_count = db.execute(text("SELECT COUNT(*) FROM cart_items")).scalar()
        
        if products_count == 0:
            return {
                "message": "Database is already clean - no products to delete",
                "counts": {
                    "products": 0,
                    "images": 0,
                    "sustainability_ratings": 0,
                    "cart_items": 0
                }
            }
        
        # Step 2: Clear in correct order (foreign key constraints)
        
        # Clear cart items first (they reference products)
        cart_result = db.execute(text("DELETE FROM cart_items"))
        cart_deleted = cart_result.rowcount
        
        # Clear sustainability ratings (foreign key to products)
        sust_result = db.execute(text("DELETE FROM sustainability_ratings"))
        sust_deleted = sust_result.rowcount
        
        # Clear product images (foreign key to products)
        img_result = db.execute(text("DELETE FROM product_images"))
        img_deleted = img_result.rowcount
        
        # Clear products (main table)
        prod_result = db.execute(text("DELETE FROM products"))
        prod_deleted = prod_result.rowcount
        
        # Reset auto-increment sequences
        try:
            db.execute(text("ALTER SEQUENCE products_id_seq RESTART WITH 1"))
            db.execute(text("ALTER SEQUENCE product_images_id_seq RESTART WITH 1"))
            db.execute(text("ALTER SEQUENCE sustainability_ratings_id_seq RESTART WITH 1"))
        except Exception as e:
            logger.warning(f"Could not reset sequences: {e}")
        
        # Commit all changes
        db.commit()
        
        logger.info(f"Successfully deleted {prod_deleted} products and related data")
        
        return {
            "message": "ALL PRODUCTS AND RELATED DATA CLEARED SUCCESSFULLY",
            "deleted_counts": {
                "products": prod_deleted,
                "product_images": img_deleted,
                "sustainability_ratings": sust_deleted,
                "cart_items": cart_deleted
            },
            "original_counts": {
                "products": products_count,
                "product_images": images_count,
                "sustainability_ratings": sustainability_count,
                "cart_items": cart_items_count
            }
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to clear products: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to clear products: {str(e)}"
        )

@router.get("/product-counts")
async def get_product_counts(db: Session = Depends(get_db)):
    """Get current counts of products and related data"""
    try:
        products_count = db.execute(text("SELECT COUNT(*) FROM products")).scalar()
        images_count = db.execute(text("SELECT COUNT(*) FROM product_images")).scalar()
        sustainability_count = db.execute(text("SELECT COUNT(*) FROM sustainability_ratings")).scalar()
        cart_items_count = db.execute(text("SELECT COUNT(*) FROM cart_items")).scalar()
        
        return {
            "counts": {
                "products": products_count,
                "product_images": images_count,
                "sustainability_ratings": sustainability_count,
                "cart_items": cart_items_count
            },
            "status": "clean" if products_count == 0 else f"{products_count} products found"
        }
        
    except Exception as e:
        logger.error(f"Failed to get counts: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get counts: {str(e)}"
        )
