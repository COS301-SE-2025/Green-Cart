from sqlalchemy.orm import Session
from app.models.product import Product
from app.models.product_images import ProductImage
from app.services.sustainabilityRatings_service import fetchSustainabilityRatings
from fastapi import HTTPException, status

def fetchRetailerProductImages(db: Session, product_id: int, limit: int = 1):
    if limit == -1:
        return db.query(ProductImage).filter(ProductImage.product_id == product_id).all()

    return db.query(ProductImage).filter(ProductImage.product_id == product_id).limit(limit).all()

def fetchRetailerProducts(retailer_id: int, db: Session):
    products = db.query(Product).filter(Product.retailer_id == retailer_id).all()

    enriched_products = []

    from app.models.orders import Order
    from app.models.cart_item import CartItem
    from app.models.cart import Cart
    from sqlalchemy import func
    valid_states = ["Preparing Order", "Ready for Delivery", "In Transit", "Delivered"]
    for product in products:
        images = fetchRetailerProductImages(db, product.id, limit=1)
        image_url = images[0].image_url if images else None

        req = {
            "product_id": product.id
        }
        sustainability = fetchSustainabilityRatings(req, db)
        rating = sustainability.get("rating", 0)

        valid_carts = db.query(Cart.id).filter(Cart.id.in_(db.query(Order.cart_id).filter(Order.state.in_(valid_states)))).subquery()
        units_sold = db.query(func.sum(CartItem.quantity)).filter(
            CartItem.product_id == product.id,
            CartItem.cart_id.in_(valid_carts)
        ).scalar() or 0
        price = float(product.price) if product and product.price else 0.0
        revenue = units_sold * price

        enriched_products.append({
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "in_stock": product.in_stock,
            "quantity": product.quantity,
            "brand": product.brand,
            "category_id": product.category_id,
            "retailer_id": product.retailer_id,
            "created_at": product.created_at,
            "image_url": image_url,
            "sustainability_rating": rating,
            "units_sold": units_sold,
            "revenue": revenue
        })

    return enriched_products


def deleteRetailerProduct(product_id: int, retailer_id: int, db: Session):
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.retailer_id == retailer_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or does not belong to the retailer."
        )

    # Mark as out of stock
    product.in_stock = False
    product.quantity = 0  # Optional

    db.commit()
    return {"message": "Product marked as out of stock (discontinued)."}

def createRetailerProduct(product_data: dict, db: Session):
    try:
        print(f"=== SERVICE: Processing product creation ===")
        print(f"Product data keys: {list(product_data.keys())}")
        
        # Create new product
        new_product = Product(
            name=product_data["name"],
            description=product_data["description"],
            price=product_data["price"],
            quantity=product_data["quantity"],
            in_stock=product_data["quantity"] > 0,
            brand=product_data["brand"],
            category_id=product_data["category_id"],
            retailer_id=product_data["retailer_id"]
        )
        db.add(new_product)
        db.flush()  # Get the ID without committing
        
        print(f"Product created with ID: {new_product.id}")
        
        # Create sustainability ratings if provided
        sustainability_ratings_added = 0
        if "sustainability_metrics" in product_data:
            metrics = product_data["sustainability_metrics"]
            print(f"=== PROCESSING SUSTAINABILITY METRICS ===")
            print(f"Metrics received: {metrics}")
            print(f"Metrics type: {type(metrics)}")
            
            if metrics:  # Check if metrics is not empty
                # Import sustainability models
                from ..models.sustainability_type import SustainabilityType
                from ..models.sustainability_ratings import SustainabilityRating
                
                # Get sustainability type mappings
                sustainability_types = db.query(SustainabilityType).all()
                print(f"Available sustainability types: {[st.type_name for st in sustainability_types]}")
                
                # Create multiple mapping strategies for robust matching
                type_map = {}
                for st in sustainability_types:
                    # Normalize the type name to lowercase with underscores
                    normalized_name = st.type_name.lower().replace(' ', '_')
                    type_map[normalized_name] = st.id
                    # Also map the exact original name
                    type_map[st.type_name] = st.id
                
                print(f"Type mapping created: {type_map}")
                
                # Process each metric
                for metric_name, value in metrics.items():
                    print(f"Processing metric: {metric_name} = {value} (type: {type(value)})")
                    
                    if value is not None and value != 0:  # Skip None and 0 values
                        type_id = None
                        
                        # Strategy 1: Direct match with metric name
                        if metric_name in type_map:
                            type_id = type_map[metric_name]
                            print(f"Direct match: {metric_name} -> type_id {type_id}")
                        
                        # Strategy 2: Convert underscores to spaces and match
                        elif metric_name.replace('_', ' ') in type_map:
                            type_id = type_map[metric_name.replace('_', ' ')]
                            print(f"Space match: {metric_name} -> type_id {type_id}")
                        
                        # Strategy 3: Title case match
                        elif metric_name.replace('_', ' ').title() in type_map:
                            type_id = type_map[metric_name.replace('_', ' ').title()]
                            print(f"Title case match: {metric_name} -> type_id {type_id}")
                        
                        # Strategy 4: Fuzzy matching based on keywords
                        else:
                            for st in sustainability_types:
                                if metric_name.lower() in st.type_name.lower() or st.type_name.lower() in metric_name.lower():
                                    type_id = st.id
                                    print(f"Fuzzy match: {metric_name} -> {st.type_name} (type_id {type_id})")
                                    break
                        
                        if type_id:
                            new_rating = SustainabilityRating(
                                product_id=new_product.id,
                                type=type_id,
                                value=float(value),
                                verification=False
                            )
                            db.add(new_rating)
                            sustainability_ratings_added += 1
                            print(f"✅ Added sustainability rating: {metric_name} = {value}")
                        else:
                            print(f"❌ No matching type found for metric: {metric_name}")
                    else:
                        print(f"⏭️ Skipping metric {metric_name} (value: {value})")
            else:
                print("⚠️ Sustainability metrics is empty or None")
        else:
            print("⚠️ No sustainability_metrics key in product_data")
        
        print(f"Total sustainability ratings added: {sustainability_ratings_added}")
        print(f"=== END SUSTAINABILITY PROCESSING ===")
        db.commit()
        # Return product with calculated sustainability rating
        req = {"product_id": new_product.id}
        sustainability = fetchSustainabilityRatings(req, db)
        rating = sustainability.get("rating", 0)
        return {
            "id": new_product.id,
            "name": new_product.name,
            "description": new_product.description,
            "price": float(new_product.price),
            "in_stock": new_product.in_stock,
            "quantity": new_product.quantity,
            "brand": new_product.brand,
            "category_id": new_product.category_id,
            "retailer_id": new_product.retailer_id,
            "created_at": new_product.created_at,
            "image_url": None,
            "sustainability_rating": rating
        }
    except Exception as e:
        db.rollback()
        raise e
