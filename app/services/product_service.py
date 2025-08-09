from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_
from app.models.product import Product
from app.models.categories import Category
from app.models.product_images import ProductImage
from app.models.sustainability_ratings import SustainabilityRating
from app.models.sustainability_type import SustainabilityType
from app.models.retailer_information import RetailerInformation
from app.services.sustainabilityRatings_service import fetchSustainabilityRatings
from fastapi import HTTPException
from functools import lru_cache
import logging

logger = logging.getLogger(__name__)

def ensure_valid_image_url(url):
    """Ensure image URL is never None"""
    if url is None:
        logger.warning("Converting None image URL to placeholder")
        return "https://via.placeholder.com/300x300/7BB540/FFFFFF?text=Product"
    return url

@lru_cache(maxsize=128)
def get_category_id_by_name(category_name: str, db_session_id: str):
    pass

def get_all_products(db: Session):
    return db.query(Product).all()

def fetchProductImages(db: Session, product_id: int, limit: int = 1):
    query = db.query(ProductImage).filter(ProductImage.product_id == product_id)
    if limit == -1:
        return query.all()
    elif limit < 1:
        limit = 1
    return query.limit(limit).all()

def fetchAllProducts(request, db: Session):
    from app.utilities.stock_utils import sync_stock_status
    
    products_query = db.query(Product) if not hasattr(Product, 'images') else db.query(Product).options(joinedload(Product.images))

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

    fromItem = request.get("fromItem", 0)
    count = request.get("count", 20)

    if fromItem < 0:
        raise HTTPException(status_code=400, detail="fromItem must be >= 0")
    if count <= 0 or count > 100:
        raise HTTPException(status_code=400, detail="count must be between 1-100")

    products = products_query.offset(fromItem).limit(count).all()

    if not products:
        return {
            "status": 200,
            "message": "No products found",
            "data": [],
            "images": [],
            "rating": []
        }

    # Sync stock status for all fetched products to ensure consistency
    product_ids = [product.id for product in products]
    for product_id in product_ids:
        sync_stock_status(db, product_id)
    
    # Refresh products after sync
    for product in products:
        db.refresh(product)

    image_query = db.query(ProductImage).filter(
        ProductImage.product_id.in_(product_ids)
    ).order_by(ProductImage.product_id, ProductImage.id).all()

    image_map = {}
    for img in image_query:
        if img.product_id not in image_map:
            # Ensure we never store None values - use placeholder if image_url is None
            image_url = img.image_url or "https://via.placeholder.com/300x300/7BB540/FFFFFF?text=Product"
            image_map[img.product_id] = image_url

    # Calculate proper sustainability ratings using the weighted algorithm
    images = []
    ratings = []

    for product in products:
        # Ensure we never add None to images list - always use placeholder if None
        image_url = image_map.get(product.id)
        logger.info(f"fetchAllProducts - Product {product.id}: raw image_url = {image_url}")
        if image_url is None:
            image_url = "https://via.placeholder.com/300x300/7BB540/FFFFFF?text=Product"
            logger.warning(f"fetchAllProducts - Product {product.id}: Using placeholder image due to None value")
        logger.info(f"fetchAllProducts - Product {product.id}: final image_url = {image_url}")
        images.append(image_url)
        
        # Use the proper sustainability rating calculation
        try:
            sustainability_request = {"product_id": product.id}
            sustainability_data = fetchSustainabilityRatings(sustainability_request, db)
            rating = sustainability_data.get("rating", 0.0)
            ratings.append(rating)
        except Exception as e:
            logger.warning(f"Error calculating sustainability rating for product {product.id}: {e}")
            ratings.append(0.0)
    
    # Final validation - ensure no None values in images list
    for i, img in enumerate(images):
        if img is None:
            logger.error(f"fetchAllProducts - CRITICAL: None value found at images[{i}], replacing with placeholder")
            images[i] = "https://via.placeholder.com/300x300/7BB540/FFFFFF?text=Product"

    logger.info(f"Fetched {len(products)} products with bulk operations")

    # Log final images list for debugging
    logger.info(f"Final images list: {images}")
    
    # Use helper function to ensure all images are valid
    images = [ensure_valid_image_url(img) for img in images]
    logger.info(f"Validated images list: {images}")

    return {
        "status": 200,
        "message": "Success",
        "data": products,
        "images": images,
        "rating": ratings,
        "total_count": len(products)
    }

