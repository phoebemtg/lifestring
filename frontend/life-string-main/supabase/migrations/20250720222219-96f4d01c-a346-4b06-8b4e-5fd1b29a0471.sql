-- Create house_clubs table for clubs like chess, dance, future leaders etc
CREATE TABLE public.house_clubs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  house_id integer NOT NULL,
  name text NOT NULL,
  description text,
  category text DEFAULT 'general',
  meeting_time text,
  location text,
  max_members integer,
  current_members integer DEFAULT 0,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.house_clubs ENABLE ROW LEVEL SECURITY;

-- Create policies for house clubs
CREATE POLICY "Anyone can view house clubs" 
ON public.house_clubs 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create clubs" 
ON public.house_clubs 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their clubs" 
ON public.house_clubs 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete their clubs" 
ON public.house_clubs 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_house_clubs_updated_at
BEFORE UPDATE ON public.house_clubs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();