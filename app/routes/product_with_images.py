from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
import os

from ..db.session import get_db
from ..services.s3_service import S3Service
from ..services.product_creation_service import ProductCreationService
from ..schemas.product import ProductCreate
from ..models.product import Product
from ..models.product_images import ProductImage

router = APIRouter(prefix="/product-images", tags=["Products with Images"])

# Initialize services
s3_service = S3Service()
product_service = ProductCreationService()

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

        # Create product data
        product_data = ProductCreate(
            name=name,
            description=description,
            price=price,
            category_id=category_id,
            retailer_id=retailer_id,
            stock_quantity=stock_quantity
        )

        # Create the product
        product = product_service.create_product(db, product_data)
        
        # Upload images to S3
        image_urls = []
        for image in images:
            try:
                # Generate unique filename
                file_extension = os.path.splitext(image.filename)[1]
                unique_filename = f"products/{product.id}/{uuid.uuid4()}{file_extension}"
                
                # Upload to S3
                image_url = await s3_service.upload_file(image, unique_filename)
                image_urls.append(image_url)
                
                # Save image URL to database
                product_image = ProductImage(
                    product_id=product.id,
                    image_url=image_url,
                    alt_text=f"{product.name} image"
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
            "product_id": product.id,
            "product_name": product.name,
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