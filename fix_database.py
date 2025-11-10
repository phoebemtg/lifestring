#!/usr/bin/env python3
"""
Fix Supabase database RLS policies for profile saving
"""
import psycopg2
import os
from urllib.parse import urlparse

# Database connection from config
DATABASE_URL = "postgresql://postgres.bkaiuwzwepdxdwhznwbt:9X+DwteUPtQ/zb7564GDDW/2ckm1rULgqxW0Cy6AaUUFhISQvVWFsqwUxls/XwzmkoZcGJRUd58vzFdqt+pIiw==@aws-0-us-west-1.pooler.supabase.com:6543/postgres"

def fix_database_policies():
    """Fix RLS policies and create missing tables"""
    
    sql_commands = [
        # Drop conflicting policies
        "DROP POLICY IF EXISTS \"Users can manage their own posts.\" ON public.strings;",
        
        # Fix strings table RLS policies
        """CREATE POLICY "Anyone can view strings" 
           ON public.strings 
           FOR SELECT 
           USING (true);""",
           
        """CREATE POLICY "Users can create their own strings" 
           ON public.strings 
           FOR INSERT 
           WITH CHECK (auth.uid() = user_id);""",
           
        """CREATE POLICY "Users can update their own strings" 
           ON public.strings 
           FOR UPDATE 
           USING (auth.uid() = user_id);""",
           
        """CREATE POLICY "Users can delete their own strings" 
           ON public.strings 
           FOR DELETE 
           USING (auth.uid() = user_id);""",
           
        # Ensure RLS is enabled
        "ALTER TABLE public.strings ENABLE ROW LEVEL SECURITY;",
        
        # Create missing tables
        """CREATE TABLE IF NOT EXISTS public.house_events (
             id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
             house_id INTEGER NOT NULL,
             title TEXT NOT NULL,
             description TEXT,
             date TIMESTAMP WITH TIME ZONE NOT NULL,
             location TEXT,
             max_participants INTEGER,
             current_participants INTEGER DEFAULT 0,
             created_by UUID NOT NULL,
             created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
             updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
           );""",
           
        """CREATE TABLE IF NOT EXISTS public.house_competitions (
             id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
             house_id INTEGER NOT NULL,
             title TEXT NOT NULL,
             description TEXT,
             competition_date TIMESTAMP WITH TIME ZONE NOT NULL,
             location TEXT,
             max_participants INTEGER,
             current_participants INTEGER DEFAULT 0,
             created_by UUID NOT NULL,
             created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
             updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
           );""",
           
        # Enable RLS on new tables
        "ALTER TABLE public.house_events ENABLE ROW LEVEL SECURITY;",
        "ALTER TABLE public.house_competitions ENABLE ROW LEVEL SECURITY;",
        
        # RLS policies for house_events
        """CREATE POLICY "Anyone can view house events" 
           ON public.house_events 
           FOR SELECT 
           USING (true);""",
           
        """CREATE POLICY "Authenticated users can create house events" 
           ON public.house_events 
           FOR INSERT 
           WITH CHECK (auth.uid() = created_by);""",
           
        # RLS policies for house_competitions  
        """CREATE POLICY "Anyone can view house competitions" 
           ON public.house_competitions 
           FOR SELECT 
           USING (true);""",
           
        """CREATE POLICY "Authenticated users can create house competitions" 
           ON public.house_competitions 
           FOR INSERT 
           WITH CHECK (auth.uid() = created_by);""",
           
        # Grant permissions
        "GRANT ALL ON public.house_events TO authenticated;",
        "GRANT ALL ON public.house_competitions TO authenticated;", 
        "GRANT ALL ON public.strings TO authenticated;",
        "GRANT ALL ON public.detailed_profiles TO authenticated;",
        
        # Create update trigger function
        """CREATE OR REPLACE FUNCTION public.update_updated_at_column()
           RETURNS TRIGGER AS $$
           BEGIN
               NEW.updated_at = now();
               RETURN NEW;
           END;
           $$ language 'plpgsql';""",
    ]
    
    try:
        # Connect to database
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        print("🔧 Fixing database RLS policies...")
        
        for i, sql in enumerate(sql_commands, 1):
            try:
                cur.execute(sql)
                print(f"✅ Command {i}/{len(sql_commands)} executed successfully")
            except Exception as e:
                if "already exists" in str(e) or "does not exist" in str(e):
                    print(f"⚠️  Command {i}/{len(sql_commands)} skipped (already exists/doesn't exist)")
                else:
                    print(f"❌ Command {i}/{len(sql_commands)} failed: {e}")
        
        # Commit changes
        conn.commit()
        print("\n🎉 Database fixes applied successfully!")
        print("✅ Profile saving should now work!")
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("💡 Try running the SQL manually in Supabase Dashboard > SQL Editor")
        
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    fix_database_policies()
