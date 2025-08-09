from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.utilities.stock_utils import sync_stock_status

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.post("/sync-stock-status")
def sync_all_stock_status(db: Session = Depends(get_db)):
    """
    Admin endpoint to sync stock status for all products.
    This will update the in_stock field based on actual quantity values.
    """
    updated_count = sync_stock_status(db)
    
    return {
        "status": 200,
        "message": f"Stock status synchronized for {updated_count} products",
        "updated_count": updated_count
    }

@router.post("/sync-stock-status/{product_id}")
def sync_product_stock_status(product_id: int, db: Session = Depends(get_db)):
    """
    Admin endpoint to sync stock status for a specific product.
    """
    updated_count = sync_stock_status(db, product_id)
    
    return {
        "status": 200,
        "message": f"Stock status synchronized for product {product_id}",
        "updated": updated_count > 0
    }
