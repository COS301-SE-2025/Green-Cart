"""
Admin endpoint to clear all products - add this to your admin routes
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..db.session import get_db

@router.post("/clear-all-products")
async def clear_all_products(db: Session = Depends(get_db)):
    """
    DANGER: Clear all products and related data from database
    This endpoint should only be accessible to admins!
    """
    try:
        print("🗑️  Starting product deletion process...")
        
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
            print(f"Note: Could not reset sequences: {e}")
        
        # Commit all changes
        db.commit()
        
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
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get counts: {str(e)}"
        )
