#!/usr/bin/env python3
"""
Script to clear all pr        # Step 1: Clear cart items (no foreign key constraint but references products)
        cart_items_count = db.query(CartItem).count()
        if cart_items_count > 0:
            print(f"   Deleting {cart_items_count} cart items...")
            db.query(CartItem).delete()
        
        # Step 2: Clear sustainability ratings (foreign key to products)and their cascading values from the database
DANGER: This will permanently delete ALL products and related data!
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.product import Product
from app.models.product_images import ProductImage
from app.models.sustainability_ratings import SustainabilityRating
from app.models.cart_item import CartItem
# Note: Orders don't directly reference products, they reference carts

def clear_all_products():
    """
    Clear all products and their related data in the correct order
    """
    print("⚠️  WARNING: This will DELETE ALL products and related data!")
    print("This includes:")
    print("  - All products")
    print("  - All product images")
    print("  - All sustainability ratings")
    print("  - All cart items")
    print("  - All order items")
    print("\nThis action CANNOT be undone!")
    
    confirm = input("\nType 'DELETE ALL PRODUCTS' to confirm: ")
    if confirm != "DELETE ALL PRODUCTS":
        print("❌ Operation cancelled.")
        return
    
    # Get database session
    db_gen = get_db()
    db: Session = next(db_gen)
    
    try:
        print("\n🗑️  Starting deletion process...")
        
        # Step 1: Clear cart items (no foreign key constraint but references products)
        cart_items_count = db.query(CartItem).count()
        if cart_items_count > 0:
            print(f"   Deleting {cart_items_count} cart items...")
            db.query(CartItem).delete()
        
        # Step 2: Clear cart items (no foreign key constraint but references products)
        cart_items_count = db.query(CartItem).count()
        if cart_items_count > 0:
            print(f"   Deleting {cart_items_count} cart items...")
            db.query(CartItem).delete()
        
        # Step 3: Clear sustainability ratings (foreign key to products)
        sustainability_count = db.query(SustainabilityRating).count()
        if sustainability_count > 0:
            print(f"   Deleting {sustainability_count} sustainability ratings...")
            db.query(SustainabilityRating).delete()
        
        # Step 3: Clear product images (foreign key to products)
        images_count = db.query(ProductImage).count()
        if images_count > 0:
            print(f"   Deleting {images_count} product images...")
            db.query(ProductImage).delete()
        
        # Step 4: Clear products (main table)
        products_count = db.query(Product).count()
        if products_count > 0:
            print(f"   Deleting {products_count} products...")
            db.query(Product).delete()
        
        # Commit all changes
        db.commit()
        
        print("\n✅ ALL PRODUCTS AND RELATED DATA CLEARED SUCCESSFULLY!")
        print(f"   - {products_count} products deleted")
        print(f"   - {images_count} product images deleted")
        print(f"   - {sustainability_count} sustainability ratings deleted")
        print(f"   - {cart_items_count} cart items deleted")
        
        # Reset auto-increment counters (optional)
        print("\n🔄 Resetting auto-increment counters...")
        try:
            # For PostgreSQL
            db.execute("ALTER SEQUENCE products_id_seq RESTART WITH 1")
            db.execute("ALTER SEQUENCE product_images_id_seq RESTART WITH 1")
            db.execute("ALTER SEQUENCE sustainability_ratings_id_seq RESTART WITH 1")
            db.commit()
            print("   Auto-increment counters reset to 1")
        except Exception as e:
            print(f"   Note: Could not reset auto-increment (might be using different DB): {e}")
        
    except Exception as e:
        print(f"\n❌ ERROR during deletion: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

def show_current_counts():
    """Show current counts of products and related data"""
    db_gen = get_db()
    db: Session = next(db_gen)
    
    try:
        products_count = db.query(Product).count()
        images_count = db.query(ProductImage).count()
        sustainability_count = db.query(SustainabilityRating).count()
        cart_items_count = db.query(CartItem).count()
        
        print("📊 Current Database Counts:")
        print(f"   Products: {products_count}")
        print(f"   Product Images: {images_count}")
        print(f"   Sustainability Ratings: {sustainability_count}")
        print(f"   Cart Items: {cart_items_count}")
        
        if products_count == 0:
            print("✅ Database is already clean!")
        else:
            print(f"⚠️  Found {products_count} products that can be deleted")
            
    except Exception as e:
        print(f"❌ Error checking counts: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--show":
        show_current_counts()
    elif len(sys.argv) > 1 and sys.argv[1] == "--force":
        clear_all_products()
    else:
        print("🧹 Product Database Cleaner")
        print("\nUsage:")
        print("  python clear_products.py --show    # Show current counts")
        print("  python clear_products.py --force   # Clear all products")
        print("\nFor safety, use --show first to see what will be deleted")
