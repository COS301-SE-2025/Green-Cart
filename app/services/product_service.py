from sqlalchemy.orm import Session
from app.models.product import Product, Category
from fastapi import HTTPException

def get_all_products(db: Session):
    return db.query(Product).all()

def fetchAllProducts(request, db: Session):
    products = db.query(Product)

    if request.get("filter", {}) != None:
        filter = request.get("filter", {})
        filters = []
        # Add new filters below
        
        if filter.get("category", "") != "":
            category = filter.get("category")

            category_ID = db.query(Category).filter(Category.name == category).first()
            
            if category_ID is None:
                raise HTTPException(status_code=404, detail="Category not found")
            else:
                filters.append(Product.category_id == category_ID.id)
            
            
        products = db.query(Product).filter(*filters)

    if request.get("sort", []) != None:
        sort = request.get("sort", [])
        if sort[0] in ["id", "name", "description", "price", "in_stock", "quantity", "brand", "category_id", "retailer_id", "created_at"]: 
            if sort[1] == "ASC":
                products = products.order_by(getattr(Product, sort[0]).asc())
            elif sort[1] == "DESC":
                products = products.order_by(getattr(Product, sort[0]).desc())
            else:
                raise HTTPException(status_code=400, detail="Invalid sort order")
        
        else:
            raise HTTPException(status_code=400, detail="Invalid sort field")
        
    fromItem = request.get("fromItem", 0)
    count = request.get("count", 10)

    if fromItem < 0:
        raise HTTPException(status_code=400, detail="fromItem must be greater than or equal to 0")
    
    if count <= 0:
        raise HTTPException(status_code=400, detail="count must be greater than 0")

    products = products.offset(fromItem).limit(count).all()

    return {
        "status": 200,
        "message": "Success",
        "data": products
    }
    
    
