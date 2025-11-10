#!/usr/bin/env python3
"""
Add name column to detailed_profiles table
"""
import requests
import json

# Supabase configuration
SUPABASE_URL = "https://bkaiuwzwepdxdwhznwbt.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrYWl1d3p3ZXBkeGR3aHpud2J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNzA5ODUsImV4cCI6MjA2NDg0Njk4NX0.Q953wm_r9CPPYHpZmaE8v2kJQoiByCXpyxzYLskthkA"

# SQL to add name column
sql_commands = [
    "ALTER TABLE public.detailed_profiles ADD COLUMN IF NOT EXISTS name TEXT;",
    """UPDATE public.detailed_profiles 
       SET name = (
         SELECT up.contact_info->>'name' 
         FROM public.user_profiles up 
         WHERE up.user_id = detailed_profiles.user_id
       )
       WHERE name IS NULL;""",
    "COMMENT ON COLUMN public.detailed_profiles.name IS 'User full name from sign up or profile update';"
]

def run_sql(sql):
    """Execute SQL command via Supabase REST API"""
    headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
        'Content-Type': 'application/json'
    }
    
    data = {
        'query': sql
    }
    
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
        headers=headers,
        json=data
    )
    
    return response

if __name__ == "__main__":
    print("Adding name column to detailed_profiles table...")
    
    for i, sql in enumerate(sql_commands, 1):
        print(f"Running command {i}/{len(sql_commands)}...")
        print(f"SQL: {sql[:100]}...")
        
        response = run_sql(sql)
        
        if response.status_code == 200:
            print(f"✅ Command {i} executed successfully")
        else:
            print(f"❌ Command {i} failed: {response.status_code}")
            print(f"Response: {response.text}")
            break
    
    print("Migration completed!")
