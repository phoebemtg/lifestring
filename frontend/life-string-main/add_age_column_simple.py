#!/usr/bin/env python3
"""
Simple script to add age column to detailed_profiles table
"""
import os
import sys
from supabase import create_client, Client

# Get Supabase credentials from environment or use defaults
SUPABASE_URL = os.getenv('VITE_SUPABASE_URL', 'https://ixqjqfqjqfqjqfqjqfqj.supabase.co')
SUPABASE_KEY = os.getenv('VITE_SUPABASE_ANON_KEY', '')

if not SUPABASE_KEY:
    print("❌ VITE_SUPABASE_ANON_KEY environment variable not set")
    sys.exit(1)

def main():
    try:
        # Create Supabase client
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        print("🔧 Adding age column to detailed_profiles table...")
        
        # Execute SQL to add age column
        result = supabase.rpc('sql', {
            'query': 'ALTER TABLE public.detailed_profiles ADD COLUMN IF NOT EXISTS age TEXT;'
        }).execute()
        
        print("✅ Age column added successfully!")
        print("Result:", result)
        
    except Exception as e:
        print(f"❌ Error adding age column: {e}")
        print("This might be expected if the column already exists or if we need to use a different approach.")

if __name__ == "__main__":
    main()
