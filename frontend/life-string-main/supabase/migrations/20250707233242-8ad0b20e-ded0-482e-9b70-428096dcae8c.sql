-- Create house announcements table for Head of House posts
CREATE TABLE public.house_announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  house_id INTEGER NOT NULL,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  announcement_type TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event RSVPs table
CREATE TABLE public.event_rsvps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  user_id UUID NOT NULL,
  rsvp_status TEXT NOT NULL CHECK (rsvp_status IN ('attending', 'not_attending', 'maybe')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Create house member communications table
CREATE TABLE public.house_member_communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  house_id INTEGER NOT NULL,
  sender_id UUID NOT NULL,
  recipient_id UUID,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  communication_type TEXT DEFAULT 'direct_message',
  is_broadcast BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key relationships
ALTER TABLE public.event_rsvps
ADD CONSTRAINT event_rsvps_event_id_fkey 
FOREIGN KEY (event_id) REFERENCES public.house_events(id) ON DELETE CASCADE;

-- Enable RLS on new tables
ALTER TABLE public.house_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.house_member_communications ENABLE ROW LEVEL SECURITY;

-- RLS policies for house announcements
CREATE POLICY "Anyone can view house announcements" 
ON public.house_announcements 
FOR SELECT 
USING (true);

CREATE POLICY "House heads can create announcements for their house" 
ON public.house_announcements 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.house_heads 
    WHERE house_id = house_announcements.house_id 
    AND user_id = auth.uid()
  ) 
  AND auth.uid() = created_by
);

CREATE POLICY "House heads can update their own announcements" 
ON public.house_announcements 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "House heads can delete their own announcements" 
ON public.house_announcements 
FOR DELETE 
USING (auth.uid() = created_by);

-- RLS policies for event RSVPs
CREATE POLICY "Users can view RSVPs for events in their house" 
ON public.event_rsvps 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.house_events he
    JOIN public.user_profiles up ON up.house_id = he.house_id
    WHERE he.id = event_rsvps.event_id 
    AND up.id = auth.uid()
  )
);

CREATE POLICY "Users can create their own RSVPs" 
ON public.event_rsvps 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own RSVPs" 
ON public.event_rsvps 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own RSVPs" 
ON public.event_rsvps 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for house member communications
CREATE POLICY "Users can view communications sent to them or from them" 
ON public.house_member_communications 
FOR SELECT 
USING (
  auth.uid() = sender_id 
  OR auth.uid() = recipient_id 
  OR (is_broadcast = true AND EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND house_id = house_member_communications.house_id
  ))
);

CREATE POLICY "House heads can create communications for their house" 
ON public.house_member_communications 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.house_heads 
    WHERE house_id = house_member_communications.house_id 
    AND user_id = auth.uid()
  ) 
  AND auth.uid() = sender_id
);

-- Create triggers for updated_at columns
CREATE TRIGGER update_house_announcements_updated_at
BEFORE UPDATE ON public.house_announcements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_rsvps_updated_at
BEFORE UPDATE ON public.event_rsvps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for new tables
ALTER TABLE public.house_announcements REPLICA IDENTITY FULL;
ALTER TABLE public.event_rsvps REPLICA IDENTITY FULL;
ALTER TABLE public.house_member_communications REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.house_announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_rsvps;
ALTER PUBLICATION supabase_realtime ADD TABLE public.house_member_communications;