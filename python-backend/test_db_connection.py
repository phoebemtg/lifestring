#!/usr/bin/env python3
"""
Test script to verify database connection and troubleshoot issues.
"""
import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_database_connection():
    """Test the database connection with detailed error reporting."""
    
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ ERROR: DATABASE_URL environment variable not found")
        return False
    
    print(f"🔍 Testing connection to: {database_url.split('@')[1] if '@' in database_url else 'Unknown'}")
    
    try:
        # Create engine with connection timeout
        engine = create_engine(
            database_url,
            pool_pre_ping=True,
            pool_timeout=10,
            pool_recycle=3600,
            echo=False
        )
        
        # Test connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"✅ Database connection successful!")
            print(f"📊 PostgreSQL version: {version}")
            
            # Test basic queries
            result = conn.execute(text("SELECT current_database(), current_user"))
            db_info = result.fetchone()
            print(f"🗄️  Database: {db_info[0]}")
            print(f"👤 User: {db_info[1]}")
            
            # Test if we can access tables
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                LIMIT 5
            """))
            tables = result.fetchall()
            print(f"📋 Available tables: {[t[0] for t in tables]}")
            
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        
        # Provide specific troubleshooting advice
        error_str = str(e).lower()
        if "wrong password" in error_str:
            print("\n🔧 TROUBLESHOOTING:")
            print("1. Check your Supabase dashboard for the correct password")
            print("2. Go to Settings → Database → Connection string")
            print("3. Copy the URI connection string")
            print("4. Update your .env file with the correct DATABASE_URL")
            
        elif "timeout" in error_str or "connection" in error_str:
            print("\n🔧 TROUBLESHOOTING:")
            print("1. Check your internet connection")
            print("2. Verify Supabase project is active")
            print("3. Check if IP restrictions are enabled in Supabase")
            
        elif "does not exist" in error_str:
            print("\n🔧 TROUBLESHOOTING:")
            print("1. Verify the database name is correct")
            print("2. Check if the Supabase project is properly set up")
            
        return False

def test_supabase_rest_api():
    """Test Supabase REST API as alternative."""
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_ANON_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Supabase REST API credentials not found")
        return False
    
    try:
        import requests
        
        # Test REST API
        headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}"
        }
        
        response = requests.get(f"{supabase_url}/rest/v1/", headers=headers, timeout=10)
        
        if response.status_code == 200:
            print("✅ Supabase REST API connection successful!")
            return True
        else:
            print(f"❌ Supabase REST API failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Supabase REST API test failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting database connection tests...\n")
    
    # Test direct database connection
    print("=" * 50)
    print("Testing PostgreSQL Database Connection")
    print("=" * 50)
    db_success = test_database_connection()
    
    print("\n" + "=" * 50)
    print("Testing Supabase REST API")
    print("=" * 50)
    api_success = test_supabase_rest_api()
    
    print("\n" + "=" * 50)
    print("SUMMARY")
    print("=" * 50)
    print(f"Database Connection: {'✅ Working' if db_success else '❌ Failed'}")
    print(f"Supabase REST API: {'✅ Working' if api_success else '❌ Failed'}")
    
    if not db_success and api_success:
        print("\n💡 RECOMMENDATION: Use Supabase REST API as fallback")
        print("   The AI chat can work with REST API instead of direct database connection")
    elif not db_success and not api_success:
        print("\n⚠️  CRITICAL: Both database and REST API are failing")
        print("   Check your Supabase project status and credentials")
    
    sys.exit(0 if db_success else 1)