def fetchProduct(request, db: Session):
    from app.utilities.stock_utils import sync_stock_status
    
    product_id = request.get("product_id")
    
    # Join with category and retailer information tables to get names
    product_query = db.query(Product).options(
        joinedload(Product.retailer_information)
    ).filter(Product.id == product_id)
    
    product = product_query.first()

    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    # Sync stock status for this product to ensure data consistency
    sync_stock_status(db, product.id)
    db.refresh(product)

    # Get category name
    category_name = None
    if product.category_id:
        logger.info(f"Product {product_id} has category_id: {product.category_id}")
        category = db.query(Category).filter(Category.id == product.category_id).first()
        if category:
            category_name = category.name
            logger.info(f"Found category: {category_name}")
        else:
            category_name = "Unknown Category"
            logger.warning(f"Category with ID {product.category_id} not found in database")
    else:
        logger.warning(f"Product {product_id} has no category_id")
        category_name = "Uncategorized"

    # Get retailer name
    retailer_name = None
    if product.retailer_id and product.retailer_information:
        retailer_name = product.retailer_information.name
        logger.info(f"Found retailer via relationship: {retailer_name}")
    elif product.retailer_id:
        # Fallback in case relationship didn't load
        from app.models.retailer_information import RetailerInformation
        retailer = db.query(RetailerInformation).filter(RetailerInformation.id == product.retailer_id).first()
        if retailer:
            retailer_name = retailer.name
            logger.info(f"Found retailer via direct query: {retailer_name}")
        else:
            retailer_name = "Unknown Retailer"
            logger.warning(f"Retailer with ID {product.retailer_id} not found in database")
    else:
        logger.warning(f"Product {product_id} has no retailer_id")
        retailer_name = "No retailer specified"

    images = db.query(ProductImage).filter(
        ProductImage.product_id == product_id
    ).all()

    # Filter out None values and ensure we always have valid image URLs
    image_urls = [img.image_url for img in images if img.image_url is not None]
    if not image_urls:
        image_urls = ["https://via.placeholder.com/300x300/7BB540/FFFFFF?text=Product"]

    req = {"product_id": product.id}
    sustainability_data = fetchSustainabilityRatings(req, db)

    # Calculate units sold
    from app.models.orders import Order
    from app.models.cart_item import CartItem
    from app.models.cart import Cart
    # Join CartItem -> Cart -> Order, filter for delivered orders, sum quantity for this product
    from sqlalchemy import select, join
    valid_states = [
        "Preparing Order", "Ready for Delivery", "In Transit", "Delivered"
    ]
    valid_orders = db.query(Order.id).filter(Order.state.in_(valid_states)).subquery()
    valid_carts = db.query(Cart.id).filter(Cart.id.in_(db.query(Order.cart_id).filter(Order.state.in_(valid_states)))).subquery()
    units_sold = db.query(func.sum(CartItem.quantity)).filter(
        CartItem.product_id == product.id,
        CartItem.cart_id.in_(valid_carts)
    ).scalar() or 0

    # Calculate revenue
    price = float(product.price) if product and product.price else 0.0
    revenue = units_sold * price

    logger.info(f"Final response for product {product_id}: category_name='{category_name}', retailer_name='{retailer_name}', quantity={product.quantity}, in_stock={product.in_stock}")

    return {
        "status": 200,
        "message": "Success",
        "data": product,
        "images": image_urls,
        "sustainability": sustainability_data,
        "units_sold": units_sold,
        "revenue": revenue,
        "category_name": category_name,
        "retailer_name": retailer_name
    }

def searchProducts(request, db: Session):
    search_term = request.get("search", "")
    query = db.query(Product)

    if search_term:
        search_filter = or_(
            Product.name.ilike(f"%{search_term}%"),
            Product.description.ilike(f"%{search_term}%"),
            Product.brand.ilike(f"%{search_term}%")
        )
        query = query.filter(search_filter)

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

    product_ids = [product.id for product in products]

    image_query = db.query(ProductImage).filter(
        ProductImage.product_id.in_(product_ids)
    ).order_by(ProductImage.product_id, ProductImage.id).all()

    image_map = {}
    for img in image_query:
        if img.product_id not in image_map:
            # Ensure we never store None values - use placeholder if image_url is None
            image_url = img.image_url or "https://via.placeholder.com/300x300/7BB540/FFFFFF?text=Product"
            image_map[img.product_id] = image_url

    # Calculate proper sustainability ratings using the weighted algorithm
    images = []
    ratings = []

    for product in products:
        # Ensure we never add None to images list - always use placeholder if None
        image_url = image_map.get(product.id)
        logger.info(f"searchProducts - Product {product.id}: raw image_url = {image_url}")
        if image_url is None:
            image_url = "https://via.placeholder.com/300x300/7BB540/FFFFFF?text=Product"
            logger.warning(f"searchProducts - Product {product.id}: Using placeholder image due to None value")
        logger.info(f"searchProducts - Product {product.id}: final image_url = {image_url}")
        images.append(image_url)
        
        # Use the proper sustainability rating calculation
        try:
            sustainability_request = {"product_id": product.id}
            sustainability_data = fetchSustainabilityRatings(sustainability_request, db)
            rating = sustainability_data.get("rating", 0.0)
            ratings.append(rating)
        except Exception as e:
            logger.warning(f"Error calculating sustainability rating for product {product.id}: {e}")
            ratings.append(0.0)
    
    # Final validation - ensure no None values in images list
    for i, img in enumerate(images):
        if img is None:
            logger.error(f"searchProducts - CRITICAL: None value found at images[{i}], replacing with placeholder")
            images[i] = "https://via.placeholder.com/300x300/7BB540/FFFFFF?text=Product"
    
    # Use helper function to ensure all images are valid
    images = [ensure_valid_image_url(img) for img in images]

    return {
        "status": 200,
        "message": "Success",
        "data": products,
        "images": images,
        "rating": ratings,
        "search_term": search_term,
        "total_count": len(products)
    }
