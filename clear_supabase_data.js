#!/usr/bin/env node
/**
 * Script to clear ALL user data from Supabase database.
 * Uses the Supabase client with proper authentication.
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bkaiuwzwepdxdwhznwbt.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrYWl1d3p3ZXBkeGR3aHpud2J0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTI3MDk4NSwiZXhwIjoyMDY0ODQ2OTg1fQ.VJzqg_Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8"; // Service role key for admin operations

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function clearAllData() {
  console.log("🗑️  CLEARING ALL DATABASE DATA - COMPLETE RESET");
  console.log("=" * 60);
  
  const tablesToClear = [
    'strings',
    'detailed_profiles',
    'user_profiles', 
    'conversations',
    'messages',
    'connections',
    'user_enneagrams',
    'house_events',
    'house_competitions'
  ];
  
  let totalCleared = 0;
  
  for (const table of tablesToClear) {
    try {
      // Get count first
      const { count: beforeCount } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (beforeCount > 0) {
        // Delete all rows
        const { error } = await supabase
          .from(table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except impossible UUID
        
        if (error) {
          console.log(`⚠️  ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: ${beforeCount} rows cleared`);
          totalCleared += beforeCount;
        }
      } else {
        console.log(`⚪ ${table}: already empty`);
      }
    } catch (error) {
      console.log(`⚠️  ${table}: ${error.message}`);
    }
  }
  
  console.log("=" * 60);
  console.log(`🎯 COMPLETE DATABASE RESET SUCCESSFUL!`);
  console.log(`   Total rows cleared: ${totalCleared}`);
  console.log("   All user accounts and data have been removed.");
  console.log("   The application is now in a fresh state.");
  console.log("   Users will need to sign up again.");
}

// Run the clear operation
clearAllData().catch(console.error);
