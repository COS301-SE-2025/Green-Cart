from sqlalchemy.orm import Session
from app.models.product import Product

def get_all_products(db: Session):
    return db.query(Product).all()

def fetchAllProducts(request, db: Session):
    products = db.query(Product).all()
    response = {
        "status": request,
        "data": products,
        "message": "Products fetched successfully"
    }
    return response
    
    
