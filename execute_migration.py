#!/usr/bin/env python3
"""
Direct Supabase to AWS RDS Migration
Simple script to migrate essential data from Supabase to AWS RDS
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import logging
import sys

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger(__name__)

# Database URLs
SUPABASE_URL = "postgresql://postgres.httrffbdyhzwfocrwxhr:X4wcx62kVzC0V0u6@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
AWS_RDS_URL = "postgresql://postgres:ZpxCQd5vtrNqSW2@greencart-prod-db.c0d4cqq0wff0.us-east-1.rds.amazonaws.com:5432/postgres"

def execute_migration():
    """Execute the migration"""
    logger.info("🚀 Starting migration from Supabase to AWS RDS...")
    
    try:
        # Connect to both databases
        logger.info("📡 Connecting to Supabase...")
        supabase_conn = psycopg2.connect(SUPABASE_URL)
        supabase_cursor = supabase_conn.cursor(cursor_factory=RealDictCursor)
        
        logger.info("📡 Connecting to AWS RDS...")
        aws_conn = psycopg2.connect(AWS_RDS_URL)
        aws_cursor = aws_conn.cursor(cursor_factory=RealDictCursor)
        
        # 1. Migrate Categories
        logger.info("📦 Migrating categories...")
        supabase_cursor.execute("SELECT * FROM categories ORDER BY id")
        categories = supabase_cursor.fetchall()
        
        # Clear existing categories
        aws_cursor.execute("TRUNCATE TABLE categories RESTART IDENTITY CASCADE")
        
        # Insert categories
        for cat in categories:
            aws_cursor.execute("""
                INSERT INTO categories (id, name, description) 
                OVERRIDING SYSTEM VALUE
                VALUES (%s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET 
                    name = EXCLUDED.name,
                    description = EXCLUDED.description
            """, (cat['id'], cat['name'], cat['description']))
        
        # Reset sequence
        aws_cursor.execute("SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories))")
        logger.info(f"✅ Migrated {len(categories)} categories")
        
        # 2. Migrate Sustainability Types
        logger.info("🌱 Migrating sustainability types...")
        supabase_cursor.execute("SELECT * FROM sustainability_types ORDER BY id")
        sus_types = supabase_cursor.fetchall()
        
        # Clear existing
        aws_cursor.execute("TRUNCATE TABLE sustainability_types RESTART IDENTITY CASCADE")
        
        # Insert sustainability types
        for st in sus_types:
            aws_cursor.execute("""
                INSERT INTO sustainability_types (id, type_name, importance_level, description, is_active, created_at, updated_at) 
                OVERRIDING SYSTEM VALUE
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET 
                    type_name = EXCLUDED.type_name,
                    importance_level = EXCLUDED.importance_level,
                    description = EXCLUDED.description,
                    is_active = EXCLUDED.is_active,
                    updated_at = EXCLUDED.updated_at
            """, (st['id'], st['type_name'], st['importance_level'], st['description'], st['is_active'], st['created_at'], st['updated_at']))
        
        aws_cursor.execute("SELECT setval('sustainability_types_id_seq', (SELECT MAX(id) FROM sustainability_types))")
        logger.info(f"✅ Migrated {len(sus_types)} sustainability types")
        
        # 3. Migrate Roles
        logger.info("👥 Migrating roles...")
        supabase_cursor.execute("SELECT * FROM roles ORDER BY id")
        roles = supabase_cursor.fetchall()
        
        # Clear existing
        aws_cursor.execute("TRUNCATE TABLE roles RESTART IDENTITY CASCADE")
        
        # Insert roles
        for role in roles:
            aws_cursor.execute("""
                INSERT INTO roles (id, name) 
                OVERRIDING SYSTEM VALUE
                VALUES (%s, %s)
                ON CONFLICT (id) DO UPDATE SET 
                    name = EXCLUDED.name
            """, (role['id'], role['name']))
        
        aws_cursor.execute("SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles))")
        logger.info(f"✅ Migrated {len(roles)} roles")
        
        # 4. Migrate Contact Types
        logger.info("📞 Migrating contact types...")
        supabase_cursor.execute("SELECT * FROM contact_type ORDER BY id")
        contact_types = supabase_cursor.fetchall()
        
        # Clear existing
        aws_cursor.execute("TRUNCATE TABLE contact_type RESTART IDENTITY CASCADE")
        
        # Insert contact types
        for ct in contact_types:
            aws_cursor.execute("""
                INSERT INTO contact_type (id, type) 
                OVERRIDING SYSTEM VALUE
                VALUES (%s, %s)
                ON CONFLICT (id) DO UPDATE SET 
                    type = EXCLUDED.type
            """, (ct['id'], ct['type']))
        
        aws_cursor.execute("SELECT setval('contact_type_id_seq', (SELECT MAX(id) FROM contact_type))")
        logger.info(f"✅ Migrated {len(contact_types)} contact types")
        
        # 5. Clear product-related tables for fresh start
        logger.info("🧹 Clearing product tables for fresh S3 start...")
        tables_to_clear = [
            'product_images', 'sustainability_ratings', 'product_sales', 
            'product_overview', 'cart_items', 'carts', 'products'
        ]
        
        for table in tables_to_clear:
            try:
                aws_cursor.execute(f"TRUNCATE TABLE {table} RESTART IDENTITY CASCADE")
                logger.info(f"✅ Cleared {table}")
            except Exception as e:
                logger.warning(f"Could not clear {table}: {e}")
        
        # 6. Create missing tables 
        logger.info("🔧 Creating missing tables...")
        
        # Create carbon_goals table with proper foreign key
        aws_cursor.execute("""
            CREATE TABLE IF NOT EXISTS carbon_goals (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
                goal_value DECIMAL(10,2) NOT NULL CHECK (goal_value > 0),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                -- Ensure one goal per user per month
                CONSTRAINT unique_user_month UNIQUE (user_id, month),
                
                -- Foreign key to users table
                CONSTRAINT fk_carbon_goals_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        logger.info("✅ Created carbon_goals table")
        
        # Create carbon_goals indexes
        aws_cursor.execute("CREATE INDEX IF NOT EXISTS idx_carbon_goals_user_id ON carbon_goals(user_id)")
        aws_cursor.execute("CREATE INDEX IF NOT EXISTS idx_carbon_goals_user_month ON carbon_goals(user_id, month)")
        
        # Create carbon_goals functions
        aws_cursor.execute("""
            CREATE OR REPLACE FUNCTION update_carbon_goals_updated_at()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql
        """)
        
        aws_cursor.execute("""
            CREATE TRIGGER update_carbon_goals_updated_at
                BEFORE UPDATE ON carbon_goals
                FOR EACH ROW
                EXECUTE FUNCTION update_carbon_goals_updated_at()
        """)
        
        aws_cursor.execute("""
            CREATE OR REPLACE FUNCTION set_carbon_goal(
                p_user_id VARCHAR(36),
                p_month INTEGER,
                p_goal_value DECIMAL(10,2)
            )
            RETURNS BOOLEAN
            LANGUAGE plpgsql
            AS $$
            BEGIN
                IF p_user_id IS NULL OR p_month < 1 OR p_month > 12 OR p_goal_value <= 0 THEN
                    RETURN FALSE;
                END IF;
                
                INSERT INTO carbon_goals (user_id, month, goal_value)
                VALUES (p_user_id, p_month, p_goal_value)
                ON CONFLICT (user_id, month)
                DO UPDATE SET 
                    goal_value = EXCLUDED.goal_value,
                    updated_at = CURRENT_TIMESTAMP;
                
                RETURN TRUE;
            EXCEPTION
                WHEN OTHERS THEN
                    RETURN FALSE;
            END;
            $$
        """)
        
        aws_cursor.execute("""
            CREATE OR REPLACE FUNCTION get_carbon_goal(
                p_user_id VARCHAR(36),
                p_month INTEGER
            )
            RETURNS DECIMAL(10,2)
            LANGUAGE plpgsql
            AS $$
            DECLARE
                goal_value DECIMAL(10,2);
            BEGIN
                SELECT cg.goal_value
                INTO goal_value
                FROM carbon_goals cg
                WHERE cg.user_id = p_user_id
                AND cg.month = p_month;
                
                RETURN COALESCE(goal_value, 75.0);
            END;
            $$
        """)
        
        logger.info("✅ Created carbon_goals functions and triggers")
        
        # 7. Create performance indexes
        logger.info("⚡ Creating performance indexes...")
        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_products_retailer_id ON products(retailer_id)",
            "CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id)",
            "CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id)",
            "CREATE INDEX IF NOT EXISTS idx_sustainability_ratings_product_id ON sustainability_ratings(product_id)",
            "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)"
        ]
        
        for index_sql in indexes:
            try:
                aws_cursor.execute(index_sql)
            except Exception as e:
                logger.warning(f"Index warning: {e}")
        
        logger.info("✅ Created performance indexes")
        
        # Commit all changes
        aws_conn.commit()
        
        # 8. Verification  
        logger.info("🔍 Verifying migration...")
        # Use regular cursor for simple COUNT queries
        verify_cursor = aws_conn.cursor()
        
        verification_queries = [
            ("Categories", "SELECT COUNT(*) FROM categories", 1),  # Should have at least 1
            ("Sustainability Types", "SELECT COUNT(*) FROM sustainability_types", 1),  # Should have at least 1
            ("Roles", "SELECT COUNT(*) FROM roles", 1),  # Should have at least 1  
            ("Contact Types", "SELECT COUNT(*) FROM contact_type", 1),  # Should have at least 1
            ("Products (should be 0)", "SELECT COUNT(*) FROM products", 0),  # Should be exactly 0
            ("Product Images (should be 0)", "SELECT COUNT(*) FROM product_images", 0)  # Should be exactly 0
        ]
        
        for name, query, expected_condition in verification_queries:
            try:
                verify_cursor.execute(query)
                result = verify_cursor.fetchone()
                if result is None:
                    logger.error(f"❌ {name}: Query returned no results")
                    return False
                count = result[0]
                if name.endswith("(should be 0)"):
                    if count == 0:
                        logger.info(f"✅ {name}: {count} rows")
                    else:
                        logger.error(f"❌ {name}: Expected 0 rows, got {count}")
                        return False
                else:
                    if count >= expected_condition:
                        logger.info(f"✅ {name}: {count} rows")
                    else:
                        logger.error(f"❌ {name}: Expected at least {expected_condition} rows, got {count}")
                        return False
            except Exception as e:
                logger.error(f"❌ Error verifying {name}: {str(e)} (type: {type(e).__name__})")
                return False
        
        logger.info("🎉 MIGRATION COMPLETED SUCCESSFULLY!")
        logger.info("")
        logger.info("Next steps:")
        logger.info("1. Test application startup")
        logger.info("2. Test user registration/login")  
        logger.info("3. Test retailer product creation with S3 upload")
        logger.info("4. Verify sustainability ratings work")
        logger.info("5. Test cart and order functionality")
        logger.info("")
        logger.info("🗂️ Product tables are empty and ready for S3-based products")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Migration failed: {e}")
        aws_conn.rollback()
        return False
        
    finally:
        supabase_conn.close()
        aws_conn.close()
        logger.info("🔐 Database connections closed")

if __name__ == "__main__":
    print("=" * 60)
    print("SUPABASE TO AWS RDS MIGRATION")
    print("=" * 60)
    
    success = execute_migration()
    
    if not success:
        print("\n❌ Migration failed! Check the logs above.")
        print("You can rollback by switching to Supabase in .env file")
        sys.exit(1)
