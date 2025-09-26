from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.product import Product
from app.models.product_images import ProductImage
from app.models.sustainability_ratings import SustainabilityRating
from app.models.sustainability_type import SustainabilityType
from pydantic import BaseModel
from typing import Optional, Dict

class ProductUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    brand: Optional[str] = None
    sustainability_metrics: Optional[Dict[str, float]] = None

router = APIRouter(prefix="/admin", tags=["Admin Products"])

@router.get("/products/unverified")
def get_unverified_products(db: Session = Depends(get_db)):
    # Get products where verified field is False
    unverified_products = db.query(Product).filter(
        Product.verified == False
    ).all()
    
    # Get images for all unverified products
    if unverified_products:
        product_ids = [p.id for p in unverified_products]
        image_query = db.query(ProductImage).filter(
            ProductImage.product_id.in_(product_ids)
        ).order_by(ProductImage.product_id, ProductImage.id).all()
        
        # Create image map
        image_map = {}
        for img in image_query:
            if img.product_id not in image_map:
                image_map[img.product_id] = []
            image_map[img.product_id].append(img.image_url)
        
        # Add images to product data
        products_with_images = []
        for product in unverified_products:
            product_dict = product.__dict__.copy()
            product_dict['images'] = image_map.get(product.id, [])
            products_with_images.append(product_dict)
        
        return {
            "status": 200,
            "message": "Success",
            "data": products_with_images
        }
    
    return {
        "status": 200,
        "message": "Success",
        "data": unverified_products
    }

@router.get("/products/unverified/{product_id}")
def view_unverified_product(product_id: int, db: Session = Depends(get_db)):
    # Get specific unverified product by ID
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.verified == False
    ).first()
    
    if not product:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Unverified product not found")
    
    # Get images for this product
    images = db.query(ProductImage).filter(
        ProductImage.product_id == product_id
    ).all()
    
    image_urls = [img.image_url for img in images]
    
    # Convert product to dict and add images
    product_dict = product.__dict__.copy()
    product_dict['images'] = image_urls
    
    return {
        "status": 200,
        "message": "Success",
        "data": product_dict
    }

@router.put("/products/{product_id}/verify")
def verify_product(product_id: int, db: Session = Depends(get_db)):
    # Find the product by ID
    product = db.query(Product).filter(Product.id == product_id).first()
    
    if not product:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Update the verified status to True
    product.verified = True
    db.commit()
    db.refresh(product)
    
    return {
        "status": 200,
        "message": "Product verified successfully",
        "data": product
    }

@router.put("/products/{product_id}")
def update_product(product_id: int, product_update: ProductUpdateRequest, db: Session = Depends(get_db)):
    # Find the product by ID
    product = db.query(Product).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Update only the fields that are provided
    if product_update.name is not None:
        product.name = product_update.name
    if product_update.description is not None:
        product.description = product_update.description
    if product_update.price is not None:
        product.price = product_update.price
    if product_update.quantity is not None:
        product.quantity = product_update.quantity
    if product_update.brand is not None:
        product.brand = product_update.brand
    
    # Update sustainability metrics if provided
    if product_update.sustainability_metrics is not None:
        # Define the mapping from frontend field names to database type names (same as retailer route)
        sustainability_mapping = {
            "energyEfficiency": "Energy Efficiency",
            "carbonFootprint": "Carbon Footprint", 
            "recyclability": "Recyclability",
            "durability": "Durability",
            "materialSustainability": "Material Sustainability"
        }
        
        # Get sustainability type mappings
        sustainability_types = db.query(SustainabilityType).all()
        
        for metric_name, value in product_update.sustainability_metrics.items():
            # Use mapping to get correct type name
            correct_type_name = sustainability_mapping.get(metric_name, metric_name)
            
            # Find the sustainability type
            type_id = None
            for st in sustainability_types:
                if st.type_name == correct_type_name:
                    type_id = st.id
                    break
                    
            if type_id:
                # Check if rating exists
                existing_rating = db.query(SustainabilityRating).filter(
                    SustainabilityRating.product_id == product_id,
                    SustainabilityRating.type == type_id
                ).first()
                
                if existing_rating:
                    existing_rating.value = value
                else:
                    # Create new rating with default verification value (boolean)
                    new_rating = SustainabilityRating(
                        product_id=product_id,
                        type=type_id,
                        value=value,
                        verification=False  # Provide default boolean value for verification
                    )
                    db.add(new_rating)
    
    db.commit()
    db.refresh(product)
    
    # Get images for this product to include in response
    images = db.query(ProductImage).filter(
        ProductImage.product_id == product_id
    ).all()
    
    image_urls = [img.image_url for img in images]
    
    # Convert product to dict and add images
    product_dict = product.__dict__.copy()
    product_dict['images'] = image_urls
    
    return {
        "status": 200,
        "message": "Product updated successfully",
        "data": product_dict
    }

@router.get("/products/{product_id}/sustainability")
def get_product_sustainability(product_id: int, db: Session = Depends(get_db)):
    # Get product
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get sustainability ratings with type info
    ratings = db.query(SustainabilityRating, SustainabilityType).join(
        SustainabilityType, SustainabilityRating.type == SustainabilityType.id
    ).filter(SustainabilityRating.product_id == product_id).all()
    
    # Define the mapping from database type names to frontend keys
    type_to_key_mapping = {
        "Energy Efficiency": "energyefficiency",
        "Carbon Footprint": "carbonfootprint", 
        "Recyclability": "recyclability",
        "Durability": "durability",
        "Material Sustainability": "materialsustainability"
    }
    
    sustainability_data = {}
    for rating, type_info in ratings:
        # Use mapping to get correct frontend key
        key = type_to_key_mapping.get(type_info.type_name, type_info.type_name.lower().replace(' ', ''))
        sustainability_data[key] = float(rating.value)
    
    return {
        "status": 200,
        "message": "Success",
        "data": sustainability_data
    }

@router.get("/products/next-unverified")
def get_next_unverified_product(db: Session = Depends(get_db)):
    # Get the first unverified product (ordered by ID for consistency)
    next_product = db.query(Product).filter(
        Product.verified == False
    ).order_by(Product.id).first()
    
    if not next_product:
        return {
            "status": 200,
            "message": "No unverified products found",
            "data": None
        }
    
    # Get images for this product
    images = db.query(ProductImage).filter(
        ProductImage.product_id == next_product.id
    ).all()
    
    image_urls = [img.image_url for img in images]
    
    # Convert product to dict and add images
    product_dict = next_product.__dict__.copy()
    product_dict['images'] = image_urls
    
    return {
        "status": 200,
        "message": "Success",
        "data": product_dict
    }

@router.get("/products")
def get_all_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    
    # Get images for all products
    if products:
        product_ids = [p.id for p in products]
        image_query = db.query(ProductImage).filter(
            ProductImage.product_id.in_(product_ids)
        ).order_by(ProductImage.product_id, ProductImage.id).all()
        
        # Create image map
        image_map = {}
        for img in image_query:
            if img.product_id not in image_map:
                image_map[img.product_id] = []
            image_map[img.product_id].append(img.image_url)
        
        # Add images to product data
        products_with_images = []
        for product in products:
            product_dict = product.__dict__.copy()
            product_dict['images'] = image_map.get(product.id, [])
            products_with_images.append(product_dict)
        
        return {
            "status": 200,
            "message": "Success",
            "data": products_with_images
        }
    
    return {
        "status": 200,
        "message": "Success",
        "data": products
    }
