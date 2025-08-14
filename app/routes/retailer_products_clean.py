from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.retailer_products import CreateProductRequest, ProductResponse
from app.services.retailer_products_services import fetchRetailerProducts, deleteRetailerProduct, createRetailerProduct

router = APIRouter(prefix="/retailer", tags=["Retailer"])

@router.put("/products/{product_id}")
def update_product(product_id: int, product: CreateProductRequest, db: Session = Depends(get_db)):
    """Update a retailer product"""
    from app.models.product import Product
    from app.models.product_images import ProductImage
    from app.models.sustainability_ratings import SustainabilityRating
    from app.models.sustainability_type import SustainabilityType
    from decimal import Decimal
    
    # Find the product
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Update basic product fields
    db_product.name = product.name
    db_product.description = product.description
    db_product.price = product.price
    db_product.quantity = product.quantity
    db_product.in_stock = product.quantity > 0
    db_product.brand = product.brand
    db_product.category_id = product.category_id
    
    # Update images if provided
    if hasattr(product, 'images') and product.images is not None and len(product.images) > 0:
        # Remove old images
        db.query(ProductImage).filter(ProductImage.product_id == product_id).delete()
        
        # Add new images
        for image_data in product.images:
            if image_data and (image_data.startswith('data:image/') or image_data.startswith('http')):
                product_image = ProductImage(
                    product_id=product_id,
                    image_url=image_data
                )
                db.add(product_image)

    # Update sustainability ratings if provided
    if hasattr(product, 'sustainability_metrics') and product.sustainability_metrics:
        # Remove old ratings
        db.query(SustainabilityRating).filter(SustainabilityRating.product_id == product_id).delete()
        
        # Add new ratings
        for metric in product.sustainability_metrics:
            db.add(SustainabilityRating(
                product_id=product_id, 
                type=metric.id, 
                value=metric.value,
                verification=False
            ))
    elif hasattr(product, 'sustainability') and product.sustainability:
        # Remove old ratings
        db.query(SustainabilityRating).filter(SustainabilityRating.product_id == product_id).delete()
        
        # Define mapping from frontend to database
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
                    # Get or create sustainability type
                    sustainability_type = db.query(SustainabilityType).filter(
                        SustainabilityType.type_name == type_name
                    ).first()
                    
                    if not sustainability_type:
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
                        verification=False
                    )
                    db.add(rating)

    db.commit()
    db.refresh(db_product)
    
    # Return updated product
    req = {"product_id": product_id}
    try:
        from app.services.sustainabilityRatings_service import fetchSustainabilityRatings
        sustainability = fetchSustainabilityRatings(req, db)
        rating = sustainability.get("rating", 0)
    except:
        rating = 0
    
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
    """Get all products for a specific retailer"""
    products = fetchRetailerProducts(retailer_id, db)
    return {
        "status": 200,
        "message": "Retailer products fetched successfully",
        "data": products
    }

@router.delete("/products/{product_id}")
def delete_product(product_id: int, retailer_id: int, db: Session = Depends(get_db)):
    """Delete a retailer product"""
    return deleteRetailerProduct(product_id, retailer_id, db)

@router.post("/products", response_model=ProductResponse)
async def create_product(product: CreateProductRequest, db: Session = Depends(get_db)):
    """Create a new retailer product"""
    try:
        product_data = product.model_dump()
        
        # Log product creation for debugging
        print(f"=== CREATING PRODUCT ===")
        print(f"Product name: {product_data.get('name')}")
        print(f"Product price: {product_data.get('price')}")
        print(f"Sustainability metrics: {len(product_data.get('sustainability_metrics', []))}")
        print(f"Images: {len(product_data.get('images', []))}")
        
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
    """Get debug logs for troubleshooting"""
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
    """Clear debug logs"""
    try:
        with open('/tmp/product_creation_debug.log', 'w') as f:
            f.write("")
        return {"message": "Debug logs cleared"}
    except Exception as e:
        return {"error": str(e)}
