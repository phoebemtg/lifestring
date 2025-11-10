#!/usr/bin/env python3
"""
Add age column to detailed_profiles table in Supabase
"""
import os
import sys
from supabase import create_client, Client

# Supabase configuration
SUPABASE_URL = "https://bkaiuwzwepdxdwhznwbt.supabase.co"  # From the console error
SUPABASE_ANON_KEY = os.getenv('VITE_SUPABASE_PUBLISHABLE_KEY', '')

if not SUPABASE_ANON_KEY:
    print("❌ VITE_SUPABASE_PUBLISHABLE_KEY environment variable not set")
    print("Please set it in your .env file or environment")
    sys.exit(1)

def add_missing_columns(age_exists, birthday_exists):
    """Add missing columns to detailed_profiles table"""
    try:
        # Create Supabase client
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

        success = True

        if not age_exists:
            print("🔧 Adding age column to detailed_profiles table...")

            # SQL to add age column
            sql_query = "ALTER TABLE public.detailed_profiles ADD COLUMN IF NOT EXISTS age TEXT;"

            try:
                # Execute the SQL
                result = supabase.rpc('sql', {'query': sql_query}).execute()
                print("✅ Age column added successfully!")
            except Exception as e:
                print(f"❌ Error adding age column: {e}")
                success = False

        if not birthday_exists:
            print("🔧 Adding birthday column to detailed_profiles table...")

            # SQL to add birthday column (should already exist, but just in case)
            sql_query = "ALTER TABLE public.detailed_profiles ADD COLUMN IF NOT EXISTS birthday DATE;"

            try:
                # Execute the SQL
                result = supabase.rpc('sql', {'query': sql_query}).execute()
                print("✅ Birthday column added successfully!")
            except Exception as e:
                print(f"❌ Error adding birthday column: {e}")
                success = False

        return success

    except Exception as e:
        print(f"❌ Error adding columns: {e}")
        print("This might be expected if we need service role permissions for DDL operations.")
        return False

def test_columns():
    """Test if age and birthday columns exist by querying them"""
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

        print("🔍 Testing age column access...")

        # Try to select age column
        try:
            result = supabase.from_('detailed_profiles').select('age').limit(1).execute()
            print("✅ Age column exists and is accessible!")
            age_exists = True
        except Exception as e:
            print(f"❌ Age column test failed: {e}")
            age_exists = False

        print("🔍 Testing birthday column access...")

        # Try to select birthday column
        try:
            result = supabase.from_('detailed_profiles').select('birthday').limit(1).execute()
            print("✅ Birthday column exists and is accessible!")
            birthday_exists = True
        except Exception as e:
            print(f"❌ Birthday column test failed: {e}")
            birthday_exists = False

        return age_exists, birthday_exists

    except Exception as e:
        print(f"❌ Column test failed: {e}")
        return False, False

def main():
    print("🚀 Database Migration: Adding missing columns to detailed_profiles")
    print("=" * 65)

    # First test if columns already exist
    age_exists, birthday_exists = test_columns()

    if age_exists and birthday_exists:
        print("\n✅ Both age and birthday columns already exist! No migration needed.")
        return

    # Try to add missing columns
    missing_columns = []
    if not age_exists:
        missing_columns.append("age")
    if not birthday_exists:
        missing_columns.append("birthday")

    print(f"\n🔧 Missing columns: {', '.join(missing_columns)}. Attempting to add them...")

    if add_missing_columns(age_exists, birthday_exists):
        print("\n🔍 Testing again after adding columns...")
        test_columns()
    else:
        print("\n❌ Could not add columns with current permissions.")
        print("You may need to use the Supabase dashboard SQL editor and run:")
        if not age_exists:
            print("  ALTER TABLE public.detailed_profiles ADD COLUMN age TEXT;")
        if not birthday_exists:
            print("  ALTER TABLE public.detailed_profiles ADD COLUMN birthday DATE;")

if __name__ == "__main__":
    main()
