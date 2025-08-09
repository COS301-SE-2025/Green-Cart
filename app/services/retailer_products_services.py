from sqlalchemy.orm import Session
from app.models.product import Product
from app.models.product_images import ProductImage
from app.services.sustainabilityRatings_service import fetchSustainabilityRatings
from fastapi import HTTPException, status

def fetchRetailerProductImages(db: Session, product_id: int, limit: int = 1):
    if limit == -1:
        return db.query(ProductImage).filter(ProductImage.product_id == product_id).all()

    return db.query(ProductImage).filter(ProductImage.product_id == product_id).limit(limit).all()

def fetchRetailerProducts(retailer_id: int, db: Session):
    products = db.query(Product).filter(Product.retailer_id == retailer_id).all()

    enriched_products = []

    from app.models.orders import Order
    from app.models.cart_item import CartItem
    from app.models.cart import Cart
    from sqlalchemy import func
    valid_states = ["Preparing Order", "Ready for Delivery", "In Transit", "Delivered"]
    for product in products:
        # Get all images for the product
        all_images = fetchRetailerProductImages(db, product.id, limit=-1)
        images = [img.image_url for img in all_images] if all_images else []
        image_url = images[0] if images else None  # Keep for backwards compatibility

        req = {
            "product_id": product.id
        }
        sustainability = fetchSustainabilityRatings(req, db)
        rating = sustainability.get("rating", 0)

        valid_carts = db.query(Cart.id).filter(Cart.id.in_(db.query(Order.cart_id).filter(Order.state.in_(valid_states)))).subquery()
        units_sold = db.query(func.sum(CartItem.quantity)).filter(
            CartItem.product_id == product.id,
            CartItem.cart_id.in_(valid_carts)
        ).scalar() or 0
        price = float(product.price) if product and product.price else 0.0
        revenue = units_sold * price

        enriched_products.append({
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "in_stock": product.in_stock,
            "quantity": product.quantity,
            "brand": product.brand,
            "category_id": product.category_id,
            "retailer_id": product.retailer_id,
            "created_at": product.created_at,
            "image_url": image_url,  # Keep for backwards compatibility
            "images": images,  # Add full images array
            "sustainability_rating": rating,
            "units_sold": units_sold,
            "revenue": revenue
        })

    return enriched_products


def deleteRetailerProduct(product_id: int, retailer_id: int, db: Session):
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.retailer_id == retailer_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or does not belong to the retailer."
        )

    # Mark as out of stock
    product.in_stock = False
    product.quantity = 0  # Optional

    db.commit()
    return {"message": "Product marked as out of stock (discontinued)."}

def createRetailerProduct(product_data: dict, db: Session):
    try:
        # Create new product
        new_product = Product(
            name=product_data["name"],
            description=product_data["description"],
            price=product_data["price"],
            quantity=product_data["quantity"],
            in_stock=product_data["quantity"] > 0,
            brand=product_data["brand"],
            category_id=product_data["category_id"],
            retailer_id=product_data["retailer_id"]
        )
        db.add(new_product)
        db.flush()  # Get the ID without committing
        
        # Save images if provided (supports both base64 and URLs)
        if "images" in product_data and product_data["images"]:
            from app.models.product_images import ProductImage
            for image_data in product_data["images"]:
                # Handle both base64 data URLs and regular URLs
                if image_data and (image_data.startswith('data:image/') or image_data.startswith('http')):
                    product_image = ProductImage(
                        product_id=new_product.id,
                        image_url=image_data  # Store base64 string or URL directly
                    )
                    db.add(product_image)
        
        # Create sustainability ratings if provided
        if "sustainability_metrics" in product_data and product_data["sustainability_metrics"]:
            from app.models.sustainability_ratings import SustainabilityRating
            for metric in product_data["sustainability_metrics"]:
                if isinstance(metric, dict) and "id" in metric and "value" in metric:
                    sustainability_rating = SustainabilityRating(
                        product_id=new_product.id,
                        type=metric["id"],
                        value=float(metric["value"]),
                        verification=False  # Default verification status
                    )
                    db.add(sustainability_rating)
        
        db.commit()
        
        # Return product with calculated sustainability rating and first image
        req = {"product_id": new_product.id}
        sustainability = fetchSustainabilityRatings(req, db)
        rating = sustainability.get("rating", 0)
        
        # Get first image for display
        first_image = None
        if "images" in product_data and product_data["images"]:
            first_image = product_data["images"][0]
        
        return {
            "id": new_product.id,
            "name": new_product.name,
            "description": new_product.description,
            "price": float(new_product.price),
            "in_stock": new_product.in_stock,
            "quantity": new_product.quantity,
            "brand": new_product.brand,
            "category_id": new_product.category_id,
            "retailer_id": new_product.retailer_id,
            "created_at": new_product.created_at,
            "image_url": first_image,
            "sustainability_rating": rating
        }
    except Exception as e:
        db.rollback()
        raise e
