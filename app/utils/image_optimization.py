"""
Database optimization utilities for base64 image storage
"""

from sqlalchemy import text
from app.db.session import SessionLocal

def optimize_image_queries():
    """
    Database optimization suggestions for base64 image storage
    """
    optimizations = {
        "indexes": [
            "CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);",
            "CREATE INDEX IF NOT EXISTS idx_products_retailer_id ON products(retailer_id);",
            "CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);"
        ],
        
        "selective_queries": """
        -- When fetching product lists, exclude images to improve performance
        SELECT 
            p.id, p.name, p.price, p.quantity, p.brand,
            (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id LIMIT 1) as thumbnail
        FROM products p 
        WHERE p.retailer_id = :retailer_id;
        
        -- Only fetch full images when specifically needed
        SELECT image_url FROM product_images WHERE product_id = :product_id;
        """,
        
        "pagination": """
        -- Use pagination for large datasets
        SELECT * FROM products 
        WHERE retailer_id = :retailer_id
        ORDER BY created_at DESC
        LIMIT :limit OFFSET :offset;
        """
    }
    
    return optimizations

def get_product_with_thumbnail_only(db, retailer_id: int):
    """
    Fetch products with only the first image as thumbnail
    Optimized for listing pages
    """
    query = text("""
        SELECT 
            p.id, p.name, p.description, p.price, p.quantity, 
            p.brand, p.category_id, p.retailer_id, p.created_at,
            pi.image_url as thumbnail
        FROM products p
        LEFT JOIN (
            SELECT DISTINCT ON (product_id) product_id, image_url 
            FROM product_images 
            ORDER BY product_id, id
        ) pi ON p.id = pi.product_id
        WHERE p.retailer_id = :retailer_id
        ORDER BY p.created_at DESC
    """)
    
    result = db.execute(query, {"retailer_id": retailer_id})
    return result.fetchall()

def get_product_images_only(db, product_id: int):
    """
    Fetch only images for a specific product
    Used when full image gallery is needed
    """
    query = text("""
        SELECT image_url 
        FROM product_images 
        WHERE product_id = :product_id
        ORDER BY id
    """)
    
    result = db.execute(query, {"product_id": product_id})
    return [row[0] for row in result.fetchall()]

# Usage recommendations:
"""
1. For product listings: Use get_product_with_thumbnail_only()
2. For product details: Load product data first, then images separately
3. For admin dashboards: Implement pagination
4. For mobile apps: Consider thumbnail-only views
5. For search: Index product names/descriptions, not images
"""
