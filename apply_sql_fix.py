#!/usr/bin/env python3
"""
Apply SQL fixes via Supabase REST API
"""
import requests
import json

# Supabase configuration
SUPABASE_URL = "https://bkaiuwzwepdxdwhznwbt.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrYWl1d3p3ZXBkeGR3aHpud2J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNzA5ODUsImV4cCI6MjA2NDg0Njk4NX0.Q953wm_r9CPPYHpZmaE8v2kJQoiByCXpyxzYLskthkA"

def test_database_access():
    """Test if we can access the database and check current state"""
    
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json"
    }
    
    print("🔍 Testing database access...")
    
    # Test strings table access
    try:
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/strings?limit=1",
            headers=headers
        )
        if response.status_code == 200:
            print("✅ strings table: Accessible")
        else:
            print(f"❌ strings table: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ strings table: {e}")
    
    # Test detailed_profiles table access
    try:
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/detailed_profiles?limit=1",
            headers=headers
        )
        if response.status_code == 200:
            print("✅ detailed_profiles table: Accessible")
        else:
            print(f"❌ detailed_profiles table: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ detailed_profiles table: {e}")
    
    # Test house_events table access
    try:
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/house_events?limit=1",
            headers=headers
        )
        if response.status_code == 200:
            print("✅ house_events table: Accessible")
        elif response.status_code == 404:
            print("⚠️  house_events table: Does not exist (expected)")
        else:
            print(f"❌ house_events table: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ house_events table: {e}")
    
    print("\n📋 Manual Fix Required:")
    print("Since we can't apply SQL directly via API, please:")
    print("1. Go to Supabase Dashboard: https://supabase.com/dashboard")
    print("2. Navigate to: SQL Editor")
    print("3. Copy and paste the SQL from 'fix_database_rls.sql'")
    print("4. Click 'Run' to execute")
    
    print("\n🎯 Key SQL Commands to Run:")
    print("""
-- Fix strings table RLS
DROP POLICY IF EXISTS "Users can manage their own posts." ON public.strings;

CREATE POLICY "Anyone can view strings" 
ON public.strings FOR SELECT USING (true);

CREATE POLICY "Users can create their own strings" 
ON public.strings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own strings" 
ON public.strings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own strings" 
ON public.strings FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS
ALTER TABLE public.strings ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON public.strings TO authenticated;
GRANT ALL ON public.detailed_profiles TO authenticated;
""")

if __name__ == "__main__":
    test_database_access()
