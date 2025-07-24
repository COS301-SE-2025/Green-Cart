#!/usr/bin/env python3
"""
Quick Connection Test Script
Tests if AWS RDS is accessible after security group changes
"""
import subprocess
import sys
import time

def test_connection():
    """Test connection to AWS RDS"""
    import os
    from dotenv import load_dotenv
    
    load_dotenv()
    
    rds_endpoint = os.getenv("AWS_RDS_ENDPOINT")
    rds_user = os.getenv("AWS_RDS_USER", "postgres")
    rds_password = os.getenv("AWS_RDS_PASSWORD")
    rds_database = os.getenv("AWS_RDS_DATABASE", "postgres")
    rds_port = os.getenv("AWS_RDS_PORT", "5432")
    
    rds_url = f"postgresql://{rds_user}:{rds_password}@{rds_endpoint}:{rds_port}/{rds_database}"
    
    print(f"🔍 Testing connection to: {rds_endpoint}:{rds_port}")
    print("(Make sure security group is updated first!)")
    
    try:
        result = subprocess.run([
            "psql", rds_url, "-c", "SELECT version(), current_database();"
        ], capture_output=True, text=True, check=True, timeout=10)
        
        print("✅ AWS RDS connection successful!")
        if result.stdout:
            for line in result.stdout.strip().split('\n'):
                if "PostgreSQL" in line:
                    print(f"📊 {line.strip()}")
        return True
        
    except subprocess.TimeoutExpired:
        print("❌ Connection timeout - security group likely not updated yet")
        return False
    except subprocess.CalledProcessError as e:
        print(f"❌ Connection failed: {e.stderr}")
        return False

if __name__ == "__main__":
    print("🚀 AWS RDS Connection Test")
    print("=" * 30)
    
    # Test multiple times with delays
    for attempt in range(5):
        print(f"\nAttempt {attempt + 1}/5:")
        
        if test_connection():
            print("\n🎉 Connection successful! Ready to migrate.")
            sys.exit(0)
        
        if attempt < 4:
            print("⏳ Waiting 10 seconds before retry...")
            time.sleep(10)
    
    print("\n❌ All connection attempts failed.")
    print("Please verify:")
    print("1. Security group has your IP: 137.215.99.58/32")
    print("2. RDS instance is publicly accessible")
    print("3. VPC and subnet configuration is correct")
    sys.exit(1)
