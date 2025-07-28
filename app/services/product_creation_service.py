from sqlalchemy.orm import Session
from app.models.product import Product
from app.models.categories import Category
from app.models.product_images import ProductImage
from app.models.sustainability_ratings import SustainabilityRating
from app.models.sustainability_type import SustainabilityType
from fastapi import HTTPException
from decimal import Decimal

def createProduct(request, db: Session):
    """
    Create a new product with sustainability ratings and images
    """
    try:
        # Get category by name
        category_name = request.get("category")
        if category_name:
            category = db.query(Category).filter(Category.name == category_name).first()
            if not category:
                raise HTTPException(status_code=400, detail=f"Category '{category_name}' not found")
            category_id = category.id
        else:
            # Fallback to category_id if provided for backwards compatibility
            category_id = request.get("category_id")
            if category_id:
                category = db.query(Category).filter(Category.id == category_id).first()
                if not category:
                    raise HTTPException(status_code=400, detail="Invalid category_id")
            else:
                raise HTTPException(status_code=400, detail="Category is required")
        
        # Create the product
        new_product = Product(
            name=request.get("name"),
            description=request.get("description"),
            price=Decimal(str(request.get("price"))),
            quantity=request.get("quantity"),
            brand=request.get("brand"),
            category_id=category_id,
            retailer_id=request.get("retailer_id"),
            in_stock=True if request.get("quantity", 0) > 0 else False
        )
        
        db.add(new_product)
        db.flush()  # Flush to get the ID without committing
        
        # Add product images if provided
        image_urls = request.get("image_urls", [])
        if not image_urls:
            raise HTTPException(status_code=400, detail="At least one product image is required")
            
        for image_url in image_urls:
            product_image = ProductImage(
                product_id=new_product.id,
                image_url=image_url
            )
            db.add(product_image)
        
        # Add sustainability ratings if provided
        sustainability_data = request.get("sustainability", {})
        if sustainability_data:
            # Define the mapping from frontend field names to database type names
            sustainability_mapping = {
                "energyEfficiency": "Energy Efficiency",
                "carbonFootprint": "Carbon Footprint", 
                "recyclability": "Recyclability",
                "durability": "Durability",
                "materialSustainability": "Material Sustainability"
            }
            
            for field_name, type_name in sustainability_mapping.items():
                if field_name in sustainability_data:
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
                        product_id=new_product.id,
                        type=sustainability_type.id,
                        value=Decimal(str(sustainability_data[field_name]))
                    )
                    db.add(rating)
        
        db.commit()
        
        # Fetch the created product with all its data
        created_product = db.query(Product).filter(Product.id == new_product.id).first()
        
        return {
            "status": 201,
            "message": "Product created successfully",
            "data": created_product,
            "product_id": new_product.id
        }
        
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to create product: {str(e)}")

def updateProduct(request, db: Session):
    """
    Update an existing product
    """
    try:
        product_id = request.get("product_id")
        if not product_id:
            raise HTTPException(status_code=400, detail="Product ID is required")
        
        # Find the product
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Update product fields if provided
        if request.get("name"):
            product.name = request.get("name")
        if request.get("description") is not None:
            product.description = request.get("description")
        if request.get("price"):
            product.price = Decimal(str(request.get("price")))
        if request.get("quantity") is not None:
            product.quantity = request.get("quantity")
        if request.get("brand"):
            product.brand = request.get("brand")
        if request.get("category_id"):
            # Validate category exists
            category = db.query(Category).filter(Category.id == request.get("category_id")).first()
            if not category:
                raise HTTPException(status_code=400, detail="Invalid category_id")
            product.category_id = request.get("category_id")
        if request.get("in_stock") is not None:
            product.in_stock = request.get("in_stock")
        
        # Update images if provided
        if "image_urls" in request:
            # Remove existing images
            db.query(ProductImage).filter(ProductImage.product_id == product_id).delete()
            
            # Add new images
            image_urls = request.get("image_urls", [])
            for image_url in image_urls:
                product_image = ProductImage(
                    product_id=product_id,
                    image_url=image_url
                )
                db.add(product_image)
        
        # Update sustainability ratings if provided
        if "sustainability_ratings" in request:
            # Remove existing ratings
            db.query(SustainabilityRating).filter(SustainabilityRating.product_id == product_id).delete()
            
            # Add new ratings
            sustainability_ratings = request.get("sustainability_ratings", [])
            for rating_data in sustainability_ratings:
                # Get or create sustainability type
                sustainability_type = db.query(SustainabilityType).filter(
                    SustainabilityType.type_name == rating_data.get("type_name")
                ).first()
                
                if not sustainability_type:
                    sustainability_type = SustainabilityType(
                        type_name=rating_data.get("type_name"),
                        description=f"Auto-created type for {rating_data.get('type_name')}",
                        importance_level=3
                    )
                    db.add(sustainability_type)
                    db.flush()
                
                # Create sustainability rating
                sustainability_rating = SustainabilityRating(
                    product_id=product_id,
                    type=sustainability_type.id,
                    value=Decimal(str(rating_data.get("value")))
                )
                db.add(sustainability_rating)
        
        db.commit()
        
        return {
            "status": 200,
            "message": "Product updated successfully",
            "data": product
        }
        
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to update product: {str(e)}")

def deleteProduct(request, db: Session):
    """
    Delete a product and all its associated data
    """
    try:
        product_id = request.get("product_id")
        if not product_id:
            raise HTTPException(status_code=400, detail="Product ID is required")
        
        # Find the product
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Delete associated images
        db.query(ProductImage).filter(ProductImage.product_id == product_id).delete()
        
        # Delete associated sustainability ratings
        db.query(SustainabilityRating).filter(SustainabilityRating.product_id == product_id).delete()
        
        # Delete the product
        db.delete(product)
        db.commit()
        
        return {
            "status": 200,
            "message": "Product deleted successfully"
        }
        
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to delete product: {str(e)}")
