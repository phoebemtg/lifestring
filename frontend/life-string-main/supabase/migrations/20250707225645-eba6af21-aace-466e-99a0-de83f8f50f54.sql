-- Add phone and address columns to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN phone text,
ADD COLUMN address text;