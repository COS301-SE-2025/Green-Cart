#!/usr/bin/env python3
"""
Simple Migration Script: Supabase to AWS RDS
This script uses pg_dump and psql commands directly for migration
"""
import os
import subprocess
import sys
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

class SimpleMigrator:
    def __init__(self):
        self.timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
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
        
        # Files
        self.backup_file = f"migration_backup_{self.timestamp}.sql"
        
        print(f"📡 Source: Supabase")
        print(f"🎯 Target: AWS RDS ({self.rds_endpoint})")
        print(f"📁 Backup file: {self.backup_file}")

    def check_prerequisites(self):
        """Check if pg_dump and psql are available"""
        print("🔍 Checking prerequisites...")
        
        try:
            subprocess.run(["pg_dump", "--version"], capture_output=True, check=True)
            print("✅ pg_dump available")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("❌ pg_dump not found. Please install postgresql-client")
            return False
        
        try:
            subprocess.run(["psql", "--version"], capture_output=True, check=True)
            print("✅ psql available")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("❌ psql not found. Please install postgresql-client")
            return False
        
        return True

    def test_connections(self):
        """Test connections using psql"""
        print("🔍 Testing database connections...")
        
        # Test Supabase
        print("  📡 Testing Supabase connection...")
        try:
            result = subprocess.run([
                "psql", self.supabase_url, "-c", "SELECT version(), current_database();"
            ], capture_output=True, text=True, check=True, timeout=30)
            
            if result.stdout:
                lines = result.stdout.strip().split('\n')
                for line in lines:
                    if "PostgreSQL" in line:
                        print(f"✅ Supabase connected: {line.strip()}")
                        break
            else:
                print("✅ Supabase connected successfully")
                
        except subprocess.TimeoutExpired:
            print("❌ Supabase connection timeout")
            return False
        except subprocess.CalledProcessError as e:
            print(f"❌ Supabase connection failed: {e.stderr}")
            return False
        
        # Test AWS RDS
        print("  🚀 Testing AWS RDS connection...")
        try:
            result = subprocess.run([
                "psql", self.rds_url, "-c", "SELECT version(), current_database();"
            ], capture_output=True, text=True, check=True, timeout=30)
            
            if result.stdout:
                lines = result.stdout.strip().split('\n')
                for line in lines:
                    if "PostgreSQL" in line:
                        print(f"✅ AWS RDS connected: {line.strip()}")
                        break
            else:
                print("✅ AWS RDS connected successfully")
                
        except subprocess.TimeoutExpired:
            print("❌ AWS RDS connection timeout")
            return False
        except subprocess.CalledProcessError as e:
            print(f"❌ AWS RDS connection failed: {e.stderr}")
            return False
        
        return True

    def create_backup(self):
        """Create backup from Supabase"""
        print(f"📦 Creating backup from Supabase...")
        
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
            "--exclude-schema=supabase_functions",
            "--exclude-schema=extensions",
            "--exclude-schema=graphql",
            "--exclude-schema=graphql_public",
            "--exclude-schema=vault",
            "--exclude-schema=pgbouncer",
            "--exclude-table-data=auth.*",
            "--exclude-table-data=storage.*",
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
            
            # Check if file was created
            if os.path.exists(self.backup_file):
                file_size = os.path.getsize(self.backup_file)
                print(f"✅ Backup created: {self.backup_file}")
                print(f"📊 Size: {file_size:,} bytes")
                
                if file_size < 1000:
                    print("⚠️  Warning: Backup file seems small")
                
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
            if e.stderr:
                print(f"   Error: {e.stderr}")
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
        
        cmd = [
            "psql",
            self.rds_url,
            "--file", self.backup_file,
            "--single-transaction",
            "--set", "ON_ERROR_STOP=1",
            "--quiet"
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
            return True
            
        except subprocess.TimeoutExpired:
            print("❌ Restore timed out (10 minutes)")
            return False
        except subprocess.CalledProcessError as e:
            print(f"❌ Restore failed:")
            print(f"   Return code: {e.returncode}")
            if e.stderr:
                print(f"   Error: {e.stderr}")
            return False
        except Exception as e:
            print(f"❌ Restore failed: {e}")
            return False

    def verify_migration(self):
        """Basic verification by checking table counts"""
        print("🔍 Verifying migration...")
        
        # Get table list from Supabase
        try:
            result = subprocess.run([
                "psql", self.supabase_url, "-t", "-c",
                "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
            ], capture_output=True, text=True, check=True, timeout=30)
            
            supabase_tables = [line.strip() for line in result.stdout.strip().split('\n') if line.strip()]
            print(f"📋 Found {len(supabase_tables)} tables to verify")
            
        except Exception as e:
            print(f"❌ Could not get table list from Supabase: {e}")
            return False
        
        # Check each table
        verification_passed = True
        for table in supabase_tables:
            if not table:
                continue
                
            try:
                # Count in Supabase
                result = subprocess.run([
                    "psql", self.supabase_url, "-t", "-c",
                    f"SELECT COUNT(*) FROM {table};"
                ], capture_output=True, text=True, check=True, timeout=30)
                supabase_count = int(result.stdout.strip())
                
                # Count in RDS
                result = subprocess.run([
                    "psql", self.rds_url, "-t", "-c",
                    f"SELECT COUNT(*) FROM {table};"
                ], capture_output=True, text=True, check=True, timeout=30)
                rds_count = int(result.stdout.strip())
                
                if supabase_count == rds_count:
                    print(f"✅ {table}: {rds_count:,} rows")
                else:
                    print(f"⚠️  {table}: Supabase={supabase_count:,}, RDS={rds_count:,}")
                    verification_passed = False
                    
            except Exception as e:
                print(f"❌ Error verifying {table}: {e}")
                verification_passed = False
        
        return verification_passed

    def run_migration(self):
        """Execute the complete migration"""
        print("🚀 Starting Supabase → AWS RDS Migration")
        print("=" * 50)
        
        try:
            # Step 1: Check prerequisites
            if not self.check_prerequisites():
                print("❌ Prerequisites check failed")
                return False
            
            # Step 2: Test connections
            print("\n📡 Step 1: Testing Connections")
            if not self.test_connections():
                print("❌ Connection tests failed")
                return False
            
            # Step 3: Create backup
            print("\n📦 Step 2: Creating Backup")
            if not self.create_backup():
                print("❌ Backup creation failed")
                return False
            
            # Step 4: Restore to RDS
            print("\n🚀 Step 3: Restoring to AWS RDS")
            if not self.restore_to_rds():
                print("❌ Restore failed")
                print(f"💡 Backup file preserved: {self.backup_file}")
                return False
            
            # Step 5: Verify migration
            print("\n🔍 Step 4: Verifying Migration")
            verification_passed = self.verify_migration()
            
            # Summary
            print("\n" + "=" * 50)
            if verification_passed:
                print("✅ Migration Completed Successfully!")
            else:
                print("⚠️  Migration completed with warnings")
            
            print(f"📁 Backup file: {self.backup_file}")
            print(f"⏰ Migration timestamp: {self.timestamp}")
            print("\n🎯 Next Steps:")
            print("1. Update your .env to prioritize AWS RDS")
            print("2. Test your application")
            print("3. Keep the backup file safe")
            
            return True
            
        except KeyboardInterrupt:
            print("\n❌ Migration cancelled by user")
            return False
        except Exception as e:
            print(f"\n❌ Migration failed: {e}")
            return False

if __name__ == "__main__":
    try:
        migrator = SimpleMigrator()
        success = migrator.run_migration()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"❌ Failed to initialize migrator: {e}")
        sys.exit(1)
