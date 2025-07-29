from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.product import Product
from app.models.sustainability_ratings import SustainabilityRating

router = APIRouter(prefix="/admin", tags=["Admin Products"])

@router.get("/products/unverified")
def get_unverified_products(db: Session = Depends(get_db)):
    # Get products where verified field is False
    unverified_products = db.query(Product).filter(
        Product.verified == False
    ).all()
    
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
    
    return {
        "status": 200,
        "message": "Success",
        "data": product
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
    
    return {
        "status": 200,
        "message": "Success",
        "data": next_product
    }

@router.get("/products")
def get_all_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return {
        "status": 200,
        "message": "Success",
        "data": products
    }
