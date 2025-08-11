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
        images = fetchRetailerProductImages(db, product.id, limit=1)
        image_url = images[0].image_url if images else None

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
            "image_url": image_url,
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
        # Create sustainability ratings if provided
        if "sustainability_metrics" in product_data:
            metrics = product_data["sustainability_metrics"]
            # We'll implement this part later based on your sustainability ratings model
        db.commit()
        # Return product with calculated sustainability rating
        req = {"product_id": new_product.id}
        sustainability = fetchSustainabilityRatings(req, db)
        rating = sustainability.get("rating", 0)
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
            "image_url": None,
            "sustainability_rating": rating
        }
    except Exception as e:
        db.rollback()
        raise e
