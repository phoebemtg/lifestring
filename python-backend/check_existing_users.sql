-- Check what users exist in the database
-- Run this first to see what user IDs we can use

-- Check auth.users table
SELECT id, email FROM auth.users LIMIT 10;

-- Check if there's a public users table
SELECT id, email FROM users LIMIT 10;

-- Check user_profiles
SELECT user_id, contact_info FROM user_profiles LIMIT 10;
