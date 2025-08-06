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
        # Create categories if they don't exist (matching frontend categories)
        categories = [
            {"id": 1, "name": "Electronics", "description": "Electronic devices and gadgets"},
            {"id": 2, "name": "Fashion", "description": "Clothing and accessories"},
            {"id": 3, "name": "Home & Garden", "description": "Home improvement and gardening items"},
            {"id": 4, "name": "Beauty & Personal Care", "description": "Beauty and personal care products"},
            {"id": 5, "name": "Sports & Outdoors", "description": "Sports equipment and outdoor gear"},
            {"id": 6, "name": "Books & Media", "description": "Books, movies, music and media"},
            {"id": 7, "name": "Food & Beverages", "description": "Food items and beverages"},
            {"id": 8, "name": "Automotive", "description": "Car parts and automotive accessories"},
            {"id": 9, "name": "Health & Wellness", "description": "Health and wellness products"},
            {"id": 10, "name": "Baby & Kids", "description": "Baby and children's products"}
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
        
        # Step 1: Find all tables that reference products table
        foreign_key_query = text("""
            SELECT 
                tc.table_name, 
                kcu.column_name
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' 
              AND ccu.table_name='products'
              AND tc.table_schema = 'public'
        """)
        
        foreign_key_results = db.execute(foreign_key_query).fetchall()
        referencing_tables = [(row[0], row[1]) for row in foreign_key_results]
        
        logger.info(f"Found {len(referencing_tables)} tables referencing products: {referencing_tables}")
        
        # Step 2: Get counts before deletion
        products_count = db.execute(text("SELECT COUNT(*) FROM products")).scalar()
        
        counts = {"products": products_count}
        deleted_counts = {}
        
        # Get counts for all referencing tables
        for table_name, column_name in referencing_tables:
            try:
                count = db.execute(text(f"SELECT COUNT(*) FROM {table_name}")).scalar()
                counts[table_name] = count
            except Exception as e:
                logger.warning(f"Could not count {table_name}: {e}")
                counts[table_name] = 0
        
        if products_count == 0:
            return {
                "message": "Database is already clean - no products to delete",
                "counts": counts
            }
        
        # Step 3: Clear referencing tables first (in reverse dependency order)
        for table_name, column_name in referencing_tables:
            try:
                result = db.execute(text(f"DELETE FROM {table_name}"))
                deleted_count = result.rowcount
                deleted_counts[table_name] = deleted_count
                logger.info(f"Deleted {deleted_count} records from {table_name}")
            except Exception as e:
                logger.error(f"Failed to delete from {table_name}: {e}")
                # Continue with other tables, don't fail completely
                deleted_counts[table_name] = 0
        
        # Step 4: Clear products (main table)
        prod_result = db.execute(text("DELETE FROM products"))
        prod_deleted = prod_result.rowcount
        deleted_counts["products"] = prod_deleted
        
        # Step 5: Reset auto-increment sequences
        try:
            db.execute(text("ALTER SEQUENCE products_id_seq RESTART WITH 1"))
            # Reset sequences for referencing tables too
            for table_name, _ in referencing_tables:
                try:
                    db.execute(text(f"ALTER SEQUENCE {table_name}_id_seq RESTART WITH 1"))
                except:
                    pass  # Sequence might not exist
        except Exception as e:
            logger.warning(f"Could not reset sequences: {e}")
        
        # Commit all changes
        db.commit()
        
        logger.info(f"Successfully deleted {prod_deleted} products and related data")
        
        return {
            "message": "ALL PRODUCTS AND RELATED DATA CLEARED SUCCESSFULLY",
            "deleted_counts": deleted_counts,
            "original_counts": counts,
            "tables_processed": [table for table, _ in referencing_tables] + ["products"]
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
        # Find all tables that reference products table
        foreign_key_query = text("""
            SELECT 
                tc.table_name, 
                kcu.column_name
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' 
              AND ccu.table_name='products'
              AND tc.table_schema = 'public'
        """)
        
        foreign_key_results = db.execute(foreign_key_query).fetchall()
        referencing_tables = [(row[0], row[1]) for row in foreign_key_results]
        
        # Get product count
        products_count = db.execute(text("SELECT COUNT(*) FROM products")).scalar()
        
        counts = {"products": products_count}
        
        # Get counts for all referencing tables
        for table_name, column_name in referencing_tables:
            try:
                count = db.execute(text(f"SELECT COUNT(*) FROM {table_name}")).scalar()
                counts[table_name] = count
            except Exception as e:
                logger.warning(f"Could not count {table_name}: {e}")
                counts[table_name] = 0
        
        return {
            "counts": counts,
            "referencing_tables": [table for table, _ in referencing_tables],
            "status": "clean" if products_count == 0 else f"{products_count} products found"
        }
        
    except Exception as e:
        logger.error(f"Failed to get counts: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get counts: {str(e)}"
        )

@router.post("/update-categories")
async def update_categories(db: Session = Depends(get_db)):
    """
    Update categories to match frontend expectations
    """
    try:
        logger.info("🔄 Updating categories to match frontend...")
        
        # Clear existing categories first
        db.execute(text("DELETE FROM categories"))
        
        # Frontend categories (matching AddProduct.jsx)
        categories = [
            {"id": 1, "name": "Electronics", "description": "Electronic devices and gadgets"},
            {"id": 2, "name": "Fashion", "description": "Clothing and accessories"},
            {"id": 3, "name": "Home & Garden", "description": "Home improvement and gardening items"},
            {"id": 4, "name": "Beauty & Personal Care", "description": "Beauty and personal care products"},
            {"id": 5, "name": "Sports & Outdoors", "description": "Sports equipment and outdoor gear"},
            {"id": 6, "name": "Books & Media", "description": "Books, movies, music and media"},
            {"id": 7, "name": "Food & Beverages", "description": "Food items and beverages"},
            {"id": 8, "name": "Automotive", "description": "Car parts and automotive accessories"},
            {"id": 9, "name": "Health & Wellness", "description": "Health and wellness products"},
            {"id": 10, "name": "Baby & Kids", "description": "Baby and children's products"}
        ]
        
        # Insert categories
        for cat_data in categories:
            category = Category(
                id=cat_data["id"],
                name=cat_data["name"],
                description=cat_data["description"]
            )
            db.add(category)
        
        # Reset sequence to start from 11
        db.execute(text("ALTER SEQUENCE categories_id_seq RESTART WITH 11"))
        
        db.commit()
        
        return {
            "status": "success",
            "message": "Categories updated to match frontend",
            "categories": categories
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update categories: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update categories: {str(e)}"
        )
