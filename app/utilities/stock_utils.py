"""
Stock utility functions for maintaining data consistency
"""
from sqlalchemy.orm import Session
from app.models.product import Product
import logging

logger = logging.getLogger(__name__)

def sync_stock_status(db: Session, product_id: int = None):
    """
    Synchronize the in_stock boolean field with the actual quantity field.
    If product_id is provided, sync only that product, otherwise sync all products.
    """
    if product_id:
        products = db.query(Product).filter(Product.id == product_id).all()
    else:
        products = db.query(Product).all()
    
    updated_count = 0
    
    for product in products:
        # Determine correct stock status based on quantity
        should_be_in_stock = product.quantity is not None and product.quantity > 0
        
        # Update if there's a mismatch
        if product.in_stock != should_be_in_stock:
            old_status = product.in_stock
            product.in_stock = should_be_in_stock
            updated_count += 1
            
            logger.info(f"Updated product {product.id} ({product.name}): "
                       f"quantity={product.quantity}, in_stock: {old_status} -> {should_be_in_stock}")
    
    if updated_count > 0:
        db.commit()
        logger.info(f"Synced stock status for {updated_count} products")
    
    return updated_count

def is_product_available(product: Product, requested_quantity: int = 1) -> tuple[bool, str]:
    """
    Check if a product is available for the requested quantity.
    Returns (is_available, reason_if_not_available)
    """
    if product.quantity is None or product.quantity <= 0:
        return False, f"Product '{product.name}' is out of stock"
    
    if product.quantity < requested_quantity:
        return False, f"Not enough stock for '{product.name}'. Available: {product.quantity}, Requested: {requested_quantity}"
    
    if not product.in_stock:
        # This might be a data inconsistency - log it
        logger.warning(f"Product {product.id} has quantity {product.quantity} but in_stock is False")
        return False, f"Product '{product.name}' is marked as out of stock"
    
    return True, ""

def update_product_stock(db: Session, product_id: int, quantity_change: int):
    """
    Update product stock and automatically sync the in_stock status.
    quantity_change can be positive (restocking) or negative (selling).
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise ValueError(f"Product with ID {product_id} not found")
    
    # Update quantity
    if product.quantity is None:
        product.quantity = 0
    
    new_quantity = product.quantity + quantity_change
    
    # Ensure quantity doesn't go below 0
    product.quantity = max(0, new_quantity)
    
    # Update stock status
    product.in_stock = product.quantity > 0
    
    db.commit()
    
    logger.info(f"Updated product {product.id} stock: quantity={product.quantity}, in_stock={product.in_stock}")
    
    return product
