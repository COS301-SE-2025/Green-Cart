from sqlalchemy import func
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

    product_ids = [product.id for product in products]
    image_query = db.query(ProductImage).filter(
        ProductImage.product_id.in_(product_ids)
    ).order_by(ProductImage.product_id, ProductImage.id).all()

    image_map = {}
    for img in image_query:
        if img.product_id not in image_map:
            image_map[img.product_id] = img.image_url

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
        "total_count": len(products)
    }

def fetchProduct(request, db: Session):
    product_id = request.get("product_id")
    product = db.query(Product).filter(Product.id == product_id).first()

    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    images = db.query(ProductImage).filter(
        ProductImage.product_id == product_id
    ).all()

    image_urls = [img.image_url for img in images]
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

    return {
        "status": 200,
        "message": "Success",
        "data": product,
        "images": image_urls,
        "sustainability": sustainability_data,
        "units_sold": units_sold,
        "revenue": revenue
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
            image_map[img.product_id] = img.image_url

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
