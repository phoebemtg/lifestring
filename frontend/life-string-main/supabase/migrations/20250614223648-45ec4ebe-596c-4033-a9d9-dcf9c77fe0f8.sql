
-- Create a detailed_profiles table to store enhanced profile information
CREATE TABLE public.detailed_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  bio TEXT,
  location TEXT,
  birthday DATE,
  email TEXT,
  phone TEXT,
  website TEXT,
  instagram TEXT,
  twitter TEXT,
  linkedin TEXT,
  passions TEXT[],
  hobbies TEXT[],
  ambitions TEXT,
  dreams TEXT,
  goals TEXT,
  questions TEXT[],
  interests TEXT[],
  skills TEXT[],
  education TEXT,
  work TEXT,
  relationship_status TEXT,
  looking_for TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.detailed_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for detailed_profiles
CREATE POLICY "Users can view their own detailed profile" 
  ON public.detailed_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own detailed profile" 
  ON public.detailed_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own detailed profile" 
  ON public.detailed_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own detailed profile" 
  ON public.detailed_profiles 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Allow users to view other users' detailed profiles (for profile viewing)
CREATE POLICY "Users can view other users' detailed profiles"
  ON public.detailed_profiles
  FOR SELECT
  USING (true);

-- Add missing RLS policies for strings table
ALTER TABLE public.strings ENABLE ROW LEVEL SECURITY;

-- Allow users to view all strings (public posts)
CREATE POLICY "Anyone can view strings"
  ON public.strings
  FOR SELECT
  USING (true);

-- Allow users to create their own strings
CREATE POLICY "Users can create their own strings"
  ON public.strings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own strings
CREATE POLICY "Users can update their own strings"
  ON public.strings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to delete their own strings
CREATE POLICY "Users can delete their own strings"
  ON public.strings
  FOR DELETE
  USING (auth.uid() = user_id);
