#!/usr/bin/env python3
"""
Script to add 'Toys & Kids' category to the database
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from app.db.session import get_db
    from app.models.categories import Category
    
    # Get database session
    db = next(get_db())
    
    # Check if 'Toys & Kids' category already exists
    existing_category = db.query(Category).filter(Category.name == 'Toys & Kids').first()
    
    if existing_category:
        print("'Toys & Kids' category already exists in the database.")
        print(f"ID: {existing_category.id}, Name: {existing_category.name}")
    else:
        # Add the new category
        new_category = Category(
            name='Toys & Kids',
            description='Toys, games, and children\'s products for entertainment and education'
        )
        
        db.add(new_category)
        db.commit()
        db.refresh(new_category)
        
        print(f"Successfully added 'Toys & Kids' category to the database.")
        print(f"New category ID: {new_category.id}, Name: {new_category.name}")
    
    # List all categories
    print("\nAll categories in database:")
    print("=" * 40)
    categories = db.query(Category).all()
    for category in categories:
        print(f"ID: {category.id} - {category.name}")
    
    print(f"\nTotal categories: {len(categories)}")
    db.close()
    
except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()
