#!/usr/bin/env python3
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = "https://ixqjqfqjqfqjqfqjqfqj.supabase.co"  # Replace with actual URL
SUPABASE_ANON_KEY = os.getenv('VITE_SUPABASE_ANON_KEY')

# SQL to add age column
sql_commands = [
    "ALTER TABLE public.detailed_profiles ADD COLUMN IF NOT EXISTS age TEXT;",
    "COMMENT ON COLUMN public.detailed_profiles.age IS 'User age as text field for profile display';"
]

def run_sql_via_rpc(sql):
    """Execute SQL command via Supabase RPC"""
    headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
        'Content-Type': 'application/json'
    }
    
    # Use the sql function to execute raw SQL
    data = {
        'query': sql
    }
    
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/rpc/sql",
        headers=headers,
        json=data
    )
    
    return response

def main():
    print("Adding age column to detailed_profiles table...")
    
    for i, sql in enumerate(sql_commands, 1):
        print(f"\nExecuting command {i}: {sql}")
        response = run_sql_via_rpc(sql)
        
        if response.status_code == 200:
            print(f"✅ Command {i} executed successfully")
        else:
            print(f"❌ Command {i} failed: {response.status_code}")
            print(f"Response: {response.text}")
    
    print("\n🎉 Age column migration completed!")

if __name__ == "__main__":
    main()
