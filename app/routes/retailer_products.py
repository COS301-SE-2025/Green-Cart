from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.retailer_products import CreateProductRequest, ProductResponse
from app.services.retailer_products_services import fetchRetailerProducts, deleteRetailerProduct, createRetailerProduct

router = APIRouter(prefix="/retailer", tags=["Retailer"])
@router.put("/products/{product_id}")
def update_product(product_id: int, product: CreateProductRequest, db: Session = Depends(get_db)):
    from app.models.product import Product
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    # Update fields
    db_product.name = product.name
    db_product.description = product.description
    db_product.price = product.price
    db_product.quantity = product.quantity
    db_product.in_stock = product.quantity > 0
    db_product.brand = product.brand
    db_product.category_id = product.category_id
    db.commit()
    db.refresh(db_product)
    return {"status": 200, "message": "Product updated successfully", "data": db_product}
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.retailer_products import CreateProductRequest, ProductResponse
from app.services.retailer_products_services import fetchRetailerProducts, deleteRetailerProduct, createRetailerProduct

router = APIRouter(prefix="/retailer", tags=["Retailer"])
# Add PUT endpoint after router definition
@router.put("/products/{product_id}")
def update_product(product_id: int, product: CreateProductRequest, db: Session = Depends(get_db)):
    from app.models.product import Product
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    # Update fields
    db_product.name = product.name
    db_product.description = product.description
    db_product.price = product.price
    db_product.quantity = product.quantity
    db_product.in_stock = product.quantity > 0
    db_product.brand = product.brand
    db_product.category_id = product.category_id
    db.commit()
    db.refresh(db_product)
    return {"status": 200, "message": "Product updated successfully", "data": db_product}
@router.put("/products/{product_id}")
def update_product(product_id: int, product: CreateProductRequest, db: Session = Depends(get_db)):
    from app.models.product import Product
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    # Update fields
    db_product.name = product.name
    db_product.description = product.description
    db_product.price = product.price
    db_product.quantity = product.quantity
    db_product.in_stock = product.quantity > 0
    db_product.brand = product.brand
    db_product.category_id = product.category_id
    db.commit()
    db.refresh(db_product)
    return {"status": 200, "message": "Product updated successfully", "data": db_product}

@router.get("/products/{retailer_id}")
def get_retailer_products(retailer_id: int, db: Session = Depends(get_db)):
    products = fetchRetailerProducts(retailer_id, db)
    return {
        "status": 200,
        "message": "Retailer products fetched successfully",
        "data":
            products
    }

@router.delete("/products/{product_id}")
def delete_product(product_id: int, retailer_id: int, db: Session = Depends(get_db)):
    return deleteRetailerProduct(product_id, retailer_id, db)

