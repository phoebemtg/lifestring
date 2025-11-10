#!/usr/bin/env python3
"""
Test script to check if age column exists and add it if needed
"""
import os
import sys
import requests
import json

# Supabase configuration
SUPABASE_URL = "https://ixqjqfqjqfqjqfqjqfqj.supabase.co"  # Replace with actual URL
SUPABASE_ANON_KEY = os.getenv('VITE_SUPABASE_ANON_KEY', '')

if not SUPABASE_ANON_KEY:
    print("❌ VITE_SUPABASE_ANON_KEY environment variable not set")
    print("Please set it in your environment or .env file")
    sys.exit(1)

def test_age_column():
    """Test if age column exists by trying to select it"""
    headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
        'Content-Type': 'application/json'
    }
    
    # Try to select age column to see if it exists
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/detailed_profiles?select=age&limit=1",
        headers=headers
    )
    
    if response.status_code == 200:
        print("✅ Age column exists in detailed_profiles table")
        return True
    else:
        print(f"❌ Age column does not exist. Status: {response.status_code}")
        print(f"Response: {response.text}")
        return False

def add_age_column():
    """Add age column to detailed_profiles table"""
    headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
        'Content-Type': 'application/json'
    }
    
    # SQL to add age column
    sql = "ALTER TABLE public.detailed_profiles ADD COLUMN IF NOT EXISTS age TEXT;"
    
    # Use the rpc endpoint to execute SQL
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/rpc/sql",
        headers=headers,
        json={'query': sql}
    )
    
    if response.status_code == 200:
        print("✅ Age column added successfully")
        return True
    else:
        print(f"❌ Failed to add age column. Status: {response.status_code}")
        print(f"Response: {response.text}")
        return False

def main():
    print("🔍 Testing age column in detailed_profiles table...")
    
    if not test_age_column():
        print("\n🔧 Attempting to add age column...")
        if add_age_column():
            print("\n🔍 Testing again after adding column...")
            test_age_column()
        else:
            print("\n❌ Could not add age column. You may need to add it manually via Supabase dashboard.")
    
    print("\n✅ Age column test completed!")

if __name__ == "__main__":
    main()
