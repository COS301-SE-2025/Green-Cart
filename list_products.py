#!/usr/bin/env python3
"""
Script to list all products in the database
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from app.db.session import get_db
    from app.models.product import Product
    
    # Get database session
    db = next(get_db())
    
    # Query all products
    products = db.query(Product).all()
    
    print('Current products in database:')
    print('=' * 60)
    for product in products:
        print(f'ID: {product.id}')
        print(f'Name: {product.name}')
        print(f'Description: {product.description[:80]}...' if len(product.description) > 80 else f'Description: {product.description}')
        print(f'Price: R{product.price}')
        print(f'Retailer ID: {product.retailer_id}')
        print('-' * 40)
    
    print(f'\nTotal products: {len(products)}')
    db.close()
    
except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()
