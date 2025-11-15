#!/usr/bin/env python3
"""
Simple script to test database and API connections for Lifestring backend
"""

import os
import sys
import asyncio
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_database_connection():
    """Test direct database connection"""
    print("🔍 Testing database connection...")
    
    try:
        from sqlalchemy import create_engine, text
        
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            print("❌ DATABASE_URL not found in environment variables")
            return False
            
        print(f"📋 Database URL: {database_url[:50]}...")
        
        engine = create_engine(database_url)
        
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1 as test"))
            row = result.fetchone()
            if row and row[0] == 1:
                print("✅ Database connection successful")
                return True
            else:
                print("❌ Database connection failed - unexpected result")
                return False
                
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

async def test_supabase_rest_api():
    """Test Supabase REST API connection"""
    print("\n🔍 Testing Supabase REST API...")
    
    try:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")
        
        if not supabase_url or not supabase_anon_key:
            print("❌ SUPABASE_URL or SUPABASE_ANON_KEY not found")
            return False
            
        print(f"📋 Supabase URL: {supabase_url}")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{supabase_url}/rest/v1/user_profiles?select=id&limit=1",
                headers={
                    "apikey": supabase_anon_key,
                    "Authorization": f"Bearer {supabase_anon_key}"
                }
            )
            
            if response.status_code == 200:
                print("✅ Supabase REST API connection successful")
                return True
            else:
                print(f"❌ Supabase REST API failed: {response.status_code} - {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ Supabase REST API connection failed: {e}")
        return False

async def test_openai_api():
    """Test OpenAI API connection"""
    print("\n🔍 Testing OpenAI API...")
    
    try:
        openai_api_key = os.getenv("OPENAI_API_KEY")
        
        if not openai_api_key:
            print("❌ OPENAI_API_KEY not found")
            return False
            
        print(f"📋 OpenAI API Key: {openai_api_key[:20]}...")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.openai.com/v1/models",
                headers={
                    "Authorization": f"Bearer {openai_api_key}"
                }
            )
            
            if response.status_code == 200:
                print("✅ OpenAI API connection successful")
                return True
            else:
                print(f"❌ OpenAI API failed: {response.status_code} - {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ OpenAI API connection failed: {e}")
        return False

async def test_local_backend():
    """Test local backend if running"""
    print("\n🔍 Testing local backend...")
    
    try:
        async with httpx.AsyncClient() as client:
            # Test health endpoint
            response = await client.get("http://localhost:8000/health", timeout=5.0)
            
            if response.status_code == 200:
                print("✅ Local backend health check successful")
                
                # Test public AI endpoint
                ai_response = await client.post(
                    "http://localhost:8000/api/ai/public-chat",
                    json={"message": "Hello, this is a test", "user_name": "Test User"},
                    timeout=30.0
                )
                
                if ai_response.status_code == 200:
                    data = ai_response.json()
                    print(f"✅ Local AI endpoint working: {data.get('message', 'No message')[:50]}...")
                    return True
                else:
                    print(f"⚠️  Local AI endpoint failed: {ai_response.status_code}")
                    return False
            else:
                print(f"❌ Local backend health check failed: {response.status_code}")
                return False
                
    except httpx.ConnectError:
        print("⚠️  Local backend not running (this is normal if not started)")
        return False
    except Exception as e:
        print(f"❌ Local backend test failed: {e}")
        return False

async def main():
    """Run all tests"""
    print("🧪 Lifestring Backend Connection Tests")
    print("=" * 50)
    
    results = {}
    
    # Test database connection
    results['database'] = await test_database_connection()
    
    # Test Supabase REST API
    results['supabase_rest'] = await test_supabase_rest_api()
    
    # Test OpenAI API
    results['openai'] = await test_openai_api()
    
    # Test local backend
    results['local_backend'] = await test_local_backend()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print("=" * 50)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
    
    # Recommendations
    print("\n💡 Recommendations:")
    
    if not results['database']:
        print("   • Check your DATABASE_URL in .env file")
        print("   • Verify database credentials in Supabase dashboard")
        print("   • Ensure database is accessible from your network")
    
    if not results['supabase_rest']:
        print("   • Check SUPABASE_URL and SUPABASE_ANON_KEY in .env file")
        print("   • Verify API keys in Supabase dashboard")
    
    if not results['openai']:
        print("   • Check OPENAI_API_KEY in .env file")
        print("   • Verify API key is valid and has credits")
    
    if not results['local_backend']:
        print("   • Start local backend with: uvicorn app.main:app --reload")
        print("   • Check if port 8000 is available")
    
    # Overall status
    critical_tests = ['supabase_rest', 'openai']
    critical_passed = all(results.get(test, False) for test in critical_tests)
    
    if critical_passed:
        print("\n🎉 Critical systems are working! Backend should function properly.")
    else:
        print("\n⚠️  Some critical systems are failing. Backend may not work correctly.")
    
    print("\n✨ Test complete!")

if __name__ == "__main__":
    asyncio.run(main())
