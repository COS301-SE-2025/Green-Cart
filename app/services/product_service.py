from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_
from app.models.product import Product
from app.models.categories import Category
from app.models.product_images import ProductImage
from app.models.sustainability_ratings import SustainabilityRating
from app.models.sustainability_type import SustainabilityType
from app.services.sustainabilityRatings_service import fetchSustainabilityRatings
from fastapi import HTTPException
from functools import lru_cache
import logging

logger = logging.getLogger(__name__)

@lru_cache(maxsize=128)
def get_category_id_by_name(category_name: str, db_session_id: str):
    """Cached category lookup"""
    # Note: In production, you'd use Redis or proper caching
    pass

def get_all_products(db: Session):
    return db.query(Product).all()

def fetchProductImages(db: Session, product_id: int, limit: int = 1):
    """Optimized image fetching with better query"""
    query = db.query(ProductImage).filter(ProductImage.product_id == product_id)
    
    if limit == -1:
        return query.all()
    elif limit < 1:
        limit = 1
    
    return query.limit(limit).all()

def fetchAllProducts(request, db: Session):
    """Optimized product fetching with bulk operations"""
    
    # Start with base query with eager loading
    products_query = db.query(Product).options(
        joinedload(Product.images) if hasattr(Product, 'images') else None
    )
    
    # Apply filters
    if request.get("filter", {}) is not None:
        filter_data = request.get("filter", {})
        filters = []
        
        if filter_data.get("category", ""):
            category = filter_data.get("category")
            category_obj = db.query(Category).filter(Category.name == category).first()
            
            if category_obj is None:
                raise HTTPException(status_code=404, detail="Category not found")
            filters.append(Product.category_id == category_obj.id)
        
        if filter_data.get("price_min"):
            filters.append(Product.price >= filter_data.get("price_min"))
        
        if filter_data.get("price_max"):
            filters.append(Product.price <= filter_data.get("price_max"))
        
        if filter_data.get("in_stock") is not None:
            filters.append(Product.in_stock == filter_data.get("in_stock"))
        
        if filters:
            products_query = products_query.filter(and_(*filters))

    # Apply sorting
    if request.get("sort", []):
        sort = request.get("sort", [])
        valid_sort_fields = ["id", "name", "description", "price", "in_stock", 
                           "quantity", "brand", "category_id", "retailer_id", "created_at"]
        
        if sort[0] in valid_sort_fields:
            if sort[1] == "ASC":
                products_query = products_query.order_by(getattr(Product, sort[0]).asc())
            elif sort[1] == "DESC":
                products_query = products_query.order_by(getattr(Product, sort[0]).desc())
            else:
                raise HTTPException(status_code=400, detail="Invalid sort order")
        else:
            raise HTTPException(status_code=400, detail="Invalid sort field")

    # Pagination
    fromItem = request.get("fromItem", 0)
    count = request.get("count", 20)  # Increased default for better UX

    if fromItem < 0:
        raise HTTPException(status_code=400, detail="fromItem must be >= 0")
    if count <= 0 or count > 100:  # Limit max count
        raise HTTPException(status_code=400, detail="count must be between 1-100")

    # Execute query with pagination
    products = products_query.offset(fromItem).limit(count).all()
    
    if not products:
        return {
            "status": 200,
            "message": "No products found",
            "data": [],
            "images": [],
            "rating": []
        }
    
    # Bulk fetch all product IDs for images and ratings
    product_ids = [product.id for product in products]
    
    # Bulk fetch images - get first image for each product
    image_query = db.query(ProductImage).filter(
        ProductImage.product_id.in_(product_ids)
    ).order_by(ProductImage.product_id, ProductImage.id).all()
    
    # Create image mapping
    image_map = {}
    for img in image_query:
        if img.product_id not in image_map:
            image_map[img.product_id] = img.image_url
    
    # Bulk fetch sustainability ratings
    rating_query = db.query(SustainabilityRating).filter(
        SustainabilityRating.product_id.in_(product_ids)
    ).all()
    
    # Calculate average ratings for each product
    rating_map = {}
    rating_counts = {}
    
    for rating in rating_query:
        if rating.product_id not in rating_map:
            rating_map[rating.product_id] = 0
            rating_counts[rating.product_id] = 0
        rating_map[rating.product_id] += float(rating.value)
        rating_counts[rating.product_id] += 1
    
    # Calculate averages
    for product_id in rating_map:
        if rating_counts[product_id] > 0:
            rating_map[product_id] = rating_map[product_id] / rating_counts[product_id]
    
    # Build response arrays
    images = []
    ratings = []
    
    for product in products:
        images.append(image_map.get(product.id, "https://via.placeholder.com/300x300/7BB540/FFFFFF?text=Product"))
        ratings.append(round(rating_map.get(product.id, 0), 1))
    
    logger.info(f"Fetched {len(products)} products with bulk operations")
    
    return {
        "status": 200,
        "message": "Success",
        "data": products,
        "images": images,
        "rating": ratings,
        "total_count": len(products)  # Useful for frontend pagination
    }

