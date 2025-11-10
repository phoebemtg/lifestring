-- Fix the security issues by setting proper search_path for functions

-- Update the existing update_updated_at_column function to have proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

-- Update the make_user_admin function to have proper search_path
CREATE OR REPLACE FUNCTION public.make_user_admin(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
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