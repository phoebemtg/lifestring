-- Add profile_questions column to detailed_profiles table
ALTER TABLE public.detailed_profiles 
ADD COLUMN profile_questions JSONB DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.detailed_profiles.profile_questions IS 'User answers to profile questions stored as JSONB key-value pairs';

-- Update RLS policies to include the new column (they should already cover it, but just to be safe)
-- The existing policies should already handle this column since they use user_id matching
