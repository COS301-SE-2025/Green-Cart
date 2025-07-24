from sqlalchemy.orm import Session
from app.models.product import Product
from app.models.product_images import ProductImage
from app.services.sustainabilityRatings_service import fetchSustainabilityRatings
from fastapi import HTTPException

def fetchRetailerProductImages(db: Session, product_id: int, limit: int = 1):
    if limit == -1:
        return db.query(ProductImage).filter(ProductImage.product_id == product_id).all()

    return db.query(ProductImage).filter(ProductImage.product_id == product_id).limit(limit).all()

def fetchRetailerProducts(retailer_id: int, db: Session):
    products = db.query(Product).filter(Product.retailer_id == retailer_id).all()

    enriched_products = []

    for product in products:
        images = fetchRetailerProductImages(db, product.id, limit=1)
        image_url = images[0].image_url if images else None

        req = {
            "product_id": product.id
        }

        sustainability = fetchSustainabilityRatings(req, db)
        rating = sustainability.get("rating", 0)

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
            "sustainability_rating": rating
        })

    return enriched_products
