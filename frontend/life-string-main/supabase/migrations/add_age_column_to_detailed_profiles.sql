-- Add age column to detailed_profiles table
ALTER TABLE public.detailed_profiles 
ADD COLUMN age TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.detailed_profiles.age IS 'User age as text field for profile display';
