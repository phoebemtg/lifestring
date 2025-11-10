-- Create sample Connected Strings using existing user IDs
-- Run this SQL directly in Supabase SQL editor

-- Create user profiles for existing users (if they don't exist)
INSERT INTO user_profiles (id, user_id, contact_info, attributes, biography, meta, created_at)
VALUES 
  (
    gen_random_uuid(),
    'e1e8484a-18d0-4124-bb5b-dc696a887a0f',
    '{"name": "Christian Fladgate", "email": "christianfladgate1@gmail.com"}',
    '{}',
    '{"bio": "Avid hiker and nature photographer. Love exploring Bay Area trails!"}',
    '{}',
    NOW()
  ),
  (
    gen_random_uuid(),
    '02c4339e-0f16-498a-965e-bac1dd25c8b1',
    '{"name": "Phoebe", "email": "phoebemtg@gmail.com"}',
    '{}',
    '{"bio": "Rock climbing enthusiast and hiking guide. Always up for an adventure!"}',
    '{}',
    NOW()
  ),
  (
    gen_random_uuid(),
    'ad9766ab-5820-48ea-9758-18597c86b9b7',
    '{"name": "Nikolas Karolides", "email": "nikolaskarolides@gmail.com"}',
    '{}',
    '{"bio": "Weekend warrior who loves outdoor adventures and meeting new people!"}',
    '{}',
    NOW()
  ),
  (
    gen_random_uuid(),
    '54e4338d-bcc3-44c2-b503-d7a99c2d2fd0',
    '{"name": "Christian", "email": "christian@lifestring.ai"}',
    '{}',
    '{"bio": "Coffee lover and casual hiker. Looking to explore more trails in the area."}',
    '{}',
    NOW()
  )
ON CONFLICT (user_id) DO NOTHING;

-- Create sample hiking Connected Strings using real user IDs
INSERT INTO events (id, user_id, title, description, start_time, end_time, location, meta_data, custom_fields, created_at)
VALUES 
  (
    gen_random_uuid(),
    'e1e8484a-18d0-4124-bb5b-dc696a887a0f',
    'Weekend Hiking Adventure - Mount Tamalpais',
    'Join us for a beautiful weekend hike up Mount Tamalpais! Great views of the Bay Area and perfect for intermediate hikers. We will meet at the parking lot at 8 AM and expect to be back by noon. Bring water, snacks, and good hiking shoes! Contact Christian at christianfladgate1@gmail.com',
    '2025-10-28 08:00:00+00',
    '2025-10-28 12:00:00+00',
    'Mount Tamalpais State Park, CA',
    '{"is_join": "true", "type": "hiking", "difficulty": "intermediate", "max_participants": 8, "cost": "Free", "tags": "hiking, mountain, weekend, bay area, nature", "creator_profile": {"name": "Christian Fladgate", "email": "christianfladgate1@gmail.com", "bio": "Avid hiker and nature photographer. Love exploring Bay Area trails!"}}',
    '{}',
    NOW()
  ),
  (
    gen_random_uuid(),
    '02c4339e-0f16-498a-965e-bac1dd25c8b1',
    'Rock Climbing & Hiking Combo - Castle Rock',
    'Adventure seekers welcome! We will start with some rock climbing practice and then hike the beautiful Castle Rock trails. Climbing gear provided for beginners. Intermediate to advanced hikers preferred. Contact Phoebe at phoebemtg@gmail.com',
    '2025-10-30 07:00:00+00',
    '2025-10-30 15:00:00+00',
    'Castle Rock State Park, CA',
    '{"is_join": "true", "type": "hiking", "difficulty": "advanced", "max_participants": 4, "cost": "$20 for gear rental", "tags": "hiking, rock climbing, advanced, castle rock, adventure", "creator_profile": {"name": "Phoebe", "email": "phoebemtg@gmail.com", "bio": "Rock climbing enthusiast and hiking guide. Always up for an adventure!"}}',
    '{}',
    NOW()
  ),
  (
    gen_random_uuid(),
    'ad9766ab-5820-48ea-9758-18597c86b9b7',
    'Easy Morning Hike - Golden Gate Park',
    'Perfect for beginners! Join me for a relaxing morning walk through Golden Gate Park trails. We will explore the quieter paths and enjoy some fresh air. Great for meeting new people and getting some light exercise. Contact Nikolas at nikolaskarolides@gmail.com',
    '2025-10-29 09:00:00+00',
    '2025-10-29 11:00:00+00',
    'Golden Gate Park, San Francisco, CA',
    '{"is_join": "true", "type": "hiking", "difficulty": "easy", "max_participants": 6, "cost": "Free", "tags": "hiking, easy, morning, golden gate park, beginner friendly", "creator_profile": {"name": "Nikolas Karolides", "email": "nikolaskarolides@gmail.com", "bio": "Weekend warrior who loves outdoor adventures and meeting new people!"}}',
    '{}',
    NOW()
  ),
  (
    gen_random_uuid(),
    '54e4338d-bcc3-44c2-b503-d7a99c2d2fd0',
    'Coffee & Coastal Walk - Half Moon Bay',
    'Combine two great things: coffee and coastal hiking! We will start with coffee at a local cafe, then walk along the beautiful Half Moon Bay coastal trail. Perfect for a relaxed weekend activity. Contact Christian at christian@lifestring.ai',
    '2025-11-02 10:00:00+00',
    '2025-11-02 14:00:00+00',
    'Half Moon Bay, CA',
    '{"is_join": "true", "type": "hiking", "difficulty": "easy", "max_participants": 8, "cost": "Coffee cost (~$5)", "tags": "hiking, coffee, coastal, half moon bay, relaxed, social", "creator_profile": {"name": "Christian", "email": "christian@lifestring.ai", "bio": "Coffee lover and casual hiker. Looking to explore more trails in the area."}}',
    '{}',
    NOW()
  ),
  (
    gen_random_uuid(),
    '8c97ff0a-383d-4ec1-b621-03792b487ab7',
    'Photography Hike - Muir Woods',
    'Calling all photography enthusiasts! Join me for a scenic hike through Muir Woods with plenty of stops for capturing the majestic redwoods. Bring your camera and let''s create some beautiful memories together. Contact me at ptroupgalligan@berkeley.edu',
    '2025-11-03 08:30:00+00',
    '2025-11-03 13:30:00+00',
    'Muir Woods National Monument, CA',
    '{"is_join": "true", "type": "hiking", "difficulty": "intermediate", "max_participants": 6, "cost": "Park entrance fee (~$15)", "tags": "hiking, photography, muir woods, redwoods, nature, scenic", "creator_profile": {"name": "Phoebe T", "email": "ptroupgalligan@berkeley.edu", "bio": "Travel blogger and outdoor enthusiast. Love documenting beautiful hikes!"}}',
    '{}',
    NOW()
  );
