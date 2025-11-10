-- Add Enneagram type and background color to user profiles
ALTER TABLE public.user_profiles 
ADD COLUMN enneagram_type integer CHECK (enneagram_type >= 1 AND enneagram_type <= 9),
ADD COLUMN background_color text DEFAULT '#3B82F6';

-- Add some sample background colors based on the original house colors
COMMENT ON COLUMN public.user_profiles.background_color IS 'User selected background color theme from house color palettes';
COMMENT ON COLUMN public.user_profiles.enneagram_type IS 'User Enneagram personality type (1-9) determined by quiz';