#!/usr/bin/env python3
"""
Simple script to clear all products and their cascading values from the database
DANGER: This will permanently delete ALL products and related data!
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import urllib.parse

# Database connection (adjust if needed)
DATABASE_URL = "postgresql://postgres:admin@localhost:5432/greenCart_db"

def get_db_session():
    """Create database session"""
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal()

def show_current_counts():
    """Show current counts using raw SQL"""
    session = get_db_session()
    
    try:
        print("📊 Current Database Counts:")
        
        # Check products
        result = session.execute(text("SELECT COUNT(*) FROM products"))
        products_count = result.scalar()
        print(f"   Products: {products_count}")
        
        # Check product images
        result = session.execute(text("SELECT COUNT(*) FROM product_images"))
        images_count = result.scalar()
        print(f"   Product Images: {images_count}")
        
        # Check sustainability ratings
        result = session.execute(text("SELECT COUNT(*) FROM sustainability_ratings"))
        sustainability_count = result.scalar()
        print(f"   Sustainability Ratings: {sustainability_count}")
        
        # Check cart items
        result = session.execute(text("SELECT COUNT(*) FROM cart_items"))
        cart_items_count = result.scalar()
        print(f"   Cart Items: {cart_items_count}")
        
        if products_count == 0:
            print("✅ Database is already clean!")
        else:
            print(f"⚠️  Found {products_count} products that can be deleted")
            
    except Exception as e:
        print(f"❌ Error checking counts: {str(e)}")
    finally:
        session.close()

def clear_all_products():
    """Clear all products and related data using raw SQL"""
    print("⚠️  WARNING: This will DELETE ALL products and related data!")
    print("This includes:")
    print("  - All products")
    print("  - All product images") 
    print("  - All sustainability ratings")
    print("  - All cart items")
    print("\nThis action CANNOT be undone!")
    
    confirm = input("\nType 'DELETE ALL PRODUCTS' to confirm: ")
    if confirm != "DELETE ALL PRODUCTS":
        print("❌ Operation cancelled.")
        return
    
    session = get_db_session()
    
    try:
        print("\n🗑️  Starting deletion process...")
        
        # Step 1: Clear cart items (they reference products)
        result = session.execute(text("DELETE FROM cart_items"))
        cart_items_deleted = result.rowcount
        print(f"   Deleted {cart_items_deleted} cart items")
        
        # Step 2: Clear sustainability ratings (foreign key to products)
        result = session.execute(text("DELETE FROM sustainability_ratings"))
        sustainability_deleted = result.rowcount
        print(f"   Deleted {sustainability_deleted} sustainability ratings")
        
        # Step 3: Clear product images (foreign key to products)
        result = session.execute(text("DELETE FROM product_images"))
        images_deleted = result.rowcount
        print(f"   Deleted {images_deleted} product images")
        
        # Step 4: Clear products (main table)
        result = session.execute(text("DELETE FROM products"))
        products_deleted = result.rowcount
        print(f"   Deleted {products_deleted} products")
        
        # Commit all changes
        session.commit()
        
        print("\n✅ ALL PRODUCTS AND RELATED DATA CLEARED SUCCESSFULLY!")
        print(f"   - {products_deleted} products deleted")
        print(f"   - {images_deleted} product images deleted")
        print(f"   - {sustainability_deleted} sustainability ratings deleted")
        print(f"   - {cart_items_deleted} cart items deleted")
        
        # Reset auto-increment counters
        print("\n🔄 Resetting auto-increment counters...")
        try:
            session.execute(text("ALTER SEQUENCE products_id_seq RESTART WITH 1"))
            session.execute(text("ALTER SEQUENCE product_images_id_seq RESTART WITH 1"))
            session.execute(text("ALTER SEQUENCE sustainability_ratings_id_seq RESTART WITH 1"))
            session.commit()
            print("   Auto-increment counters reset to 1")
        except Exception as e:
            print(f"   Note: Could not reset auto-increment: {e}")
        
    except Exception as e:
        print(f"\n❌ ERROR during deletion: {str(e)}")
        session.rollback()
        raise
    finally:
        session.close()

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--show":
        show_current_counts()
    elif len(sys.argv) > 1 and sys.argv[1] == "--force":
        clear_all_products()
    else:
        print("🧹 Product Database Cleaner")
        print("\nUsage:")
        print("  python clear_products_simple.py --show    # Show current counts")
        print("  python clear_products_simple.py --force   # Clear all products")
        print("\nFor safety, use --show first to see what will be deleted")
