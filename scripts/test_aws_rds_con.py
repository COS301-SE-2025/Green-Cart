import os
import psycopg2
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

def test_aws_rds_direct():
    """Test direct connection to AWS RDS using psycopg2"""
    print("🔍 Testing AWS RDS Connection...")
    
    # Get credentials from environment
    endpoint = os.getenv("AWS_RDS_ENDPOINT")
    port = os.getenv("AWS_RDS_PORT", "5432")
    user = os.getenv("AWS_RDS_USER", "postgres")
    password = os.getenv("AWS_RDS_PASSWORD")
    database = os.getenv("AWS_RDS_DATABASE", "postgres")
    
    if not endpoint or endpoint == "your-rds-instance.xxxxx.us-east-1.rds.amazonaws.com":
        print("❌ AWS RDS endpoint not configured properly")
        return False
    
    if not password or password == "your-secure-rds-password":
        print("❌ AWS RDS password not set")
        return False
    
    print(f"📡 Connecting to: {endpoint}:{port}")
    print(f"👤 User: {user}")
    print(f"🗄️  Database: {database}")
    
    try:
        # Test with psycopg2
        connection = psycopg2.connect(
            host=endpoint,
            port=port,
            user=user,
            password=password,
            database=database,
            sslmode='require',
            connect_timeout=30
        )
        
        cursor = connection.cursor()
        
        # Test basic queries
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        print(f"✅ PostgreSQL Version: {version.split(',')[0]}")
        
        cursor.execute("SELECT current_database();")
        current_db = cursor.fetchone()[0]
        print(f"✅ Current Database: {current_db}")
        
        cursor.execute("SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';")
        table_count = cursor.fetchone()[0]
        print(f"✅ Tables in public schema: {table_count}")
        
        cursor.close()
        connection.close()
        
        print("🎉 AWS RDS connection successful!")
        return True
        
    except psycopg2.OperationalError as e:
        print(f"❌ Connection failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_aws_rds_sqlalchemy():
    """Test AWS RDS connection using SQLAlchemy (same as app)"""
    print("\n🔍 Testing SQLAlchemy Connection...")
    
    endpoint = os.getenv("AWS_RDS_ENDPOINT")
    port = os.getenv("AWS_RDS_PORT", "5432")
    user = os.getenv("AWS_RDS_USER", "postgres")
    password = os.getenv("AWS_RDS_PASSWORD")
    database = os.getenv("AWS_RDS_DATABASE", "postgres")
    
    connection_url = f"postgresql://{user}:{password}@{endpoint}:{port}/{database}"
    
    try:
        engine = create_engine(
            connection_url,
            connect_args={
                "connect_timeout": 30,
                "sslmode": "require"
            }
        )
        
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version(), current_database()"))
            version, db_name = result.fetchone()
            
            print(f"✅ SQLAlchemy connection successful!")
            print(f"📊 Database: {db_name}")
            print(f"🐘 Version: {version.split(',')[0]}")
        
        return True
        
    except Exception as e:
        print(f"❌ SQLAlchemy connection failed: {e}")
        return False

def main():
    print("🚀 AWS RDS Connection Testing")
    print("=" * 50)
    
    # Test 1: Direct connection
    direct_success = test_aws_rds_direct()
    
    # Test 2: SQLAlchemy connection
    sqlalchemy_success = test_aws_rds_sqlalchemy()
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"   Direct connection: {'✅ Pass' if direct_success else '❌ Fail'}")
    print(f"   SQLAlchemy connection: {'✅ Pass' if sqlalchemy_success else '❌ Fail'}")
    
    if direct_success and sqlalchemy_success:
        print("🎉 All tests passed! Your AWS RDS is ready to use.")
        print("\n🎯 Next steps:")
        print("1. Set AWS_RDS_PASSWORD in your .env file")
        print("2. Run migration script to move data from Supabase")
        print("3. Test your application endpoints")
    else:
        print("❌ Some tests failed. Please check your configuration.")

if __name__ == "__main__":
    main()