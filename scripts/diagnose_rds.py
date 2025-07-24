#!/usr/bin/env python3
import os
import socket
import subprocess
import time
from dotenv import load_dotenv

load_dotenv()

def test_network_connectivity():
    """Test basic network connectivity to RDS endpoint"""
    print("🔍 Diagnosing AWS RDS Connection Issues")
    print("=" * 50)
    
    endpoint = os.getenv("AWS_RDS_ENDPOINT")
    port = int(os.getenv("AWS_RDS_PORT", "5432"))
    
    if not endpoint:
        print("❌ AWS_RDS_ENDPOINT not found in environment")
        return False
    
    print(f"📡 Testing connection to: {endpoint}:{port}")
    
    # Test 1: DNS Resolution
    print("\n1️⃣  DNS Resolution Test...")
    try:
        ip_address = socket.gethostbyname(endpoint)
        print(f"✅ DNS resolved: {endpoint} → {ip_address}")
    except socket.gaierror as e:
        print(f"❌ DNS resolution failed: {e}")
        return False
    
    # Test 2: Port connectivity (telnet-like test)
    print("\n2️⃣  Port Connectivity Test...")
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(10)  # 10 second timeout
        result = sock.connect_ex((endpoint, port))
        sock.close()
        
        if result == 0:
            print(f"✅ Port {port} is open and reachable")
            return True
        else:
            print(f"❌ Port {port} is not reachable (connection refused or timeout)")
            print("🔧 This usually means:")
            print("   - Security group doesn't allow your IP")
            print("   - RDS instance is not publicly accessible")
            print("   - Wrong VPC/subnet configuration")
            return False
            
    except socket.timeout:
        print(f"❌ Connection to {endpoint}:{port} timed out")
        print("🔧 This usually means:")
        print("   - Security group is blocking the connection")
        print("   - Instance is not publicly accessible")
        return False
    except Exception as e:
        print(f"❌ Network test failed: {e}")
        return False

def get_public_ip():
    """Get your current public IP address"""
    print("\n3️⃣  Your Public IP Address...")
    try:
        # Try multiple services
        services = [
            "ifconfig.me",
            "ipinfo.io/ip", 
            "checkip.amazonaws.com"
        ]
        
        for service in services:
            try:
                result = subprocess.run(
                    ["curl", "-s", "--max-time", "5", service], 
                    capture_output=True, 
                    text=True, 
                    check=True
                )
                ip = result.stdout.strip()
                if ip and "." in ip:
                    print(f"✅ Your public IP: {ip}")
                    print(f"🔧 Add this to RDS security group: {ip}/32")
                    return ip
            except:
                continue
        
        print("❌ Could not determine public IP")
        return None
        
    except Exception as e:
        print(f"❌ Error getting public IP: {e}")
        return None

def check_environment():
    """Check environment variables"""
    print("\n4️⃣  Environment Variables Check...")
    
    required_vars = [
        "AWS_RDS_ENDPOINT",
        "AWS_RDS_PORT", 
        "AWS_RDS_USER",
        "AWS_RDS_PASSWORD",
        "AWS_RDS_DATABASE"
    ]
    
    all_good = True
    
    for var in required_vars:
        value = os.getenv(var)
        if value and value not in ["your-rds-instance.xxxxx.us-east-1.rds.amazonaws.com", "your-secure-rds-password"]:
            print(f"✅ {var}: {'*' * len(value) if 'PASSWORD' in var else value}")
        else:
            print(f"❌ {var}: Not set or placeholder value")
            all_good = False
    
    return all_good

def show_security_group_instructions():
    """Show instructions to fix security group"""
    print("\n🔧 How to Fix Security Group:")
    print("=" * 40)
    print("1. Go to AWS Console → RDS → Databases")
    print("2. Click on 'greencart-prod-db'")
    print("3. Go to 'Connectivity & security' tab")
    print("4. Click on the Security Group link (probably 'default')")
    print("5. Click 'Edit inbound rules'")
    print("6. Add new rule:")
    print("   - Type: PostgreSQL")
    print("   - Protocol: TCP")
    print("   - Port: 5432")
    
    public_ip = get_public_ip()
    if public_ip:
        print(f"   - Source: {public_ip}/32")
    else:
        print("   - Source: 0.0.0.0/0 (TEMPORARY - change to your IP later)")
    
    print("7. Click 'Save rules'")
    print("8. Wait 1-2 minutes for changes to take effect")

def main():
    # Check environment first
    if not check_environment():
        print("\n❌ Environment configuration issues found")
        return False
    
    # Test network connectivity
    if test_network_connectivity():
        print("\n🎉 Network connectivity is working!")
        print("🔄 Try running the RDS connection test again")
        return True
    else:
        show_security_group_instructions()
        return False

if __name__ == "__main__":
    main()
