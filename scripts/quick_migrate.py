#!/usr/bin/env python3
import os
import subprocess
import time
from datetime import datetime
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import json

load_dotenv()

class QuickMigrator:
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
        
        # Migration settings
        self.timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.backup_file = f"quick_migration_{self.timestamp}.sql"

    def create_schema_backup(self):
        """Create schema-only backup first"""
        print("📦 Creating schema backup...")
        
        cmd = [
            "pg_dump",
            self.supabase_url,
            "--schema-only",
            "--clean",
            "--no-owner",
            "--no-privileges",
            "--exclude-schema=auth",
            "--exclude-schema=storage",
            "--exclude-schema=realtime",
            "--exclude-schema=supabase_functions",
            "--exclude-schema=extensions",
            "--exclude-schema=graphql",
            "--exclude-schema=graphql_public",
            "--exclude-schema=vault",
            "--exclude-schema=pgbouncer",
            "--file", f"schema_{self.backup_file}"
        ]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True, timeout=60)
            print(f"✅ Schema backup created: schema_{self.backup_file}")
            return True
        except Exception as e:
            print(f"❌ Schema backup failed: {e}")
            return False

    def create_data_backup(self):
        """Create data-only backup with retry"""
        print("📦 Creating data backup...")
        
        # List of important tables to backup individually
        important_tables = [
            'products', 'categories', 'users', 'orders', 'carts', 'cart_items',
            'product_images', 'sustainability_ratings', 'sustainability_types',
            'retailer_information', 'roles'
        ]
        
        data_files = []
        
        for table in important_tables:
            print(f"  📋 Backing up table: {table}")
            table_file = f"data_{table}_{self.timestamp}.sql"
            
            cmd = [
                "pg_dump",
                self.supabase_url,
                "--data-only",
                "--no-owner",
                "--no-privileges",
                "--table", f"public.{table}",
                "--file", table_file
            ]
            
            for attempt in range(3):  # 3 retry attempts
                try:
                    result = subprocess.run(cmd, capture_output=True, text=True, check=True, timeout=30)
                    print(f"    ✅ {table} backed up successfully")
                    data_files.append(table_file)
                    break
                except subprocess.TimeoutExpired:
                    print(f"    ⚠️  {table} backup attempt {attempt + 1} timed out")
                    if attempt < 2:
                        time.sleep(2)  # Wait before retry
                        continue
                    else:
                        print(f"    ❌ {table} backup failed after 3 attempts")
                except Exception as e:
                    print(f"    ❌ {table} backup failed: {e}")
                    break
        
        return data_files

    def restore_to_rds(self, schema_file, data_files):
        """Restore schema and data to AWS RDS"""
        print("🚀 Restoring to AWS RDS...")
        
        # First restore schema
        print("  📋 Restoring schema...")
        cmd = [
            "psql",
            self.rds_url,
            "--file", schema_file,
            "--single-transaction",
            "--set", "ON_ERROR_STOP=1"
        ]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True, timeout=120)
            print("  ✅ Schema restored successfully")
        except Exception as e:
            print(f"  ❌ Schema restore failed: {e}")
            return False
        
        # Then restore data
        print("  📊 Restoring data...")
        for data_file in data_files:
            if os.path.exists(data_file):
                table_name = data_file.split('_')[1]  # Extract table name
                print(f"    📋 Restoring {table_name}...")
                
                cmd = [
                    "psql",
                    self.rds_url,
                    "--file", data_file,
                    "--single-transaction"
                ]
                
                try:
                    result = subprocess.run(cmd, capture_output=True, text=True, check=True, timeout=60)
                    print(f"    ✅ {table_name} data restored")
                except Exception as e:
                    print(f"    ⚠️  {table_name} data restore had issues: {e}")
                    # Continue with other tables
        
        return True

    def verify_migration(self):
        """Quick verification of key tables"""
        print("🔍 Verifying migration...")
        
        important_tables = ['products', 'users', 'orders', 'categories']
        
        try:
            supabase_engine = create_engine(self.supabase_url)
            rds_engine = create_engine(self.rds_url)
            
            for table in important_tables:
                try:
                    # Count in Supabase
                    with supabase_engine.connect() as conn:
                        result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                        supabase_count = result.fetchone()[0]
                    
                    # Count in RDS
                    with rds_engine.connect() as conn:
                        result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                        rds_count = result.fetchone()[0]
                    
                    if supabase_count == rds_count:
                        print(f"✅ {table}: {rds_count} rows ✓")
                    else:
                        print(f"⚠️  {table}: Supabase={supabase_count}, RDS={rds_count}")
                        
                except Exception as e:
                    print(f"❌ Error verifying {table}: {e}")
                    
        except Exception as e:
            print(f"❌ Verification failed: {e}")
            return False
        
        return True

    def run_quick_migration(self):
        """Execute quick migration with retries"""
        print("🚀 Starting Quick Migration")
        print("=" * 40)
        
        # Step 1: Create schema backup
        if not self.create_schema_backup():
            print("❌ Schema backup failed")
            return False
        
        # Step 2: Create data backups
        data_files = self.create_data_backup()
        if not data_files:
            print("❌ No data files created")
            return False
        
        print(f"📊 Created {len(data_files)} data backup files")
        
        # Step 3: Restore to RDS
        if not self.restore_to_rds(f"schema_{self.backup_file}", data_files):
            print("❌ Restore failed")
            return False
        
        # Step 4: Verify
        self.verify_migration()
        
        print("\n✅ Quick migration completed!")
        print("🎯 Next: Test your application")
        
        return True

if __name__ == "__main__":
    migrator = QuickMigrator()
    migrator.run_quick_migration()
