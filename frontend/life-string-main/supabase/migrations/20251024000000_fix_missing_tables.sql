-- Fix missing tables and RLS policies for data persistence
-- This migration addresses 404 errors and conversation saving issues

-- Create missing house_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.house_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  house_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create missing house_competitions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.house_competitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  house_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  competition_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.house_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.house_competitions ENABLE ROW LEVEL SECURITY;

-- RLS policies for house_events
CREATE POLICY "Anyone can view house events" 
ON public.house_events 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create house events" 
ON public.house_events 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their house events" 
ON public.house_events 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete their house events" 
ON public.house_events 
FOR DELETE 
USING (auth.uid() = created_by);

-- RLS policies for house_competitions
CREATE POLICY "Anyone can view house competitions" 
ON public.house_competitions 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create house competitions" 
ON public.house_competitions 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their house competitions" 
ON public.house_competitions 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete their house competitions" 
ON public.house_competitions 
FOR DELETE 
USING (auth.uid() = created_by);

-- Fix strings table RLS policies (drop existing conflicting policies first)
DROP POLICY IF EXISTS "Users can manage their own posts." ON public.strings;

-- Create comprehensive RLS policies for strings table
CREATE POLICY "Anyone can view strings" 
ON public.strings 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own strings" 
ON public.strings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own strings" 
ON public.strings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own strings" 
ON public.strings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Ensure strings table has RLS enabled
ALTER TABLE public.strings ENABLE ROW LEVEL SECURITY;

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for new tables
CREATE TRIGGER update_house_events_updated_at
BEFORE UPDATE ON public.house_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_house_competitions_updated_at
BEFORE UPDATE ON public.house_competitions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON public.house_events TO authenticated;
GRANT ALL ON public.house_competitions TO authenticated;
GRANT ALL ON public.strings TO authenticated;
GRANT ALL ON public.detailed_profiles TO authenticated;

-- Add tables to realtime publication if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.house_events;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.house_competitions;
    END IF;
END $$;
