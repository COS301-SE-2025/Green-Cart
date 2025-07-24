import os
import subprocess
from datetime import datetime
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import json

load_dotenv()

class SupabaseToRDSMigrator:
    def __init__(self):
        # Source: Supabase
        self.supabase_url = os.getenv("DATABASE_URL")
        if not self.supabase_url:
            raise ValueError("DATABASE_URL (Supabase) not found in environment")
        
        # Target: AWS RDS
        self.rds_endpoint = os.getenv("AWS_RDS_ENDPOINT")
        self.rds_user = os.getenv("AWS_RDS_USER", "postgres")
        self.rds_password = os.getenv("AWS_RDS_PASSWORD")
        self.rds_database = os.getenv("AWS_RDS_DATABASE", "postgres")
        self.rds_port = os.getenv("AWS_RDS_PORT", "5432")
        
        if not self.rds_endpoint or not self.rds_password:
            raise ValueError("AWS RDS credentials missing. Please set AWS_RDS_ENDPOINT and AWS_RDS_PASSWORD")
        
        self.rds_url = f"postgresql://{self.rds_user}:{self.rds_password}@{self.rds_endpoint}:{self.rds_port}/{self.rds_database}"
        
        # Migration settings
        self.timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.backup_file = f"supabase_to_rds_backup_{self.timestamp}.sql"

    def test_connections(self):
        """Test both source and target connections"""
        print("🔍 Testing database connections...")
        
        # Test Supabase connection
        try:
            supabase_engine = create_engine(self.supabase_url)
            with supabase_engine.connect() as conn:
                result = conn.execute(text("SELECT version(), current_database()"))
                version, db_name = result.fetchone()
                print(f"✅ Supabase connected: {db_name}")
                print(f"   Version: {version.split(',')[0]}")
        except Exception as e:
            print(f"❌ Supabase connection failed: {e}")
            return False
        
        # Test AWS RDS connection
        try:
            rds_engine = create_engine(self.rds_url)
            with rds_engine.connect() as conn:
                result = conn.execute(text("SELECT version(), current_database()"))
                version, db_name = result.fetchone()
                print(f"✅ AWS RDS connected: {db_name}")
                print(f"   Version: {version.split(',')[0]}")
        except Exception as e:
            print(f"❌ AWS RDS connection failed: {e}")
            return False
        
        return True

    def analyze_source_database(self):
        """Analyze source database structure"""
        print("📊 Analyzing source database...")
        
        supabase_engine = create_engine(self.supabase_url)
        analysis = {}
        
        try:
            with supabase_engine.connect() as conn:
                # Get all schemas
                schemas_query = text("""
                    SELECT schema_name 
                    FROM information_schema.schemata 
                    WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
                    ORDER BY schema_name
                """)
                schemas = [row[0] for row in conn.execute(schemas_query)]
                analysis['schemas'] = schemas
                print(f"📁 Schemas found: {', '.join(schemas)}")
                
                # Get tables in public schema
                tables_query = text("""
                    SELECT table_name, table_type
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                    ORDER BY table_name
                """)
                tables = conn.execute(tables_query).fetchall()
                analysis['tables'] = [(t[0], t[1]) for t in tables]
                
                print(f"📋 Tables in public schema:")
                for table_name, table_type in tables:
                    # Count rows
                    try:
                        count_result = conn.execute(text(f"SELECT COUNT(*) FROM public.{table_name}"))
                        row_count = count_result.fetchone()[0]
                        print(f"   ✅ {table_name} ({table_type}): {row_count:,} rows")
                    except Exception as e:
                        print(f"   ⚠️  {table_name} ({table_type}): Error counting - {e}")
                
                return analysis
                
        except Exception as e:
            print(f"❌ Database analysis failed: {e}")
            return None

    def create_backup(self):
        """Create comprehensive backup from Supabase"""
        print(f"📦 Creating backup: {self.backup_file}")
        
        # pg_dump command with Supabase-specific exclusions
        cmd = [
            "pg_dump",
            self.supabase_url,
            "--clean",                    # Include DROP statements
            "--no-owner",                 # Don't include ownership commands
            "--no-privileges",            # Don't include privilege commands
            "--verbose",                  # Verbose output
            "--exclude-schema=auth",      # Exclude Supabase auth schema
            "--exclude-schema=storage",   # Exclude Supabase storage schema
            "--exclude-schema=realtime",  # Exclude Supabase realtime schema
            "--exclude-schema=supabase_functions",  # Exclude Supabase functions
            "--exclude-schema=extensions", # Exclude extensions schema
            "--exclude-schema=graphql",   # Exclude GraphQL schema
            "--exclude-schema=graphql_public", # Exclude GraphQL public schema
            "--exclude-table-data=auth.*", # Exclude auth data
            "--exclude-table-data=storage.*", # Exclude storage data
            "--file", self.backup_file
        ]
        
        try:
            print("🚀 Running pg_dump...")
            result = subprocess.run(
                cmd, 
                capture_output=True, 
                text=True, 
                check=True,
                timeout=300  # 5 minute timeout
            )
            
            # Check if file was created and has content
            if os.path.exists(self.backup_file):
                file_size = os.path.getsize(self.backup_file)
                print(f"✅ Backup created successfully!")
                print(f"📁 File: {self.backup_file}")
                print(f"📊 Size: {file_size:,} bytes")
                
                if file_size < 1000:  # Less than 1KB suggests empty backup
                    print("⚠️  Warning: Backup file seems very small")
                
                return True
            else:
                print("❌ Backup file was not created")
                return False
                
        except subprocess.TimeoutExpired:
            print("❌ Backup timed out (5 minutes)")
            return False
        except subprocess.CalledProcessError as e:
            print(f"❌ pg_dump failed:")
            print(f"   Return code: {e.returncode}")
            print(f"   Error output: {e.stderr}")
            return False
        except Exception as e:
            print(f"❌ Backup creation failed: {e}")
            return False

    def restore_to_rds(self):
        """Restore backup to AWS RDS"""
        print("🚀 Restoring backup to AWS RDS...")
        
        if not os.path.exists(self.backup_file):
            print(f"❌ Backup file not found: {self.backup_file}")
            return False
        
        # psql command to restore
        cmd = [
            "psql",
            self.rds_url,
            "--file", self.backup_file,
            "--single-transaction",  # Use single transaction
            "--set", "ON_ERROR_STOP=1",  # Stop on first error
            "--quiet"  # Reduce output
        ]
        
        try:
            print("📡 Connecting to AWS RDS...")
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True,
                timeout=600  # 10 minute timeout
            )
            
            print("✅ Restore completed successfully!")
            if result.stdout:
                print("📋 Restore output:")
                print(result.stdout[-500:])  # Last 500 chars
            
            return True
            
        except subprocess.TimeoutExpired:
            print("❌ Restore timed out (10 minutes)")
            return False
        except subprocess.CalledProcessError as e:
            print(f"❌ Restore failed:")
            print(f"   Return code: {e.returncode}")
            if e.stderr:
                print(f"   Error output: {e.stderr[-1000:]}")  # Last 1000 chars
            return False
        except Exception as e:
            print(f"❌ Restore failed: {e}")
            return False

    def verify_migration(self):
        """Compare data between Supabase and AWS RDS"""
        print("🔍 Verifying migration...")
        
        tables_to_verify = [
            'users', 'products', 'categories', 'orders', 'carts',
            'product_images', 'sustainability_ratings', 'address',
            'retailer_information', 'charities', 'donations'
        ]
        
        supabase_engine = create_engine(self.supabase_url)
        rds_engine = create_engine(self.rds_url)
        
        verification_results = {}
        
        for table in tables_to_verify:
            try:
                # Count in Supabase
                with supabase_engine.connect() as conn:
                    result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    supabase_count = result.fetchone()[0]
                
                # Count in RDS
                with rds_engine.connect() as conn:
                    result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    rds_count = result.fetchone()[0]
                
                verification_results[table] = {
                    'supabase': supabase_count,
                    'rds': rds_count,
                    'match': supabase_count == rds_count
                }
                
                if supabase_count == rds_count:
                    print(f"✅ {table}: {rds_count:,} rows ✓")
                else:
                    print(f"⚠️  {table}: Supabase={supabase_count:,}, RDS={rds_count:,}")
                    
            except Exception as e:
                print(f"❌ Error verifying {table}: {e}")
                verification_results[table] = {'error': str(e)}
        
        # Save verification results
        results_file = f"migration_verification_{self.timestamp}.json"
        with open(results_file, 'w') as f:
            json.dump(verification_results, f, indent=2)
        
        print(f"📊 Verification results saved to: {results_file}")
        return verification_results

    def run_migration(self):
        """Execute complete migration process"""
        print("🚀 Starting Supabase → AWS RDS PostgreSQL Migration")
        print("=" * 60)
        
        try:
            # Step 1: Test connections
            print("\n📡 Step 1: Testing Connections")
            if not self.test_connections():
                print("❌ Connection tests failed. Aborting migration.")
                return False
            
            # Step 2: Analyze source
            print("\n📊 Step 2: Analyzing Source Database")
            analysis = self.analyze_source_database()
            if not analysis:
                print("❌ Source analysis failed. Aborting migration.")
                return False
            
            # Step 3: Create backup
            print("\n📦 Step 3: Creating Backup")
            if not self.create_backup():
                print("❌ Backup creation failed. Aborting migration.")
                return False
            
            # Step 4: Restore to RDS
            print("\n🚀 Step 4: Restoring to AWS RDS")
            if not self.restore_to_rds():
                print("❌ Restore failed. Migration incomplete.")
                print(f"💡 Backup file preserved: {self.backup_file}")
                return False
            
            # Step 5: Verify migration
            print("\n🔍 Step 5: Verifying Migration")
            verification = self.verify_migration()
            
            # Summary
            print("\n" + "=" * 60)
            print("✅ Migration Completed Successfully!")
            print(f"📁 Backup file: {self.backup_file}")
            print(f"⏰ Migration time: {self.timestamp}")
            print("\n🎯 Next Steps:")
            print("1. Update your .env file to use AWS RDS")
            print("2. Test your application thoroughly")
            print("3. Keep the backup file safe")
            print("4. Monitor your AWS costs")
            
            return True
            
        except Exception as e:
            print(f"\n❌ Migration failed with error: {e}")
            return False

if __name__ == "__main__":
    migrator = SupabaseToRDSMigrator()
    success = migrator.run_migration()
    exit(0 if success else 1)