-- Create club_join_requests table to track user requests to join clubs
CREATE TABLE public.club_join_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  club_id uuid NOT NULL REFERENCES public.house_clubs(id) ON DELETE CASCADE,
  house_id integer NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at timestamp with time zone NOT NULL DEFAULT now(),
  responded_at timestamp with time zone,
  responded_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on club_join_requests
ALTER TABLE public.club_join_requests ENABLE ROW LEVEL SECURITY;

-- Users can create their own join requests
CREATE POLICY "Users can create their own club join requests" 
ON public.club_join_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can view their own join requests
CREATE POLICY "Users can view their own club join requests" 
ON public.club_join_requests 
FOR SELECT 
USING (auth.uid() = user_id);

-- House heads can view join requests for clubs in their house
CREATE POLICY "House heads can view club join requests for their house" 
ON public.club_join_requests 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM house_heads 
  WHERE house_heads.house_id = club_join_requests.house_id 
  AND house_heads.user_id = auth.uid()
));

-- House heads can update join requests for clubs in their house
CREATE POLICY "House heads can respond to club join requests for their house" 
ON public.club_join_requests 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM house_heads 
  WHERE house_heads.house_id = club_join_requests.house_id 
  AND house_heads.user_id = auth.uid()
));

-- Create updated_at trigger for club_join_requests
CREATE TRIGGER update_club_join_requests_updated_at
  BEFORE UPDATE ON public.club_join_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();