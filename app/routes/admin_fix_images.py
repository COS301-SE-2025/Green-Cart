from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db
import os
import logging

router = APIRouter(prefix="/admin", tags=["Admin"])
logger = logging.getLogger(__name__)

@router.post("/fix-image-urls")
async def fix_localhost_image_urls(db: Session = Depends(get_db)):
    """
    Fix localhost:8000 URLs in the database to use production URLs
    """
    try:
        base_url = os.getenv("BASE_URL", "https://api.greencart-cos301.co.za")
        
        # Update product_images table
        update_query = text("""
            UPDATE product_images 
            SET url = REPLACE(url, 'http://localhost:8000', :base_url)
            WHERE url LIKE 'http://localhost:8000%'
        """)
        
        result = db.execute(update_query, {"base_url": base_url})
        db.commit()
        
        rows_updated = result.rowcount
        
        logger.info(f"Updated {rows_updated} image URLs from localhost to {base_url}")
        
        return {
            "status": "success",
            "message": f"Updated {rows_updated} image URLs to use {base_url}",
            "rows_updated": rows_updated
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating image URLs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating image URLs: {str(e)}")

@router.get("/check-localhost-urls")
async def check_localhost_urls(db: Session = Depends(get_db)):
    """
    Check how many localhost URLs exist in the database
    """
    try:
        check_query = text("""
            SELECT COUNT(*) as count 
            FROM product_images 
            WHERE url LIKE 'http://localhost:8000%'
        """)
        
        result = db.execute(check_query)
        count = result.fetchone()[0]
        
        return {
            "localhost_urls_count": count,
            "message": f"Found {count} image URLs using localhost:8000"
        }
        
    except Exception as e:
        logger.error(f"Error checking localhost URLs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error checking URLs: {str(e)}")
