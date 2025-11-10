#!/usr/bin/env python3
"""
Direct script to add age column using Supabase REST API
"""
import requests
import json

# Supabase configuration - replace with actual values
SUPABASE_URL = "https://ixqjqfqjqfqjqfqjqfqj.supabase.co"  # Replace with actual URL
SUPABASE_SERVICE_ROLE_KEY = "your_service_role_key_here"  # Replace with actual service role key

def add_age_column():
    """Add age column using direct SQL execution"""
    
    # Headers for service role access (needed for DDL operations)
    headers = {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': f'Bearer {SUPABASE_SERVICE_ROLE_KEY}',
        'Content-Type': 'application/json'
    }
    
    # SQL to add age column
    sql_query = """
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'detailed_profiles' 
            AND column_name = 'age'
        ) THEN
            ALTER TABLE public.detailed_profiles ADD COLUMN age TEXT;
            RAISE NOTICE 'Age column added successfully';
        ELSE
            RAISE NOTICE 'Age column already exists';
        END IF;
    END $$;
    """
    
    # Try using the sql RPC function
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/rpc/sql",
        headers=headers,
        json={'query': sql_query}
    )
    
    print(f"Response status: {response.status_code}")
    print(f"Response text: {response.text}")
    
    if response.status_code == 200:
        print("✅ Age column operation completed successfully")
        return True
    else:
        print(f"❌ Failed to add age column")
        return False

def test_age_column():
    """Test if age column exists"""
    headers = {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': f'Bearer {SUPABASE_SERVICE_ROLE_KEY}',
        'Content-Type': 'application/json'
    }
    
    # Try to select age column
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/detailed_profiles?select=age&limit=1",
        headers=headers
    )
    
    if response.status_code == 200:
        print("✅ Age column exists and is accessible")
        return True
    else:
        print(f"❌ Age column test failed: {response.status_code}")
        print(f"Response: {response.text}")
        return False

def main():
    print("🔧 Adding age column to detailed_profiles table...")
    
    if SUPABASE_SERVICE_ROLE_KEY == "your_service_role_key_here":
        print("❌ Please update SUPABASE_SERVICE_ROLE_KEY in the script")
        print("You can find this in your Supabase project settings > API")
        return
    
    # Try to add the column
    add_age_column()
    
    # Test if it worked
    print("\n🔍 Testing age column access...")
    test_age_column()

if __name__ == "__main__":
    main()
