#!/usr/bin/env python3
import sys
import os
sys.path.append('.')

from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    print("No DATABASE_URL found")
    exit(1)

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("=== SEARCHING FOR 'test' PRODUCT ===")
    
    # Find the most recent 'test' product
    result = conn.execute(text("""
        SELECT id, name, description, price, created_at 
        FROM products 
        WHERE name = 'test' 
        ORDER BY created_at DESC 
        LIMIT 1
    """))
    test_product = result.fetchone()
    
    if test_product:
        product_id, name, description, price, created_at = test_product
        print(f"✅ Found test product:")
        print(f"   ID: {product_id}")
        print(f"   Name: '{name}'")
        print(f"   Description: '{description}'")
        print(f"   Price: R{price}")
        print(f"   Created: {created_at}")
        
        # Check for sustainability ratings
        print(f"\n=== CHECKING SUSTAINABILITY RATINGS FOR PRODUCT {product_id} ===")
        result = conn.execute(text("""
            SELECT sr.value, st.type_name, sr.created_at
            FROM sustainability_ratings sr 
            JOIN sustainability_types st ON sr.type = st.id 
            WHERE sr.product_id = :product_id 
            ORDER BY st.type_name
        """), {"product_id": product_id})
        
        ratings = result.fetchall()
        
        if ratings:
            print(f"✅ Found {len(ratings)} sustainability ratings:")
            for value, type_name, rating_created in ratings:
                print(f"   - {type_name}: {value} (created: {rating_created})")
        else:
            print("❌ NO SUSTAINABILITY RATINGS FOUND")
            print("\nPossible reasons:")
            print("1. Frontend not sending sustainability rating values")
            print("2. Values sent as 0/null and filtered out")
            print("3. Backend mapping issue")
            print("4. Database transaction rollback")
    else:
        print("❌ No product with exact name 'test' found")
        
        # Check for similar products
        result = conn.execute(text("""
            SELECT id, name, created_at 
            FROM products 
            WHERE name ILIKE '%test%' 
            ORDER BY created_at DESC 
            LIMIT 5
        """))
        similar = result.fetchall()
        
        if similar:
            print("\n📋 Products with 'test' in name:")
            for pid, pname, pcreated in similar:
                print(f"   ID {pid}: '{pname}' (created: {pcreated})")
    
    # Show latest products for context
    print(f"\n=== LATEST 5 PRODUCTS (ANY NAME) ===")
    result = conn.execute(text("""
        SELECT id, name, description, created_at 
        FROM products 
        ORDER BY created_at DESC 
        LIMIT 5
    """))
    latest_products = result.fetchall()
    
    for pid, pname, pdesc, pcreated in latest_products:
        print(f"ID {pid}: '{pname}' - {pdesc[:50]}... (created: {pcreated})")
        
        # Quick check for ratings
        result = conn.execute(text("""
            SELECT COUNT(*) 
            FROM sustainability_ratings 
            WHERE product_id = :product_id
        """), {"product_id": pid})
        rating_count = result.fetchone()[0]
        print(f"   └─ Sustainability ratings: {rating_count}")

print("\n✅ Database check completed")
