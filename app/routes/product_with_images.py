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
from ..models.sustainability_ratings import SustainabilityRating
from ..models.sustainability_type import SustainabilityType

router = APIRouter(prefix="/product-images", tags=["Products with Images"])

# Initialize services
s3_service = S3Service()

@router.post("/products/", status_code=status.HTTP_201_CREATED)
async def create_product_with_images(
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    category_id: int = Form(...),
    retailer_id: Optional[int] = Form(None),
    stock_quantity: int = Form(0),
    images: List[UploadFile] = File(...),
    # Optional sustainability ratings (matching frontend field names)
    energy_efficiency: Optional[float] = Form(None),
    carbon_footprint: Optional[float] = Form(None),
    recyclability: Optional[float] = Form(None),
    durability: Optional[float] = Form(None),
    material_sustainability: Optional[float] = Form(None),
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
        
        # Add sustainability ratings if provided
        sustainability_metrics = {
            'energy_efficiency': energy_efficiency,
            'carbon_footprint': carbon_footprint,
            'recyclability': recyclability,
            'durability': durability,
            'material_sustainability': material_sustainability
        }
        
        # Get sustainability type mappings
        sustainability_types = db.query(SustainabilityType).all()
        
        # Create multiple mapping strategies for robust matching
        type_map = {}
        for st in sustainability_types:
            # Normalize the type name to lowercase with underscores
            normalized_name = st.type_name.lower().replace(' ', '_')
            type_map[normalized_name] = st.id
            # Also map the exact original name
            type_map[st.type_name] = st.id
        
        print(f"DEBUG: Available sustainability types: {[st.type_name for st in sustainability_types]}")
        print(f"DEBUG: Type mapping: {type_map}")
        print(f"DEBUG: Sustainability metrics to process: {sustainability_metrics}")
        
        ratings_added = 0
        for metric_name, value in sustainability_metrics.items():
            if value is not None and value != 0:  # Skip None and 0 values
                type_id = None
                
                # Strategy 1: Direct match with metric name
                if metric_name in type_map:
                    type_id = type_map[metric_name]
                    print(f"DEBUG: Direct match for {metric_name} -> type_id {type_id}")
                
                # Strategy 2: Convert underscores to spaces and match
                elif metric_name.replace('_', ' ') in type_map:
                    type_id = type_map[metric_name.replace('_', ' ')]
                    print(f"DEBUG: Space match for {metric_name} -> type_id {type_id}")
                
                # Strategy 3: Title case match
                elif metric_name.replace('_', ' ').title() in type_map:
                    type_id = type_map[metric_name.replace('_', ' ').title()]
                    print(f"DEBUG: Title case match for {metric_name} -> type_id {type_id}")
                
                # Strategy 4: Fuzzy matching based on keywords
                else:
                    for st in sustainability_types:
                        if metric_name.lower() in st.type_name.lower() or st.type_name.lower() in metric_name.lower():
                            type_id = st.id
                            print(f"DEBUG: Fuzzy match for {metric_name} -> {st.type_name} (type_id {type_id})")
                            break
                
                if type_id:
                    new_rating = SustainabilityRating(
                        product_id=product_id,
                        type=type_id,
                        value=value,
                        verification=False
                    )
                    db.add(new_rating)
                    ratings_added += 1
                    print(f"DEBUG: Added rating for {metric_name}: {value} (type_id: {type_id})")
                else:
                    print(f"DEBUG: No matching sustainability type found for {metric_name}")
        
        print(f"DEBUG: Total sustainability ratings added: {ratings_added}")
        
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
                    image_url=image_url
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
            "total_images": len(image_urls),
            "sustainability_ratings_added": ratings_added
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