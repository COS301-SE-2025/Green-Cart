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