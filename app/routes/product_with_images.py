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
        # Log the received FormData for debugging
        import datetime
        timestamp = datetime.datetime.now().isoformat()
        
        print(f"=== FORMDATA ENDPOINT HIT ===")
        print(f"Timestamp: {timestamp}")
        print(f"Product name: {name}")
        print(f"Product description: {description}")
        print(f"Product price: {price}")
        print(f"Category ID: {category_id}")
        print(f"Retailer ID: {retailer_id}")
        print(f"Stock quantity: {stock_quantity}")
        print(f"Number of images: {len(images)}")
        print(f"=== SUSTAINABILITY RATINGS RECEIVED ===")
        print(f"Energy efficiency: {energy_efficiency} (type: {type(energy_efficiency)})")
        print(f"Carbon footprint: {carbon_footprint} (type: {type(carbon_footprint)})")
        print(f"Recyclability: {recyclability} (type: {type(recyclability)})")
        print(f"Durability: {durability} (type: {type(durability)})")
        print(f"Material sustainability: {material_sustainability} (type: {type(material_sustainability)})")
        print(f"=== IMAGES DEBUG ===")
        for i, img in enumerate(images):
            print(f"Image {i+1}: {img.filename}, Size: {img.size if hasattr(img, 'size') else 'unknown'}, Content-Type: {img.content_type}")
        print(f"=== END FORMDATA DEBUG ===")
        
        # Log to file as well
        try:
            log_message = f"""
{timestamp} - FORMDATA ENDPOINT REQUEST
Name: {name}
Price: {price}
Energy efficiency: {energy_efficiency}
Carbon footprint: {carbon_footprint}
Recyclability: {recyclability}
Durability: {durability}
Material sustainability: {material_sustainability}
---
"""
            with open('/tmp/formdata_debug.log', 'a') as f:
                f.write(log_message)
        except:
            pass  # Don't fail if logging fails
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
        
        ratings_added = 0
        for metric_name, value in sustainability_metrics.items():
            if value is not None and value != 0:  # Skip None and 0 values
                type_id = None
                
                # Strategy 1: Direct match with metric name
                if metric_name in type_map:
                    type_id = type_map[metric_name]
                
                # Strategy 2: Convert underscores to spaces and match
                elif metric_name.replace('_', ' ') in type_map:
                    type_id = type_map[metric_name.replace('_', ' ')]
                
                # Strategy 3: Title case match
                elif metric_name.replace('_', ' ').title() in type_map:
                    type_id = type_map[metric_name.replace('_', ' ').title()]
                
                # Strategy 4: Fuzzy matching based on keywords
                else:
                    for st in sustainability_types:
                        if metric_name.lower() in st.type_name.lower() or st.type_name.lower() in metric_name.lower():
                            type_id = st.id
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

@router.put("/products/{product_id}", status_code=status.HTTP_200_OK)
async def update_product_with_images(
    product_id: int,
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    category_id: int = Form(...),
    retailer_id: Optional[int] = Form(None),
    stock_quantity: int = Form(0),
    images: Optional[List[UploadFile]] = File(None),
    existing_images: Optional[List[str]] = Form(None),
    # Optional sustainability ratings (matching frontend field names)
    energy_efficiency: Optional[float] = Form(None),
    carbon_footprint: Optional[float] = Form(None),
    recyclability: Optional[float] = Form(None),
    durability: Optional[float] = Form(None),
    material_sustainability: Optional[float] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Update an existing product with new images uploaded to S3
    """
    try:
        # Log the received FormData for debugging
        import datetime
        timestamp = datetime.datetime.now().isoformat()
        
        print(f"=== UPDATE FORMDATA ENDPOINT HIT ===")
        print(f"Timestamp: {timestamp}")
        print(f"Product ID: {product_id}")
        print(f"Product name: {name}")
        print(f"Existing images count: {len(existing_images) if existing_images else 0}")
        print(f"New images count: {len(images) if images else 0}")
        
        # Check if product exists
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Verify retailer ownership (if retailer_id provided)
        if retailer_id and product.retailer_id != retailer_id:
            raise HTTPException(status_code=403, detail="Not authorized to update this product")
        
        # Update product basic information
        product.name = name
        product.description = description
        product.price = Decimal(str(price))
        product.category_id = category_id
        product.stock_quantity = stock_quantity
        
        # Handle sustainability ratings if provided
        ratings_updated = 0
        sustainability_metrics = [
            ("energy_efficiency", energy_efficiency),
            ("carbon_footprint", carbon_footprint),
            ("recyclability", recyclability),
            ("durability", durability),
            ("material_sustainability", material_sustainability)
        ]
        
        for metric_name, value in sustainability_metrics:
            if value is not None:
                # Find the sustainability type
                sust_type = db.query(SustainabilityType).filter(
                    SustainabilityType.type_name.ilike(f"%{metric_name.replace('_', ' ')}%")
                ).first()
                
                if sust_type:
                    # Update or create sustainability rating
                    rating = db.query(SustainabilityRating).filter(
                        SustainabilityRating.product_id == product_id,
                        SustainabilityRating.type == sust_type.id
                    ).first()
                    
                    if rating:
                        rating.value = value
                    else:
                        rating = SustainabilityRating(
                            product_id=product_id,
                            type=sust_type.id,
                            value=value,
                            verification=False
                        )
                        db.add(rating)
                    ratings_updated += 1
        
        # Handle image updates
        image_urls = []
        
        # First, remove all existing product images from database
        existing_product_images = db.query(ProductImage).filter(ProductImage.product_id == product_id).all()
        for img in existing_product_images:
            db.delete(img)
        
        # Add back the existing images that should be preserved
        if existing_images:
            for img_url in existing_images:
                if img_url and img_url.strip():  # Skip empty strings
                    product_image = ProductImage(
                        product_id=product_id,
                        image_url=img_url.strip()
                    )
                    db.add(product_image)
                    image_urls.append(img_url.strip())
        
        # Upload new images to S3 and add to database
        if images:
            for image in images:
                try:
                    # Validate image
                    if not image.filename:
                        continue
                    
                    file_extension = os.path.splitext(image.filename)[1].lower()
                    if file_extension not in ['.jpg', '.jpeg', '.png', '.gif', '.webp']:
                        raise HTTPException(
                            status_code=400,
                            detail=f"Invalid file type: {file_extension}. Allowed: .jpg, .jpeg, .png, .gif, .webp"
                        )
                    
                    # Generate unique filename
                    unique_filename = f"{uuid.uuid4()}{file_extension}"
                    
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
            "message": "Product updated successfully with images",
            "product_id": product_id,
            "product_name": name,
            "image_urls": image_urls,
            "total_images": len(image_urls),
            "sustainability_ratings_updated": ratings_updated
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update product: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """Health check endpoint for the product images service"""
    return {
        "status": "healthy",
        "service": "product-images",
        "s3_available": s3_service.is_available()
    }

@router.get("/debug-formdata-logs")
async def get_formdata_debug_logs():
    """Get the latest FormData debug logs - FREE debugging"""
    try:
        with open('/tmp/formdata_debug.log', 'r') as f:
            logs = f.read()
        return {"logs": logs}
    except FileNotFoundError:
        return {"logs": "No FormData logs found yet. Try creating a product first."}
    except Exception as e:
        return {"error": str(e)}