#!/usr/bin/env python3
import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

load_dotenv()

def check_aws_rds():
    """Check what's in AWS RDS database"""
    print('🔍 Checking AWS RDS Database Contents:')
    print('=' * 50)
    
    try:
        aws_url = f"postgresql://{os.getenv('AWS_RDS_USER')}:{os.getenv('AWS_RDS_PASSWORD')}@{os.getenv('AWS_RDS_ENDPOINT')}:{os.getenv('AWS_RDS_PORT', '5432')}/{os.getenv('AWS_RDS_DATABASE')}"
        engine = create_engine(aws_url)
        
        with engine.connect() as conn:
            # Check if tables exist
            result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
            tables = [row[0] for row in result.fetchall()]
            print(f'📋 Tables found: {tables}')
            
            if tables:
                for table in tables:
                    try:
                        result = conn.execute(text(f'SELECT COUNT(*) FROM "{table}"'))
                        count = result.fetchone()[0]
                        print(f'📊 {table}: {count} rows')
                    except Exception as e:
                        print(f'❌ Error counting {table}: {e}')
            else:
                print('❌ No tables found in AWS RDS database')
                
    except Exception as e:
        print(f'❌ Error connecting to AWS RDS: {e}')

def check_supabase():
    """Check what's in Supabase database"""
    print('\n🔍 Checking Supabase Database Contents:')
    print('=' * 50)
    
    try:
        supabase_url = os.getenv('DATABASE_URL')
        if not supabase_url:
            print('❌ DATABASE_URL not found')
            return
            
        engine = create_engine(supabase_url, pool_pre_ping=True, pool_recycle=300, pool_size=1, max_overflow=0)
        
        with engine.connect() as conn:
            # Check if tables exist
            result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
            tables = [row[0] for row in result.fetchall()]
            print(f'📋 Tables found: {tables}')
            
            if tables:
                for table in tables:
                    try:
                        result = conn.execute(text(f'SELECT COUNT(*) FROM "{table}"'))
                        count = result.fetchone()[0]
                        print(f'📊 {table}: {count} rows')
                        
                        # Show sample data for key tables
                        if table in ['products', 'categories', 'sustainability_types'] and count > 0:
                            result = conn.execute(text(f'SELECT * FROM "{table}" LIMIT 3'))
                            rows = result.fetchall()
                            print(f'   📝 Sample data from {table}:')
                            for row in rows:
                                print(f'     {dict(row._mapping)}')
                                
                    except Exception as e:
                        print(f'❌ Error with {table}: {e}')
            else:
                print('❌ No tables found in Supabase database')
                
    except Exception as e:
        print(f'❌ Error connecting to Supabase: {e}')

if __name__ == "__main__":
    check_aws_rds()
    check_supabase()
