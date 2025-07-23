from sqlalchemy.orm import Session
from app.models.product import Product
from app.models.categories import Category
from app.models.product_images import ProductImage
from app.services.sustainabilityRatings_service import fetchSustainabilityRatings
from fastapi import HTTPException

def get_all_products(db: Session):
    return db.query(Product).all()

def fetchProductImages(db: Session, product_id: int, limit: int = 1):
    if limit == -1:
        product = db.query(ProductImage).filter(ProductImage.product_id == product_id).all()    
        return product

    if limit < -1:
        limit = 1

    product = db.query(ProductImage).filter(ProductImage.product_id == product_id).limit(limit).all()

    return product
    

def fetchAllProducts(request, db: Session):
    products = db.query(Product)
    images= []

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
    rating = []


    for x in range(len(products)):
        product = products[x]
        image = fetchProductImages(db, product.id)
        images.append(image[0].image_url)

        req = {
            "product_id": product.id
        }

        res = fetchSustainabilityRatings(req, db)
        rating.append(res.get("rating",0))
        

    return {
        "status": 200,
        "message": "Success",
        "data": products,
        "images": images,
        "rating": rating
    }
    
def fetchProduct(request, db: Session):
    product = db.query(Product).filter(Product.id == request.get("product_id")).first()
    
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    images = []

    imageResponse = fetchProductImages(db, product.id, -1)
    
    for x in range(len(imageResponse)):
        image = imageResponse[x].image_url
        images.append(image)

    req = {
        "product_id": product.id
    }

    res = fetchSustainabilityRatings(req, db)

    statistics = res.get("statistics", [])
    # Fix: Handle statistics as dictionaries, not objects
    for stat in statistics:
        if isinstance(stat, dict):
            # stat is already a dictionary, type should already be converted in fetchSustainabilityRatings
            pass
        else:
            # If it's still an object, convert it
            stat.type = str(stat.type)

    sustainability = {
        "rating": res.get("rating", 0),
        "statistics": statistics,
        "grade": res.get("grade"),
        "insights": res.get("insights")
    }

    return {
        "status": 200,
        "message": "Success",
        "data": product,
        "images": images,
        "sustainability": sustainability
    }



def searchProducts(request, db: Session):
    search = request.get("search", "")

    products = db.query(Product).filter(
        Product.name.ilike(f"%{search}%") |
        Product.description.ilike(f"%{search}%") |
        Product.brand.ilike(f"%{search}%")
    )

    images= []

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
            
            
        products = products.filter(*filters)

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

    rating = []

    for x in range(len(products)):
        product = products[x]
        image = fetchProductImages(db, product.id)
        images.append(image[0].image_url)

        req = {
            "product_id": product.id
        }

        res = fetchSustainabilityRatings(req, db)
        rating.append(res.get("rating",0))
        

    return {
        "status": 200,
        "message": "Success",
        "data": products,
        "images": images,
        "rating": rating
    }
