-- Add name column to detailed_profiles table
ALTER TABLE public.detailed_profiles 
ADD COLUMN name TEXT;

-- Update existing records to populate name from user_profiles.contact_info
UPDATE public.detailed_profiles 
SET name = (
  SELECT up.contact_info->>'name' 
  FROM public.user_profiles up 
  WHERE up.user_id = detailed_profiles.user_id
)
WHERE name IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.detailed_profiles.name IS 'User full name from sign up or profile update';