def fetchProduct(request, db: Session):
    """Optimized single product fetch with eager loading"""
    product_id = request.get("product_id")
    
    # Eager load related data
    product = db.query(Product).filter(Product.id == product_id).first()
    
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Bulk fetch images
    images = db.query(ProductImage).filter(
        ProductImage.product_id == product_id
    ).all()
    
    image_urls = [img.image_url for img in images]
    if not image_urls:
        image_urls = ["https://via.placeholder.com/300x300/7BB540/FFFFFF?text=Product"]
    
    # Get sustainability data efficiently
    req = {"product_id": product.id}
    sustainability_data = fetchSustainabilityRatings(req, db)
    
    return {
        "status": 200,
        "message": "Success",
        "data": product,
        "images": image_urls,
        "sustainability": sustainability_data
    }

def searchProducts(request, db: Session):
    """Optimized product search with full-text capabilities"""
    search_term = request.get("search", "")
    
    # Use efficient text search
    query = db.query(Product)
    
    if search_term:
        search_filter = or_(
            Product.name.ilike(f"%{search_term}%"),
            Product.description.ilike(f"%{search_term}%"),
            Product.brand.ilike(f"%{search_term}%")
        )
        query = query.filter(search_filter)
    
    # Apply same filtering logic as fetchAllProducts
    if request.get("filter", {}):
        filter_data = request.get("filter", {})
        filters = []
        
        if filter_data.get("category", ""):
            category = filter_data.get("category")
            category_obj = db.query(Category).filter(Category.name == category).first()
            if category_obj:
                filters.append(Product.category_id == category_obj.id)
        
        if filters:
            query = query.filter(and_(*filters))
    
    # Apply sorting
    if request.get("sort", []):
        sort = request.get("sort", [])
        valid_sort_fields = ["id", "name", "description", "price", "in_stock", 
                           "quantity", "brand", "category_id", "retailer_id", "created_at"]
        
        if sort[0] in valid_sort_fields:
            if sort[1] == "ASC":
                query = query.order_by(getattr(Product, sort[0]).asc())
            elif sort[1] == "DESC":
                query = query.order_by(getattr(Product, sort[0]).desc())
            else:
                raise HTTPException(status_code=400, detail="Invalid sort order")
    
    # Pagination
    fromItem = request.get("fromItem", 0)
    count = request.get("count", 20)
    
    if fromItem < 0:
        raise HTTPException(status_code=400, detail="fromItem must be >= 0")
    if count <= 0 or count > 100:
        raise HTTPException(status_code=400, detail="count must be between 1-100")
    
    products = query.offset(fromItem).limit(count).all()
    
    if not products:
        return {
            "status": 200,
            "message": "No products found",
            "data": [],
            "images": [],
            "rating": []
        }
    
    # Use same bulk processing as fetchAllProducts
    product_ids = [product.id for product in products]
    
    # Bulk fetch images
    image_query = db.query(ProductImage).filter(
        ProductImage.product_id.in_(product_ids)
    ).order_by(ProductImage.product_id, ProductImage.id).all()
    
    image_map = {}
    for img in image_query:
        if img.product_id not in image_map:
            image_map[img.product_id] = img.image_url
    
    # Bulk fetch ratings
    rating_query = db.query(SustainabilityRating).filter(
        SustainabilityRating.product_id.in_(product_ids)
    ).all()
    
    rating_map = {}
    rating_counts = {}
    
    for rating in rating_query:
        if rating.product_id not in rating_map:
            rating_map[rating.product_id] = 0
            rating_counts[rating.product_id] = 0
        rating_map[rating.product_id] += float(rating.value)
        rating_counts[rating.product_id] += 1
    
    for product_id in rating_map:
        if rating_counts[product_id] > 0:
            rating_map[product_id] = rating_map[product_id] / rating_counts[product_id]
    
    # Build response
    images = []
    ratings = []
    
    for product in products:
        images.append(image_map.get(product.id, "https://via.placeholder.com/300x300/7BB540/FFFFFF?text=Product"))
        ratings.append(round(rating_map.get(product.id, 0), 1))
    
    return {
        "status": 200,
        "message": "Success",
        "data": products,
        "images": images,
        "rating": ratings,
        "search_term": search_term,
        "total_count": len(products)
    }
