#!/usr/bin/env python3
"""
Manual Database Migration: Supabase to AWS RDS
This script recreates the database schema and migrates data manually
"""
import os
import psycopg2
from sqlalchemy import create_engine, text, MetaData, Table
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import json
from datetime import datetime

load_dotenv()

class ManualMigrator:
    def __init__(self):
        # Source: Supabase
        self.supabase_url = os.getenv("DATABASE_URL")
        
        # Target: AWS RDS
        self.rds_endpoint = os.getenv("AWS_RDS_ENDPOINT")
        self.rds_user = os.getenv("AWS_RDS_USER", "postgres")
        self.rds_password = os.getenv("AWS_RDS_PASSWORD")
        self.rds_database = os.getenv("AWS_RDS_DATABASE", "postgres")
        self.rds_port = os.getenv("AWS_RDS_PORT", "5432")
        
        self.rds_url = f"postgresql://{self.rds_user}:{self.rds_password}@{self.rds_endpoint}:{self.rds_port}/{self.rds_database}"
        
        print(f"📡 Source: Supabase")
        print(f"🎯 Target: AWS RDS ({self.rds_endpoint})")

    def create_schema_manually(self):
        """Create the database schema manually on AWS RDS"""
        print("🏗️  Creating database schema manually...")
        
        # Connect to AWS RDS
        rds_engine = create_engine(self.rds_url)
        
        # Define schema creation SQL
        schema_sql = """
        -- Create categories table
        CREATE TABLE IF NOT EXISTS categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create sustainability_types table
        CREATE TABLE IF NOT EXISTS sustainability_types (
            id SERIAL PRIMARY KEY,
            type_name VARCHAR(255) NOT NULL UNIQUE,
            description TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create retailer_information table
        CREATE TABLE IF NOT EXISTS retailer_information (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255),
            phone VARCHAR(50),
            address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create roles table
        CREATE TABLE IF NOT EXISTS roles (
            id SERIAL PRIMARY KEY,
            role_name VARCHAR(100) NOT NULL UNIQUE,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create users table
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255),
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            phone VARCHAR(50),
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create products table
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10, 2) NOT NULL,
            quantity INTEGER DEFAULT 0,
            brand VARCHAR(255),
            category_id INTEGER REFERENCES categories(id),
            retailer_id INTEGER REFERENCES retailer_information(id),
            in_stock BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create product_images table
        CREATE TABLE IF NOT EXISTS product_images (
            id SERIAL PRIMARY KEY,
            product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
            image_url TEXT NOT NULL,
            alt_text VARCHAR(255),
            is_primary BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create sustainability_ratings table
        CREATE TABLE IF NOT EXISTS sustainability_ratings (
            id SERIAL PRIMARY KEY,
            product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
            type INTEGER REFERENCES sustainability_types(id),
            value DECIMAL(5, 2) NOT NULL,
            verification BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create carts table
        CREATE TABLE IF NOT EXISTS carts (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create cart_items table
        CREATE TABLE IF NOT EXISTS cart_items (
            id SERIAL PRIMARY KEY,
            cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
            product_id INTEGER REFERENCES products(id),
            quantity INTEGER NOT NULL DEFAULT 1,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create orders table
        CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            total_amount DECIMAL(10, 2),
            order_status VARCHAR(50) DEFAULT 'pending',
            order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            shipping_address TEXT,
            payment_method VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create address table
        CREATE TABLE IF NOT EXISTS address (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            street_address TEXT,
            city VARCHAR(100),
            state VARCHAR(100),
            postal_code VARCHAR(20),
            country VARCHAR(100) DEFAULT 'South Africa',
            is_default BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create user_roles table
        CREATE TABLE IF NOT EXISTS user_roles (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            role_id INTEGER REFERENCES roles(id),
            assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, role_id)
        );

        -- Create contact_type table
        CREATE TABLE IF NOT EXISTS contact_type (
            id SERIAL PRIMARY KEY,
            type_name VARCHAR(100) NOT NULL UNIQUE,
            description TEXT
        );

        -- Create contact_information table
        CREATE TABLE IF NOT EXISTS contact_information (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            contact_type_id INTEGER REFERENCES contact_type(id),
            contact_value VARCHAR(255) NOT NULL,
            is_primary BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create charities table
        CREATE TABLE IF NOT EXISTS charities (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            website VARCHAR(255),
            registration_number VARCHAR(100),
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create donations table
        CREATE TABLE IF NOT EXISTS donations (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            charity_id INTEGER REFERENCES charities(id),
            amount DECIMAL(10, 2) NOT NULL,
            donation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            payment_method VARCHAR(100),
            is_anonymous BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
        CREATE INDEX IF NOT EXISTS idx_products_retailer ON products(retailer_id);
        CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
        CREATE INDEX IF NOT EXISTS idx_sustainability_ratings_product ON sustainability_ratings(product_id);
        CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
        CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);
        CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        """
        
        try:
            with rds_engine.connect() as conn:
                # Execute schema creation
                conn.execute(text(schema_sql))
                conn.commit()
                print("✅ Database schema created successfully!")
                return True
        except Exception as e:
            print(f"❌ Schema creation failed: {e}")
            return False

    def insert_default_data(self):
        """Insert default/essential data"""
        print("📊 Inserting default data...")
        
        rds_engine = create_engine(self.rds_url)
        
        default_data_sql = """
        -- Insert default categories
        INSERT INTO categories (name, description) VALUES 
        ('Electronics', 'Electronic devices and accessories'),
        ('Fashion', 'Clothing and fashion accessories'),
        ('Home & Garden', 'Home and garden products'),
        ('Beauty & Personal Care', 'Beauty and personal care items'),
        ('Sports & Outdoors', 'Sports and outdoor equipment'),
        ('Books & Media', 'Books, movies, and media'),
        ('Food & Beverages', 'Food and beverage products'),
        ('Automotive', 'Automotive parts and accessories'),
        ('Health & Wellness', 'Health and wellness products'),
        ('Baby & Kids', 'Baby and children products')
        ON CONFLICT (name) DO NOTHING;

        -- Insert sustainability types
        INSERT INTO sustainability_types (type_name, description, is_active) VALUES 
        ('Energy Efficiency', 'How energy efficient the product is', TRUE),
        ('Carbon Footprint', 'Environmental impact in terms of carbon emissions', TRUE),
        ('Recyclability', 'How easily the product can be recycled', TRUE),
        ('Durability', 'How long the product is expected to last', TRUE),
        ('Material Sustainability', 'How sustainable the materials used are', TRUE),
        ('Water Usage', 'Amount of water used in production', TRUE),
        ('Packaging', 'Sustainability of product packaging', TRUE),
        ('Transportation', 'Environmental impact of transportation', TRUE),
        ('Fair Trade', 'Whether the product follows fair trade practices', TRUE),
        ('Local Sourcing', 'Whether materials are sourced locally', TRUE)
        ON CONFLICT (type_name) DO NOTHING;

        -- Insert default roles
        INSERT INTO roles (role_name, description) VALUES 
        ('admin', 'Administrator with full access'),
        ('user', 'Regular user with standard access'),
        ('retailer', 'Retailer with product management access')
        ON CONFLICT (role_name) DO NOTHING;

        -- Insert default retailer (needed for existing products)
        INSERT INTO retailer_information (id, name, email, phone, address) VALUES 
        (3, 'Green Cart Demo Retailer', 'demo@greencart.com', '+27123456789', '123 Demo Street, Cape Town, South Africa')
        ON CONFLICT (id) DO NOTHING;

        -- Insert contact types
        INSERT INTO contact_type (type_name, description) VALUES 
        ('email', 'Email address'),
        ('phone', 'Phone number'),
        ('mobile', 'Mobile phone number')
        ON CONFLICT (type_name) DO NOTHING;
        """
        
        try:
            with rds_engine.connect() as conn:
                conn.execute(text(default_data_sql))
                conn.commit()
                print("✅ Default data inserted successfully!")
                return True
        except Exception as e:
            print(f"❌ Default data insertion failed: {e}")
            return False

    def migrate_data_manually(self):
        """Migrate data from Supabase to AWS RDS manually"""
        print("🔄 Migrating data manually...")
        
        # Tables to migrate in order (respecting foreign key constraints)
        migration_order = [
            'categories',
            'sustainability_types', 
            'retailer_information',
            'roles',
            'users',
            'products',
            'product_images',
            'sustainability_ratings',
            'carts',
            'cart_items', 
            'orders',
            'address',
            'user_roles',
            'contact_type',
            'contact_information'
        ]
        
        try:
            supabase_engine = create_engine(self.supabase_url)
            rds_engine = create_engine(self.rds_url)
            
            for table_name in migration_order:
                print(f"  📋 Migrating {table_name}...")
                
                try:
                    # Get data from Supabase
                    with supabase_engine.connect() as conn:
                        result = conn.execute(text(f"SELECT * FROM {table_name}"))
                        rows = result.fetchall()
                        columns = result.keys()
                    
                    if not rows:
                        print(f"    ℹ️  No data in {table_name}")
                        continue
                    
                    # Prepare insert statement
                    column_names = ', '.join(columns)
                    placeholders = ', '.join([f'%({col})s' for col in columns])
                    insert_sql = f"INSERT INTO {table_name} ({column_names}) VALUES ({placeholders}) ON CONFLICT DO NOTHING"
                    
                    # Insert data into AWS RDS
                    with rds_engine.connect() as conn:
                        for row in rows:
                            row_dict = dict(zip(columns, row))
                            conn.execute(text(insert_sql), row_dict)
                        conn.commit()
                    
                    print(f"    ✅ {len(rows)} rows migrated to {table_name}")
                    
                except Exception as e:
                    print(f"    ⚠️  Error migrating {table_name}: {e}")
                    # Continue with other tables
                    continue
            
            return True
            
        except Exception as e:
            print(f"❌ Data migration failed: {e}")
            return False

    def verify_migration(self):
        """Verify the migration was successful"""
        print("🔍 Verifying migration...")
        
        tables_to_check = [
            'categories', 'sustainability_types', 'users', 'products', 
            'product_images', 'sustainability_ratings', 'orders', 'carts'
        ]
        
        try:
            supabase_engine = create_engine(self.supabase_url)
            rds_engine = create_engine(self.rds_url)
            
            all_good = True
            
            for table in tables_to_check:
                try:
                    # Count in Supabase
                    with supabase_engine.connect() as conn:
                        result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                        supabase_count = result.fetchone()[0]
                    
                    # Count in AWS RDS
                    with rds_engine.connect() as conn:
                        result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                        rds_count = result.fetchone()[0]
                    
                    if supabase_count == rds_count:
                        print(f"✅ {table}: {rds_count} rows ✓")
                    else:
                        print(f"⚠️  {table}: Supabase={supabase_count}, RDS={rds_count}")
                        all_good = False
                        
                except Exception as e:
                    print(f"❌ Error checking {table}: {e}")
                    all_good = False
            
            return all_good
            
        except Exception as e:
            print(f"❌ Verification failed: {e}")
            return False

    def run_manual_migration(self):
        """Execute the complete manual migration"""
        print("🚀 Starting Manual Database Migration")
        print("=" * 50)
        
        # Step 1: Create schema
        print("\n🏗️  Step 1: Creating Database Schema")
        if not self.create_schema_manually():
            print("❌ Schema creation failed")
            return False
        
        # Step 2: Insert default data
        print("\n📊 Step 2: Inserting Default Data")
        if not self.insert_default_data():
            print("❌ Default data insertion failed")
            return False
        
        # Step 3: Migrate data
        print("\n🔄 Step 3: Migrating Data")
        if not self.migrate_data_manually():
            print("❌ Data migration failed")
            return False
        
        # Step 4: Verify migration
        print("\n🔍 Step 4: Verifying Migration")
        if self.verify_migration():
            print("\n🎉 Manual migration completed successfully!")
            print("\n🎯 Next steps:")
            print("1. Test your application with AWS RDS")
            print("2. Test image uploads with S3")
            print("3. Verify all functionality works")
            return True
        else:
            print("\n⚠️  Migration completed with some issues")
            print("Please check the warnings above")
            return True

if __name__ == "__main__":
    migrator = ManualMigrator()
    migrator.run_manual_migration()
