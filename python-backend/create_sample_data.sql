-- Create sample hiking Connected Strings for testing
-- Run this SQL directly in Supabase SQL editor

-- Insert base users first (if users table exists)
INSERT INTO users (id, email, created_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'sarah.m@example.com', NOW()),
  ('550e8400-e29b-41d4-a716-446655440001', 'mike.c@example.com', NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'emma.t@example.com', NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'alex.r@example.com', NOW()),
  ('550e8400-e29b-41d4-a716-446655440004', 'jessica.p@example.com', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample user profiles
INSERT INTO user_profiles (id, user_id, contact_info, attributes, biography, meta, created_at)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000',
    '{"name": "Sarah Martinez", "email": "sarah.m@example.com"}',
    '{}',
    '{"bio": "Avid hiker and nature photographer. Love exploring Bay Area trails!"}',
    '{}',
    NOW()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    '{"name": "Mike Chen", "email": "mike.c@example.com"}',
    '{}',
    '{"bio": "Weekend warrior who loves outdoor adventures and meeting new people!"}',
    '{}',
    NOW()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440002',
    '{"name": "Emma Thompson", "email": "emma.t@example.com"}',
    '{}',
    '{"bio": "Rock climbing enthusiast and hiking guide. Always up for an adventure!"}',
    '{}',
    NOW()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440003',
    '{"name": "Alex Rodriguez", "email": "alex.r@example.com"}',
    '{}',
    '{"bio": "Coffee lover and casual hiker. Looking to explore more trails in the area."}',
    '{}',
    NOW()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440004',
    '{"name": "Jessica Park", "email": "jessica.p@example.com"}',
    '{}',
    '{"bio": "Travel blogger and outdoor enthusiast. Love documenting beautiful hikes!"}',
    '{}',
    NOW()
  )
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample hiking Connected Strings
INSERT INTO events (id, user_id, title, description, start_time, end_time, location, meta_data, custom_fields, created_at)
VALUES 
  (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    'Weekend Hiking Adventure - Mount Tamalpais',
    'Join us for a beautiful weekend hike up Mount Tamalpais! Great views of the Bay Area and perfect for intermediate hikers. We will meet at the parking lot at 8 AM and expect to be back by noon. Bring water, snacks, and good hiking shoes!',
    '2025-10-28 08:00:00+00',
    '2025-10-28 12:00:00+00',
    'Mount Tamalpais State Park, CA',
    '{"is_join": "true", "type": "hiking", "difficulty": "intermediate", "max_participants": 8, "cost": "Free", "tags": "hiking, mountain, weekend, bay area, nature"}',
    '{}',
    NOW()
  ),
  (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440001',
    'Easy Morning Hike - Golden Gate Park',
    'Perfect for beginners! Join me for a relaxing morning walk through Golden Gate Park trails. We will explore the quieter paths and enjoy some fresh air. Great for meeting new people and getting some light exercise.',
    '2025-10-29 09:00:00+00',
    '2025-10-29 11:00:00+00',
    'Golden Gate Park, San Francisco, CA',
    '{"is_join": "true", "type": "hiking", "difficulty": "easy", "max_participants": 6, "cost": "Free", "tags": "hiking, easy, morning, golden gate park, beginner friendly"}',
    '{}',
    NOW()
  ),
  (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440002',
    'Rock Climbing & Hiking Combo - Castle Rock',
    'Adventure seekers welcome! We will start with some rock climbing practice and then hike the beautiful Castle Rock trails. Climbing gear provided for beginners. Intermediate to advanced hikers preferred.',
    '2025-10-30 07:00:00+00',
    '2025-10-30 15:00:00+00',
    'Castle Rock State Park, CA',
    '{"is_join": "true", "type": "hiking", "difficulty": "advanced", "max_participants": 4, "cost": "$20 for gear rental", "tags": "hiking, rock climbing, advanced, castle rock, adventure"}',
    '{}',
    NOW()
  ),
  (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440003',
    'Coffee & Coastal Walk - Half Moon Bay',
    'Combine two great things: coffee and coastal hiking! We will start with coffee at a local cafe, then walk along the beautiful Half Moon Bay coastal trail. Perfect for a relaxed weekend activity.',
    '2025-11-02 10:00:00+00',
    '2025-11-02 14:00:00+00',
    'Half Moon Bay, CA',
    '{"is_join": "true", "type": "hiking", "difficulty": "easy", "max_participants": 8, "cost": "Coffee cost (~$5)", "tags": "hiking, coffee, coastal, half moon bay, relaxed, social"}',
    '{}',
    NOW()
  ),
  (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440004',
    'Photography Hike - Muir Woods',
    'Calling all photography enthusiasts! Join me for a scenic hike through Muir Woods with plenty of stops for capturing the majestic redwoods. Bring your camera and let''s create some beautiful memories together.',
    '2025-11-03 08:30:00+00',
    '2025-11-03 13:30:00+00',
    'Muir Woods National Monument, CA',
    '{"is_join": "true", "type": "hiking", "difficulty": "intermediate", "max_participants": 6, "cost": "Park entrance fee (~$15)", "tags": "hiking, photography, muir woods, redwoods, nature, scenic"}',
    '{}',
    NOW()
  );
