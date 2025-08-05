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
        print(f"Received product data: {product.model_dump()}")
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while creating the product: {str(e)}"
        )