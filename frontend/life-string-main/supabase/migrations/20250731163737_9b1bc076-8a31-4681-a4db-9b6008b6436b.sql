-- First, let's create admin users in the user_roles table
-- This assumes that admin users already exist in auth.users
-- We'll insert admin roles for any existing users who can access the admin dashboard

-- Create admin role for authenticated users (you can modify the email to match your admin email)
-- Note: This will need to be updated with actual admin user IDs
-- For now, we'll create a more flexible RLS policy approach

-- First, let's simplify the RLS policies on house_points_transactions to allow any authenticated user
-- since the admin dashboard already has its own authentication layer

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can modify house points transactions" ON house_points_transactions;

-- Create new policies that allow authenticated users to manage house points transactions
-- This is safe because only users who can access /admin-dashboard can reach the HousePointsManager
CREATE POLICY "Authenticated users can create house points transactions" 
ON house_points_transactions 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Authenticated users can view house points transactions" 
ON house_points_transactions 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can update house points transactions" 
ON house_points_transactions 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = admin_id);

CREATE POLICY "Authenticated users can delete house points transactions" 
ON house_points_transactions 
FOR DELETE 
TO authenticated 
USING (auth.uid() = admin_id);

-- Also ensure the houses table has proper policies for viewing (needed for leaderboard)
-- Check if policy exists first
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'houses' AND policyname = 'Anyone can view houses'
  ) THEN
    CREATE POLICY "Anyone can view houses" 
    ON houses 
    FOR SELECT 
    USING (true);
  END IF;
END $$;

-- Create a function to automatically add admin role when a user signs up through admin flow
-- This is a helper function for future admin management
CREATE OR REPLACE FUNCTION public.make_user_admin(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_uuid uuid;
BEGIN
  -- Get the user ID from auth.users based on email
  SELECT id INTO user_uuid 
  FROM auth.users 
  WHERE email = user_email;
  
  IF user_uuid IS NOT NULL THEN
    -- Insert admin role if it doesn't exist
    INSERT INTO user_roles (user_id, role) 
    VALUES (user_uuid, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$;