-- Add photos column to detailed_profiles table for photo gallery
ALTER TABLE public.detailed_profiles 
ADD COLUMN photos TEXT[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN public.detailed_profiles.photos IS 'Array of photo URLs for user photo gallery (excluding profile photo)';
