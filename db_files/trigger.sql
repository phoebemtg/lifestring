-- These triggers are required for proper functionality
-- When a new user is created in auth.users table (handled by Supabase)
-- a new row is created in the public.user_profiles table. This is what is handled by the rest of the application

create trigger on_new_user
after insert on auth.users for each row
execute procedure public.handle_new_user();

create trigger on_user_update
after update on auth.users
for each row
execute procedure public.handle_user_update();

-- Late Addition
-- Prepopulate enneagrams
INSERT INTO "public"."enneagrams" ("id", "type_number", "name", "description", "attributes") VALUES ('1', '1', 'Nightingale', 'The Rational, Idealistic Type: Principled, Purposeful, Self-Controlled, and Perfectionistic', '{"strengths": [], "challenges": [], "leadership_style": "To be defined", "communication_style": "To be defined"}'), ('2', '2', 'Lincoln', 'The Caring, Interpersonal Type: Demonstrative, Generous, People-Pleasing, and Possessive', '{"strengths": [], "challenges": [], "leadership_style": "To be defined", "communication_style": "To be defined"}'), ('3', '3', 'Franklin', 'The Success-Oriented, Pragmatic Type: Adaptive, Excelling, Driven, and Image-Conscious', '{"strengths": [], "challenges": [], "leadership_style": "To be defined", "communication_style": "To be defined"}'), ('4', '4', 'Twain', 'The Sensitive, Withdrawn Type: Expressive, Dramatic, Self-Absorbed, and Temperamental', '{"strengths": [], "challenges": [], "leadership_style": "To be defined", "communication_style": "To be defined"}'), ('5', '5', 'Newton', 'The Intense, Cerebral Type: Perceptive, Innovative, Secretive, and Isolated', '{"strengths": [], "challenges": [], "leadership_style": "To be defined", "communication_style": "To be defined"}'), ('6', '6', 'Frank', 'The Committed, Security-Oriented Type: Engaging, Responsible, Anxious, and Suspicious', '{"strengths": [], "challenges": [], "leadership_style": "To be defined", "communication_style": "To be defined"}'), ('7', '7', 'Tolkien', 'The Busy, Fun-Loving Type: Spontaneous, Versatile, Distractible, and Scattered', '{"strengths": [], "challenges": [], "leadership_style": "To be defined", "communication_style": "To be defined"}'), ('8', '8', 'Anthony', 'The Powerful, Dominating Type: Self-Confident, Decisive, Willful, and Confrontational', '{"strengths": [], "challenges": [], "leadership_style": "To be defined", "communication_style": "To be defined"}'), ('9', '9', 'Arc', 'The Easygoing, Self-Effacing Type: Receptive, Reassuring, Agreeable, and Complacent', '{"strengths": [], "challenges": [], "leadership_style": "To be defined", "communication_style": "To be defined"}');
