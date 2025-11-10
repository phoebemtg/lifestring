/**
 * Script to clear user data using the frontend Supabase client.
 * This will clear data that the current user has access to.
 */

// This script should be run in the browser console on the Lifestring app
// Go to https://life-string-main.vercel.app/ and open browser console (F12)
// Then paste and run this code

async function clearAllUserData() {
  console.log("🗑️  CLEARING ALL ACCESSIBLE USER DATA");
  console.log("=" * 50);
  
  // Get the supabase client from the app
  const { supabase } = window;
  
  if (!supabase) {
    console.error("❌ Supabase client not found. Make sure you're on the Lifestring app page.");
    return;
  }
  
  const tablesToClear = [
    'strings',
    'detailed_profiles',
    'user_profiles'
  ];
  
  let totalCleared = 0;
  
  for (const table of tablesToClear) {
    try {
      console.log(`🔄 Clearing ${table}...`);
      
      // Get all data first
      const { data: allData, error: fetchError } = await supabase
        .from(table)
        .select('*');
      
      if (fetchError) {
        console.log(`⚠️  ${table}: ${fetchError.message}`);
        continue;
      }
      
      if (allData && allData.length > 0) {
        // Delete all rows
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .in('id', allData.map(row => row.id));
        
        if (deleteError) {
          console.log(`⚠️  ${table}: ${deleteError.message}`);
        } else {
          console.log(`✅ ${table}: ${allData.length} rows cleared`);
          totalCleared += allData.length;
        }
      } else {
        console.log(`⚪ ${table}: already empty`);
      }
    } catch (error) {
      console.log(`⚠️  ${table}: ${error.message}`);
    }
  }
  
  console.log("=" * 50);
  console.log(`🎯 DATA CLEARING COMPLETE!`);
  console.log(`   Total rows cleared: ${totalCleared}`);
  console.log("   Refresh the page to see changes.");
}

// Instructions for the user
console.log(`
🎯 TO CLEAR ALL USER DATA:

1. Make sure you're logged into the Lifestring app
2. Run this command in the console:
   clearAllUserData()

3. This will clear all data you have access to
`);

// Make the function available globally
window.clearAllUserData = clearAllUserData;
