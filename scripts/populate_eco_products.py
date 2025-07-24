#!/usr/bin/env python3
"""
Script to populate AWS RDS database with eco-friendly products and sustainability data
"""
import os
import sys
from decimal import Decimal
from datetime import datetime
import random

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection for AWS RDS
def get_aws_db_url():
    host = os.getenv('AWS_RDS_ENDPOINT')  # Changed from AWS_RDS_HOST to AWS_RDS_ENDPOINT
    user = os.getenv('AWS_RDS_USER') 
    password = os.getenv('AWS_RDS_PASSWORD')
    database = os.getenv('AWS_RDS_DATABASE')
    port = os.getenv('AWS_RDS_PORT', '5432')
    
    return f"postgresql://{user}:{password}@{host}:{port}/{database}"

class EcoProductPopulator:
    def __init__(self):
        self.db_url = get_aws_db_url()
        self.engine = create_engine(self.db_url)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        
    def populate_base_data(self):
        """Populate categories and check sustainability types"""
        print("🌱 Populating base data (categories)...")
        
        with self.SessionLocal() as db:
            # Categories for eco-friendly products
            categories = [
                (1, "Organic Food", "Certified organic food products"),
                (2, "Sustainable Fashion", "Eco-friendly clothing and accessories"),
                (3, "Green Home & Garden", "Sustainable home and garden products"),
                (4, "Renewable Energy", "Solar panels, wind turbines, and energy-efficient appliances"),
                (5, "Eco-Friendly Personal Care", "Natural and organic personal care products"),
                (6, "Sustainable Electronics", "Energy-efficient and eco-friendly electronics"),
                (7, "Zero Waste Products", "Products that promote zero waste lifestyle"),
                (8, "Sustainable Transportation", "Electric vehicles, bikes, and eco-friendly transportation"),
                (9, "Green Building Materials", "Sustainable construction and building materials"),
                (10, "Eco-Friendly Packaging", "Biodegradable and recyclable packaging solutions")
            ]
            
            # Insert categories
            for cat_id, name, description in categories:
                db.execute(text("""
                    INSERT INTO categories (id, name, description) 
                    VALUES (:id, :name, :description) 
                    ON CONFLICT (id) DO UPDATE SET 
                        name = EXCLUDED.name, 
                        description = EXCLUDED.description
                """), {"id": cat_id, "name": name, "description": description})
            
            # Check existing sustainability types
            result = db.execute(text("SELECT id, type_name FROM sustainability_types ORDER BY id"))
            existing_types = result.fetchall()
            print("📊 Existing sustainability types:")
            for type_id, type_name in existing_types:
                print(f"  {type_id}: {type_name}")
            
            db.commit()
            print("✅ Base data verified/updated successfully!")

    def create_eco_products(self):
        """Create eco-friendly products with realistic sustainability ratings"""
        print("🌍 Creating eco-friendly products...")
        
        eco_products = [
            # Organic Food (Category 1)
            {
                "name": "Organic Quinoa 1kg",
                "description": "Premium organic quinoa, sustainably grown without pesticides. Rich in protein and essential amino acids.",
                "price": Decimal("24.99"),
                "brand": "Green Fields Organic",
                "category_id": 1,
                "quantity": 150,
                "image_urls": ["https://greencart-images-cos-301.s3.amazonaws.com/organic-quinoa.jpg"],
                "sustainability": {1: 85.0, 2: 90.0, 3: 95.0, 4: 88.0, 5: 95.0, 6: 78.0, 7: 95.0, 8: 85.0, 9: 92.0, 10: 85.0}
            },
            {
                "name": "Organic Coconut Oil 500ml",
                "description": "Cold-pressed organic coconut oil in recyclable glass jar. Perfect for cooking and skincare.",
                "price": Decimal("18.50"),
                "brand": "Pure Nature",
                "category_id": 1,
                "quantity": 200,
                "image_urls": ["https://greencart-images-cos-301.s3.amazonaws.com/coconut-oil.jpg"],
                "sustainability": {1: 80.0, 2: 88.0, 3: 92.0, 4: 90.0, 5: 94.0, 6: 85.0, 7: 95.0, 8: 75.0, 9: 90.0, 10: 75.0}
            },
            
            # Sustainable Fashion (Category 2)
            {
                "name": "Organic Cotton T-Shirt",
                "description": "100% organic cotton t-shirt made from GOTS certified cotton. Comfortable, breathable, and ethically produced.",
                "price": Decimal("35.00"),
                "brand": "EcoThread",
                "category_id": 2,
                "quantity": 75,
                "image_urls": ["https://greencart-images-cos-301.s3.amazonaws.com/organic-tshirt.jpg"],
                "sustainability": {1: 82.0, 2: 85.0, 3: 88.0, 4: 92.0, 5: 96.0, 6: 80.0, 7: 90.0, 8: 70.0, 9: 95.0, 10: 70.0}
            },
            {
                "name": "Recycled Polyester Jacket",
                "description": "Weather-resistant jacket made from 100% recycled plastic bottles. Durable and eco-friendly outdoor wear.",
                "price": Decimal("89.99"),
                "brand": "Green Outdoor",
                "category_id": 2,
                "quantity": 45,
                "image_urls": ["https://greencart-images-cos-301.s3.amazonaws.com/recycled-jacket.jpg"],
                "sustainability": {1: 78.0, 2: 92.0, 3: 95.0, 4: 95.0, 5: 90.0, 6: 88.0, 7: 85.0, 8: 65.0, 9: 85.0, 10: 65.0}
            },
            
            # Green Home & Garden (Category 3)
            {
                "name": "Bamboo Kitchen Utensil Set",
                "description": "Complete kitchen utensil set made from sustainably harvested bamboo. Includes spatula, spoon, fork, and tongs.",
                "price": Decimal("28.99"),
                "brand": "Bamboo Living",
                "category_id": 3,
                "quantity": 120,
                "image_urls": ["https://greencart-images-cos-301.s3.amazonaws.com/bamboo-utensils.jpg"],
                "sustainability": {1: 88.0, 2: 95.0, 3: 85.0, 4: 90.0, 5: 98.0, 6: 92.0, 7: 95.0, 8: 85.0, 9: 88.0, 10: 85.0}
            },
            {
                "name": "Solar Garden Lights Set",
                "description": "Set of 6 solar-powered LED garden lights. Automatically charges during day and illuminates at night.",
                "price": Decimal("45.00"),
                "brand": "SolarGlow",
                "category_id": 3,
                "quantity": 80,
                "image_urls": ["https://greencart-images-cos-301.s3.amazonaws.com/solar-lights.jpg"],
                "sustainability": {1: 98.0, 2: 96.0, 3: 82.0, 4: 88.0, 5: 85.0, 6: 100.0, 7: 90.0, 8: 75.0, 9: 80.0, 10: 75.0}
            },
            
            # Renewable Energy (Category 4)
            {
                "name": "Portable Solar Panel 100W",
                "description": "High-efficiency monocrystalline solar panel perfect for camping, RVs, and emergency power backup.",
                "price": Decimal("199.99"),
                "brand": "SunPower Tech",
                "category_id": 4,
                "quantity": 25,
                "image_urls": ["https://greencart-images-cos-301.s3.amazonaws.com/solar-panel.jpg"],
                "sustainability": {1: 100.0, 2: 98.0, 3: 85.0, 4: 92.0, 5: 88.0, 6: 95.0, 7: 85.0, 8: 70.0, 9: 85.0, 10: 70.0}
            },
            
            # Eco-Friendly Personal Care (Category 5)
            {
                "name": "Natural Shampoo Bar",
                "description": "Plastic-free shampoo bar made with organic ingredients. Suitable for all hair types, long-lasting.",
                "price": Decimal("12.99"),
                "brand": "Pure Essence",
                "category_id": 5,
                "quantity": 180,
                "image_urls": ["https://greencart-images-cos-301.s3.amazonaws.com/shampoo-bar.jpg"],
                "sustainability": {1: 85.0, 2: 90.0, 3: 98.0, 4: 88.0, 5: 96.0, 6: 88.0, 7: 98.0, 8: 80.0, 9: 90.0, 10: 80.0}
            },
            {
                "name": "Biodegradable Toothbrush Pack",
                "description": "Pack of 4 biodegradable toothbrushes made from bamboo handles and plant-based bristles.",
                "price": Decimal("16.99"),
                "brand": "EcoBrush",
                "category_id": 5,
                "quantity": 160,
                "image_urls": ["https://greencart-images-cos-301.s3.amazonaws.com/bamboo-toothbrush.jpg"],
                "sustainability": {1: 82.0, 2: 94.0, 3: 90.0, 4: 85.0, 5: 97.0, 6: 90.0, 7: 98.0, 8: 88.0, 9: 88.0, 10: 88.0}
            },
            
            # Sustainable Electronics (Category 6)
            {
                "name": "Energy-Efficient LED Bulb Set",
                "description": "Set of 6 smart LED bulbs with 90% energy savings. Dimmable and compatible with smart home systems.",
                "price": Decimal("34.99"),
                "brand": "EcoLumina",
                "category_id": 6,
                "quantity": 100,
                "image_urls": ["https://greencart-images-cos-301.s3.amazonaws.com/led-bulbs.jpg"],
                "sustainability": {1: 98.0, 2: 92.0, 3: 80.0, 4: 95.0, 5: 82.0, 6: 95.0, 7: 85.0, 8: 70.0, 9: 85.0, 10: 70.0}
            },
            
            # Zero Waste Products (Category 7)
            {
                "name": "Reusable Food Storage Wraps",
                "description": "Set of 3 beeswax food wraps in different sizes. Replace plastic wrap with this natural alternative.",
                "price": Decimal("22.50"),
                "brand": "ZeroWaste Home",
                "category_id": 7,
                "quantity": 140,
                "image_urls": ["https://greencart-images-cos-301.s3.amazonaws.com/beeswax-wraps.jpg"],
                "sustainability": {1: 88.0, 2: 96.0, 3: 85.0, 4: 92.0, 5: 95.0, 6: 92.0, 7: 98.0, 8: 88.0, 9: 90.0, 10: 88.0}
            },
            {
                "name": "Stainless Steel Water Bottle",
                "description": "Double-walled vacuum insulated water bottle. Keeps drinks cold for 24h or hot for 12h. BPA-free.",
                "price": Decimal("32.99"),
                "brand": "EcoBottle Co",
                "category_id": 7,
                "quantity": 95,
                "image_urls": ["https://greencart-images-cos-301.s3.amazonaws.com/steel-bottle.jpg"],
                "sustainability": {1: 85.0, 2: 88.0, 3: 95.0, 4: 98.0, 5: 90.0, 6: 88.0, 7: 90.0, 8: 75.0, 9: 88.0, 10: 75.0}
            }
        ]
        
        with self.SessionLocal() as db:
            for i, product in enumerate(eco_products, 1):
                try:
                    # Insert product
                    result = db.execute(text("""
                        INSERT INTO products (name, description, price, brand, category_id, retailer_id, quantity, in_stock, created_at)
                        VALUES (:name, :description, :price, :brand, :category_id, :retailer_id, :quantity, :in_stock, NOW())
                        RETURNING id
                    """), {
                        "name": product["name"],
                        "description": product["description"],
                        "price": product["price"],
                        "brand": product["brand"],
                        "category_id": product["category_id"],
                        "retailer_id": 3,  # Default retailer
                        "quantity": product["quantity"],
                        "in_stock": True
                    })
                    
                    product_id = result.fetchone()[0]
                    print(f"✅ Created product {i}: {product['name']} (ID: {product_id})")
                    
                    # Insert product images
                    for image_url in product["image_urls"]:
                        db.execute(text("""
                            INSERT INTO product_images (product_id, image_url)
                            VALUES (:product_id, :image_url)
                        """), {"product_id": product_id, "image_url": image_url})
                    
                    # Insert sustainability ratings
                    for type_id, value in product["sustainability"].items():
                        db.execute(text("""
                            INSERT INTO sustainability_ratings (product_id, type, value, verification, created_at)
                            VALUES (:product_id, :type, :value, :verification, NOW())
                        """), {
                            "product_id": product_id,
                            "type": type_id,
                            "value": value,
                            "verification": True
                        })
                    
                    db.commit()
                    
                except Exception as e:
                    print(f"❌ Error creating product {product['name']}: {e}")
                    db.rollback()
                    continue
        
        print("🌟 Eco-friendly products created successfully!")

    def verify_data(self):
        """Verify the populated data"""
        print("🔍 Verifying populated data...")
        
        with self.SessionLocal() as db:
            # Check categories
            result = db.execute(text("SELECT COUNT(*) FROM categories"))
            categories_count = result.fetchone()[0]
            print(f"📂 Categories: {categories_count}")
            
            # Check sustainability types
            result = db.execute(text("SELECT COUNT(*) FROM sustainability_types"))
            types_count = result.fetchone()[0]
            print(f"🌱 Sustainability Types: {types_count}")
            
            # Check products
            result = db.execute(text("SELECT COUNT(*) FROM products"))
            products_count = result.fetchone()[0]
            print(f"📦 Products: {products_count}")
            
            # Check product images
            result = db.execute(text("SELECT COUNT(*) FROM product_images"))
            images_count = result.fetchone()[0]
            print(f"🖼️  Product Images: {images_count}")
            
            # Check sustainability ratings
            result = db.execute(text("SELECT COUNT(*) FROM sustainability_ratings"))
            ratings_count = result.fetchone()[0]
            print(f"⭐ Sustainability Ratings: {ratings_count}")
            
            # Show sample product with ratings
            result = db.execute(text("""
                SELECT p.name, p.brand, c.name as category, 
                       AVG(sr.value) as avg_rating, COUNT(sr.id) as rating_count
                FROM products p
                JOIN categories c ON p.category_id = c.id
                LEFT JOIN sustainability_ratings sr ON p.id = sr.product_id
                GROUP BY p.id, p.name, p.brand, c.name
                LIMIT 3
            """))
            
            print("\n🌟 Sample Products:")
            for row in result:
                print(f"  • {row[0]} by {row[1]} ({row[2]}) - Avg Rating: {row[3]:.1f}% ({row[4]} ratings)")

    def run_population(self):
        """Run the complete population process"""
        print("🚀 Starting Eco-Friendly Products Population")
        print("=" * 50)
        
        try:
            # Test connection
            with self.engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("✅ Database connection successful!")
            
            # Populate data
            self.populate_base_data()
            self.create_eco_products()
            self.verify_data()
            
            print("\n🎉 Population completed successfully!")
            print("Your AWS database now contains eco-friendly products with:")
            print("  • Realistic sustainability ratings")
            print("  • Proper category relationships")
            print("  • Product images (placeholder URLs)")
            print("  • Complete sustainability type definitions")
            
        except Exception as e:
            print(f"❌ Population failed: {e}")
            return False
        
        return True

if __name__ == "__main__":
    populator = EcoProductPopulator()
    populator.run_population()
