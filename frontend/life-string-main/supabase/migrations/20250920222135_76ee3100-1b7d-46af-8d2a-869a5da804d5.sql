-- Enable RLS on user_profiles table and create policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" 
ON public.user_profiles 
FOR DELETE 
USING (auth.uid() = id);