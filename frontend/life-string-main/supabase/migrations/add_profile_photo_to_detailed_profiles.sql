-- Add profile_photo column to detailed_profiles table
ALTER TABLE public.detailed_profiles 
ADD COLUMN profile_photo TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.detailed_profiles.profile_photo IS 'URL to user profile photo stored in Supabase Storage';