@router.post("/products", response_model=ProductResponse)
async def create_product(product: CreateProductRequest, db: Session = Depends(get_db)):
    try:
        product_data = product.model_dump()
        
        # Log to both console and file
        import datetime
        timestamp = datetime.datetime.now().isoformat()
        log_message = f"""
{timestamp} - FRONTEND REQUEST RECEIVED
Product name: {product_data.get('name')}
Product price: {product_data.get('price')}
Sustainability metrics: {product_data.get('sustainability_metrics')}
Full data: {product_data}
---
"""
        
        # Write to file (free logging)
        try:
            with open('/tmp/product_creation_debug.log', 'a') as f:
                f.write(log_message)
        except:
            pass  # Don't fail if logging fails
        
        # Also print to console
        print(f"=== FRONTEND REQUEST RECEIVED ===")
        print(f"Product name: {product_data.get('name')}")
        print(f"Product price: {product_data.get('price')}")
        print(f"Sustainability metrics received: {product_data.get('sustainability_metrics')}")
        print(f"Full product data: {product_data}")
        print(f"=== END REQUEST DATA ===")
        
        result = createRetailerProduct(product_data, db)
        print(f"Product created successfully with ID: {result.get('id')}")
        return result
    except ValueError as ve:
        print(f"Validation error: {str(ve)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        print(f"Error creating product: {str(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while creating the product: {str(e)}"
        )

@router.get("/debug-logs")
async def get_debug_logs():
    """Get the latest product creation debug logs - FREE debugging"""
    try:
        with open('/tmp/product_creation_debug.log', 'r') as f:
            logs = f.read()
        return {"logs": logs}
    except FileNotFoundError:
        return {"logs": "No logs found yet. Try creating a product first."}
    except Exception as e:
        return {"error": str(e)}

@router.post("/clear-debug-logs")
async def clear_debug_logs():
    """Clear the debug logs"""
    try:
        with open('/tmp/product_creation_debug.log', 'w') as f:
            f.write("")
        return {"message": "Debug logs cleared"}
    except Exception as e:
        return {"error": str(e)}
=======
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.retailer_products import CreateProductRequest, ProductResponse
from app.services.retailer_products_services import fetchRetailerProducts, deleteRetailerProduct, createRetailerProduct

router = APIRouter(prefix="/retailer", tags=["Retailer"])

@router.put("/products/{product_id}")
def update_product(product_id: int, product: CreateProductRequest, db: Session = Depends(get_db)):
    from app.models.product import Product
    from app.models.sustainability_ratings import SustainabilityRating
    from app.models.product_images import ProductImage
    
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Update basic fields
    db_product.name = product.name
    db_product.description = product.description
    db_product.price = product.price
    db_product.quantity = product.quantity
    db_product.in_stock = product.quantity > 0
    db_product.brand = product.brand
    db_product.category_id = product.category_id

    # Simple image preservation: only update if images field exists and has content
    if hasattr(product, 'images') and product.images is not None and len(product.images) > 0:
        # Only update images if the frontend explicitly sends new ones
        db.query(ProductImage).filter(ProductImage.product_id == product_id).delete()
        
        for image_data in product.images:
            if image_data and (image_data.startswith('data:image/') or image_data.startswith('http')):
                product_image = ProductImage(
                    product_id=product_id,
                    image_url=image_data
                )
                db.add(product_image)
    # If no images sent or empty array, preserve existing images (don't touch them)

    # Update sustainability ratings if provided
    if hasattr(product, 'sustainability_metrics') and product.sustainability_metrics:
        # Handle old format with ID-based metrics
        # Remove old ratings for this product
        db.query(SustainabilityRating).filter(SustainabilityRating.product_id == product_id).delete()
        
        # Add new ratings from array of sustainability metrics
        for metric in product.sustainability_metrics:
            db.add(SustainabilityRating(
                product_id=product_id, 
                type=metric.id, 
                value=metric.value,
                verification=False  # Default to False for boolean verification
            ))
    elif hasattr(product, 'sustainability') and product.sustainability:
        # Handle new format with type name-based metrics (same as product creation)
        from app.models.sustainability_type import SustainabilityType
        from decimal import Decimal
        
        # Remove old ratings for this product
        db.query(SustainabilityRating).filter(SustainabilityRating.product_id == product_id).delete()
        
        # Define the mapping from frontend field names to database type names
        sustainability_mapping = {
            "energyEfficiency": "Energy Efficiency",
            "carbonFootprint": "Carbon Footprint", 
            "recyclability": "Recyclability",
            "durability": "Durability",
            "materialSustainability": "Material Sustainability"
        }
        
        sustainability_data = product.sustainability
        for field_name, type_name in sustainability_mapping.items():
            if hasattr(sustainability_data, field_name):
                field_value = getattr(sustainability_data, field_name)
                if field_value is not None:
                    # Get the sustainability type
                    sustainability_type = db.query(SustainabilityType).filter(
                        SustainabilityType.type_name == type_name
                    ).first()
                    
                    if not sustainability_type:
                        # Create new sustainability type if it doesn't exist
                        sustainability_type = SustainabilityType(
                            type_name=type_name,
                            description=f"Auto-created type for {type_name}",
                            importance_level=3
                        )
                        db.add(sustainability_type)
                        db.flush()
                    
                    # Create sustainability rating
                    rating = SustainabilityRating(
                        product_id=product_id,
                        type=sustainability_type.id,
                        value=Decimal(str(field_value)),
                        verification=False  # Default to False for boolean verification
                    )
                    db.add(rating)

    db.commit()
    db.refresh(db_product)
    
    # Return updated product with images
    req = {"product_id": product_id}
    from app.services.sustainabilityRatings_service import fetchSustainabilityRatings
    sustainability = fetchSustainabilityRatings(req, db)
    rating = sustainability.get("rating", 0)
    
    # Get first image for display
    first_image = None
    if hasattr(product, 'images') and product.images:
        first_image = product.images[0]
    
    return {
        "status": 200, 
        "message": "Product updated successfully", 
        "data": {
            "id": db_product.id,
            "name": db_product.name,
            "description": db_product.description,
            "price": float(db_product.price),
            "quantity": db_product.quantity,
            "brand": db_product.brand,
            "category_id": db_product.category_id,
            "retailer_id": db_product.retailer_id,
            "image_url": first_image,
            "sustainability_rating": rating
        }
    }

@router.get("/products/{retailer_id}")
def get_retailer_products(retailer_id: int, db: Session = Depends(get_db)):
    products = fetchRetailerProducts(retailer_id, db)
    return {
        "status": 200,
        "message": "Retailer products fetched successfully",
        "data": products
    }

@router.delete("/products/{product_id}")
def delete_product(product_id: int, retailer_id: int, db: Session = Depends(get_db)):
    return deleteRetailerProduct(product_id, retailer_id, db)

@router.post("/products", response_model=ProductResponse)
async def create_product(product: CreateProductRequest, db: Session = Depends(get_db)):
    try:
        print(f"Received product data: {product.model_dump()}")
        
        # Additional validation logging
        print(f"Product name: {product.name}")
        print(f"Sustainability metrics count: {len(product.sustainability_metrics)}")
        print(f"Images count: {len(product.images) if product.images else 0}")
        
        result = createRetailerProduct(product.model_dump(), db)
        print(f"Product created successfully: {result}")
        return result
    except ValueError as ve:
        print(f"Validation error: {str(ve)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        print(f"Error creating product: {str(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while creating the product: {str(e)}"
        )
