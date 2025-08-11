from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db
from app.models.categories import Category
from app.models.product_images import ProductImage
from pydantic import BaseModel
import logging

router = APIRouter(prefix="/admin", tags=["Admin"])
logger = logging.getLogger(__name__)

class UpdateProductImageRequest(BaseModel):
    product_id: int
    image_url: str

@router.post("/update-product-image")
async def update_product_image(request: UpdateProductImageRequest, db: Session = Depends(get_db)):
    """
    Update the image URL for a specific product
    """
    try:
        # Find the product image record
        product_image = db.query(ProductImage).filter(ProductImage.product_id == request.product_id).first()
        
        if not product_image:
            raise HTTPException(status_code=404, detail=f"Product image not found for product_id {request.product_id}")
        
        # Update the image URL
        product_image.image_url = request.image_url
        db.commit()
        
        return {
            "status": "success",
            "message": f"Image URL updated for product {request.product_id}",
            "product_id": request.product_id,
            "image_url": request.image_url
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating product image: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating product image: {str(e)}")

@router.delete("/delete-product/{product_id}")
async def delete_single_product(product_id: int, db: Session = Depends(get_db)):
    """
    Delete a specific product and all its related data by ID
    """
    try:
        from app.models.product import Product
        from app.models.product_images import ProductImage
        from app.models.sustainability_ratings import SustainabilityRating
        
        # Check if product exists
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with ID {product_id} not found")
        
        product_name = product.name
        
        # Delete related records first (foreign key constraints)
        # Delete sustainability ratings for this specific product
        ratings_deleted = db.query(SustainabilityRating).filter(SustainabilityRating.product_id == product_id).delete(synchronize_session='fetch')
        
        # Delete product images for this specific product
        images_deleted = db.query(ProductImage).filter(ProductImage.product_id == product_id).delete(synchronize_session='fetch')
        
        # Delete the product itself
        products_deleted = db.query(Product).filter(Product.id == product_id).delete(synchronize_session='fetch')
        
        db.commit()
        
        logger.info(f"Successfully deleted product {product_id}: {product_name}")
        
        return {
            "status": "success",
            "message": f"Product '{product_name}' deleted successfully",
            "product_id": product_id,
            "deleted_counts": {
                "products": products_deleted,
                "product_images": images_deleted,
                "sustainability_ratings": ratings_deleted
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting product {product_id}: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting product: {str(e)}")

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

@router.post("/add-sample-products")
async def add_sample_products(db: Session = Depends(get_db)):
    """
    Add 20 eco-friendly sample products with direct image URLs (no S3 upload needed)
    """
    try:
        from ..models.product import Product
        from ..models.product_images import ProductImage
        from ..models.sustainability_ratings import SustainabilityRating
        from ..models.sustainability_type import SustainabilityType
        from decimal import Decimal
        
        logger.info("🌱 Adding 20 eco-friendly sample products...")
        
        # Sample eco-friendly products with ZAR pricing and clean image URLs
        products_data = [
            {
                "name": "Bamboo Coffee Mug with Lid",
                "description": "Sustainable bamboo coffee mug with silicone lid. Perfect for hot beverages on the go. 100% biodegradable and reusable.",
                "price": 185.99,
                "category_id": 3,  # Home & Garden
                "stock_quantity": 45,
                "image_urls": ["https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500"],
                "sustainability": {"energy_efficiency": 85, "carbon_footprint": 90, "recyclability": 95, "durability": 80, "material_sustainability": 95}
            },
            {
                "name": "Solar Portable Phone Charger",
                "description": "Eco-friendly solar-powered portable charger with 10,000mAh capacity. Charges phones using renewable solar energy.",
                "price": 449.99,
                "category_id": 1,  # Electronics
                "stock_quantity": 25,
                "image_urls": ["https://images.unsplash.com/photo-1593642532842-98d0fd5ebc1a?w=500"],
                "sustainability": {"energy_efficiency": 95, "carbon_footprint": 85, "recyclability": 70, "durability": 90, "material_sustainability": 80}
            },
            {
                "name": "Recycled Ocean Plastic Phone Case",
                "description": "Protective phone case made from 100% recycled ocean plastic. Available for iPhone and Samsung models.",
                "price": 125.50,
                "category_id": 1,  # Electronics
                "stock_quantity": 60,
                "image_urls": ["https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500"],
                "sustainability": {"energy_efficiency": 75, "carbon_footprint": 88, "recyclability": 100, "durability": 85, "material_sustainability": 95}
            },
            {
                "name": "Bamboo Kitchen Utensil Set",
                "description": "Complete set of bamboo kitchen utensils including spoons, forks, and chopsticks. Naturally antibacterial.",
                "price": 89.99,
                "category_id": 3,  # Home & Garden
                "stock_quantity": 35,
                "image_urls": ["https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500"],
                "sustainability": {"energy_efficiency": 80, "carbon_footprint": 92, "recyclability": 100, "durability": 85, "material_sustainability": 95}
            },
            {
                "name": "Energy-Efficient LED Smart Bulb",
                "description": "WiFi-enabled LED smart bulb with 90% energy savings. Adjustable brightness and color temperature.",
                "price": 159.99,
                "category_id": 1,  # Electronics
                "stock_quantity": 50,
                "image_urls": ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"],
                "sustainability": {"energy_efficiency": 95, "carbon_footprint": 85, "recyclability": 75, "durability": 90, "material_sustainability": 80}
            },
            {
                "name": "Recycled Paper Notebook Set",
                "description": "Set of 3 notebooks made from 100% recycled paper. Perfect for eco-conscious note-taking and journaling.",
                "price": 65.99,
                "category_id": 6,  # Books & Media
                "stock_quantity": 40,
                "image_urls": ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500"],
                "sustainability": {"energy_efficiency": 70, "carbon_footprint": 85, "recyclability": 100, "durability": 75, "material_sustainability": 95}
            },
            {
                "name": "Stainless Steel Water Bottle",
                "description": "Double-wall insulated stainless steel water bottle. Keeps drinks cold for 24hrs or hot for 12hrs. BPA-free.",
                "price": 275.00,
                "category_id": 3,  # Home & Garden
                "stock_quantity": 30,
                "image_urls": ["https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=500"],
                "sustainability": {"energy_efficiency": 85, "carbon_footprint": 80, "recyclability": 90, "durability": 95, "material_sustainability": 90}
            },
            {
                "name": "Organic Cotton Shopping Bags (3-Pack)",
                "description": "Set of 3 reusable shopping bags made from organic cotton. Strong, washable, and plastic-free.",
                "price": 99.99,
                "category_id": 3,  # Home & Garden
                "stock_quantity": 55,
                "image_urls": ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500"],
                "sustainability": {"energy_efficiency": 75, "carbon_footprint": 90, "recyclability": 95, "durability": 85, "material_sustainability": 95}
            },
            {
                "name": "Bamboo Toothbrush Set (4-Pack)",
                "description": "Biodegradable bamboo toothbrushes with soft bristles. Eco-friendly alternative to plastic toothbrushes.",
                "price": 45.99,
                "category_id": 4,  # Beauty & Personal Care
                "stock_quantity": 70,
                "image_urls": ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500"],
                "sustainability": {"energy_efficiency": 80, "carbon_footprint": 95, "recyclability": 100, "durability": 70, "material_sustainability": 98}
            },
            {
                "name": "Solar Garden Light Set",
                "description": "Set of 6 solar-powered garden lights. Automatic on/off with built-in light sensor. Weather-resistant design.",
                "price": 329.99,
                "category_id": 3,  # Home & Garden
                "stock_quantity": 20,
                "image_urls": ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500"],
                "sustainability": {"energy_efficiency": 100, "carbon_footprint": 90, "recyclability": 80, "durability": 85, "material_sustainability": 85}
            },
            {
                "name": "Eco-Friendly Laundry Detergent",
                "description": "Plant-based laundry detergent in concentrated form. Biodegradable formula safe for sensitive skin.",
                "price": 89.50,
                "category_id": 3,  # Home & Garden
                "stock_quantity": 25,
                "image_urls": ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500"],
                "sustainability": {"energy_efficiency": 75, "carbon_footprint": 85, "recyclability": 90, "durability": 80, "material_sustainability": 95}
            },
            {
                "name": "Cork Yoga Mat",
                "description": "Natural cork yoga mat with rubber base. Non-slip, antimicrobial, and sustainably harvested materials.",
                "price": 549.99,
                "category_id": 5,  # Sports & Outdoors
                "stock_quantity": 15,
                "image_urls": ["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500"],
                "sustainability": {"energy_efficiency": 80, "carbon_footprint": 88, "recyclability": 85, "durability": 90, "material_sustainability": 95}
            },
            {
                "name": "Beeswax Food Wrap Set",
                "description": "Reusable beeswax wraps for food storage. Natural alternative to plastic wrap. Set includes 3 sizes.",
                "price": 125.99,
                "category_id": 3,  # Home & Garden
                "stock_quantity": 35,
                "image_urls": ["https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500"],
                "sustainability": {"energy_efficiency": 85, "carbon_footprint": 92, "recyclability": 100, "durability": 80, "material_sustainability": 98}
            },
            {
                "name": "Wooden Desk Organizer",
                "description": "Handcrafted wooden desk organizer made from sustainably sourced bamboo. Perfect for office organization.",
                "price": 199.99,
                "category_id": 3,  # Home & Garden
                "stock_quantity": 22,
                "image_urls": ["https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500"],
                "sustainability": {"energy_efficiency": 75, "carbon_footprint": 85, "recyclability": 90, "durability": 95, "material_sustainability": 90}
            },
            {
                "name": "Biodegradable Phone Screen Protector",
                "description": "Plant-based biodegradable screen protector. Crystal clear protection that decomposes naturally.",
                "price": 75.50,
                "category_id": 1,  # Electronics
                "stock_quantity": 80,
                "image_urls": ["https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=500"],
                "sustainability": {"energy_efficiency": 70, "carbon_footprint": 80, "recyclability": 100, "durability": 85, "material_sustainability": 95}
            },
            {
                "name": "Organic Cotton T-Shirt",
                "description": "Soft organic cotton t-shirt made with GOTS certified organic cotton. Available in multiple colors.",
                "price": 189.99,
                "category_id": 2,  # Fashion
                "stock_quantity": 45,
                "image_urls": ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500"],
                "sustainability": {"energy_efficiency": 80, "carbon_footprint": 85, "recyclability": 90, "durability": 85, "material_sustainability": 95}
            },
            {
                "name": "Solar-Powered Bluetooth Speaker",
                "description": "Portable Bluetooth speaker with built-in solar panel. Waterproof design perfect for outdoor activities.",
                "price": 399.99,
                "category_id": 1,  # Electronics
                "stock_quantity": 18,
                "image_urls": ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500"],
                "sustainability": {"energy_efficiency": 95, "carbon_footprint": 82, "recyclability": 75, "durability": 90, "material_sustainability": 80}
            },
            {
                "name": "Compostable Phone Case",
                "description": "100% compostable phone case made from plant-based materials. Breaks down in 6 months in compost.",
                "price": 95.99,
                "category_id": 1,  # Electronics
                "stock_quantity": 65,
                "image_urls": ["https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500"],
                "sustainability": {"energy_efficiency": 75, "carbon_footprint": 90, "recyclability": 100, "durability": 75, "material_sustainability": 100}
            },
            {
                "name": "Bamboo Cutting Board Set",
                "description": "Set of 3 bamboo cutting boards in different sizes. Naturally antimicrobial and knife-friendly surface.",
                "price": 149.99,
                "category_id": 3,  # Home & Garden
                "stock_quantity": 28,
                "image_urls": ["https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500"],
                "sustainability": {"energy_efficiency": 80, "carbon_footprint": 90, "recyclability": 95, "durability": 90, "material_sustainability": 95}
            },
            {
                "name": "Recycled Plastic Outdoor Furniture",
                "description": "Weather-resistant outdoor chair made from 100% recycled plastic bottles. UV-resistant and maintenance-free.",
                "price": 899.99,
                "category_id": 3,  # Home & Garden
                "stock_quantity": 8,
                "image_urls": ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500"],
                "sustainability": {"energy_efficiency": 85, "carbon_footprint": 85, "recyclability": 100, "durability": 95, "material_sustainability": 95}
            }
        ]
        
        # Get sustainability type mappings
        sustainability_types = db.query(SustainabilityType).all()
        type_map = {}
        for st in sustainability_types:
            normalized_name = st.type_name.lower().replace(' ', '_')
            type_map[normalized_name] = st.id
        
        products_created = 0
        total_images = 0
        total_ratings = 0
        
        for product_data in products_data:
            # Create product
            new_product = Product(
                name=product_data["name"],
                description=product_data["description"],
                price=Decimal(str(product_data["price"])),
                quantity=product_data["stock_quantity"],
                category_id=product_data["category_id"],
                retailer_id=3,  # Default retailer
                in_stock=True
            )
            
            db.add(new_product)
            db.flush()  # Get product ID
            
            # Add images (direct URLs, no S3 upload)
            for image_url in product_data["image_urls"]:
                product_image = ProductImage(
                    product_id=new_product.id,
                    image_url=image_url
                )
                db.add(product_image)
                total_images += 1
            
            # Add sustainability ratings
            for metric_name, value in product_data["sustainability"].items():
                # Find matching sustainability type
                type_id = None
                if metric_name in type_map:
                    type_id = type_map[metric_name]
                else:
                    # Try alternate matching strategies
                    for st in sustainability_types:
                        if metric_name.lower() in st.type_name.lower():
                            type_id = st.id
                            break
                
                if type_id:
                    new_rating = SustainabilityRating(
                        product_id=new_product.id,
                        type=type_id,
                        value=value,
                        verification=False
                    )
                    db.add(new_rating)
                    total_ratings += 1
            
            products_created += 1
            logger.info(f"✅ Created product: {product_data['name']}")
        
        db.commit()
        
        return {
            "status": "success",
            "message": f"Successfully added {products_created} eco-friendly products",
            "products_created": products_created,
            "images_added": total_images,
            "sustainability_ratings_added": total_ratings,
            "note": "Images are direct URLs from Unsplash - no S3 storage needed"
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to add sample products: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to add sample products: {str(e)}"
        )
