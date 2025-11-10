-- Fix the handle_new_user trigger function to prevent signup errors
-- This function runs automatically when a new user is created in auth.users

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Insert into user_profiles with proper error handling
  INSERT INTO public.user_profiles (
    user_id,
    contact_info,
    social_links,
    attributes,
    biography,
    meta,
    is_admin,
    is_mod
  )
  VALUES (
    NEW.id,
    -- Builds the contact_info object with safe null handling
    jsonb_build_object(
      'name', COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
      'email', COALESCE(NEW.email, ''),
      'phone', COALESCE(NEW.phone, ''),
      'location', '',
      'birthday', null,
      'website', ''
    ),
    -- Builds the social_links object
    jsonb_build_object(
      'instagram', '',
      'twitter', '',
      'linkedin', ''
    ),
    -- Builds the attributes object with empty arrays
    jsonb_build_object(
      'passions', '[]'::jsonb,
      'hobbies', '[]'::jsonb,
      'questions', '[]'::jsonb,
      'interests', '[]'::jsonb,
      'skills', '[]'::jsonb,
      'enneagram', ''
    ),
    -- Builds the biography object
    jsonb_build_object(
      'bio', '',
      'ambitions', '',
      'dreams', '',
      'goals', '',
      'education', '',
      'work', '',
      'relationship_status', '',
      'looking_for', ''
    ),
    -- Builds the meta object with user metadata
    jsonb_build_object(
      'phone', COALESCE(NEW.raw_user_meta_data ->> 'phone', ''),
      'address', COALESCE(NEW.raw_user_meta_data ->> 'address', ''),
      'signup_source', 'web'
    ),
    -- Default admin flags
    false,
    false
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_new_user ON auth.users;
CREATE TRIGGER on_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
