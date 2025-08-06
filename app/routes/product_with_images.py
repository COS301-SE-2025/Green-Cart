from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
import os
from decimal import Decimal

from ..db.session import get_db
from ..services.s3_service import S3Service
from ..models.product import Product
from ..models.product_images import ProductImage
from ..models.categories import Category

router = APIRouter(prefix="/product-images", tags=["Products with Images"])

# Initialize services
s3_service = S3Service()

@router.post("/products/", status_code=status.HTTP_201_CREATED)
async def create_product_with_images(
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    category_id: int = Form(...),
    retailer_id: int = Form(...),
    stock_quantity: int = Form(0),
    images: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    """
    Create a new product with images uploaded to S3
    """
    try:
        # Validate images
        for image in images:
            if not image.content_type or not image.content_type.startswith('image/'):
                raise HTTPException(
                    status_code=400,
                    detail=f"File {image.filename} is not a valid image"
                )
            
            # Check file size (5MB limit)
            if hasattr(image, 'size') and image.size > 5 * 1024 * 1024:
                raise HTTPException(
                    status_code=400,
                    detail=f"File {image.filename} is too large. Maximum size is 5MB"
                )

        # Validate category exists
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            raise HTTPException(status_code=400, detail="Invalid category_id")

        # Create the product directly
        new_product = Product(
            name=name,
            description=description,
            price=Decimal(str(price)),
            quantity=stock_quantity,
            category_id=category_id,
            retailer_id=retailer_id,
            in_stock=True if stock_quantity > 0 else False
        )
        
        db.add(new_product)
        db.flush()  # Flush to get the ID without committing
        product_id = new_product.id
        
        # Upload images to S3
        image_urls = []
        for image in images:
            try:
                # Generate unique filename
                file_extension = os.path.splitext(image.filename)[1]
                unique_filename = f"products/{product_id}/{uuid.uuid4()}{file_extension}"
                
                # Upload to S3
                image_url = await s3_service.upload_file(image, unique_filename)
                image_urls.append(image_url)
                
                # Save image URL to database
                product_image = ProductImage(
                    product_id=product_id,
                    image_url=image_url,
                    alt_text=f"{name} image"
                )
                db.add(product_image)
                
            except Exception as e:
                # If image upload fails, we should clean up
                db.rollback()
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to upload image {image.filename}: {str(e)}"
                )
        
        db.commit()
        
        return {
            "message": "Product created successfully with images",
            "product_id": product_id,
            "product_name": name,
            "image_urls": image_urls,
            "total_images": len(image_urls)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create product: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """Health check endpoint for the product images service"""
    return {
        "status": "healthy",
        "service": "product-images",
        "s3_available": s3_service.is_available()
    }