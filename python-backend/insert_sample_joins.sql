-- Insert sample joins for GPT-5 testing
-- These joins will be available for the AI to recommend to users

-- Create a sample user ID for the joins creator
-- In production, you'd use real user IDs
INSERT INTO events (id, user_id, title, description, start_time, location, meta_data, custom_fields, created_at)
VALUES 
-- Hiking Join
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001', -- Sample user ID
  'Weekend Hiking Adventure - Mount Tamalpais',
  'Join us for a beautiful weekend hike up Mount Tamalpais! Great views of the Bay Area and perfect for intermediate hikers. We''ll meet at the parking lot and take the scenic route to the summit.',
  '2024-11-16 08:00:00+00',
  'Mount Tamalpais State Park, CA',
  '{
    "is_join": "true",
    "type": "activity",
    "date": "2024-11-16",
    "time": "08:00",
    "duration": "4 hours",
    "max_participants": 8,
    "cost": "Free",
    "difficulty": "intermediate",
    "tags": "hiking, mountain, weekend, bay area, nature, outdoors"
  }',
  '{}',
  NOW()
),

-- Cooking Join
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000002',
  'Cooking Class: Italian Pasta Making',
  'Learn to make authentic Italian pasta from scratch! We''ll cover different pasta shapes, sauces, and techniques. All ingredients provided. Perfect for food lovers!',
  '2024-11-17 18:00:00+00',
  'Community Kitchen, San Francisco',
  '{
    "is_join": "true",
    "type": "event",
    "date": "2024-11-17",
    "time": "18:00",
    "duration": "3 hours",
    "max_participants": 12,
    "cost": "$45",
    "difficulty": "beginner",
    "tags": "cooking, italian, pasta, food, learning, hands-on"
  }',
  '{}',
  NOW()
),

-- Photography Join
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000003',
  'Photography Walk: Golden Gate Bridge',
  'Capture stunning photos of the Golden Gate Bridge from the best viewpoints! We''ll explore different angles and lighting. Bring your camera or phone.',
  '2024-11-13 16:00:00+00',
  'Crissy Field, San Francisco',
  '{
    "is_join": "true",
    "type": "activity",
    "date": "2024-11-13",
    "time": "16:00",
    "duration": "2 hours",
    "max_participants": 15,
    "cost": "Free",
    "difficulty": "beginner",
    "tags": "photography, golden gate, bridge, sunset, walking, sightseeing"
  }',
  '{}',
  NOW()
),

-- Sports Join
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000004',
  'Beach Volleyball Tournament',
  'Friendly beach volleyball tournament at Ocean Beach! All skill levels welcome. We''ll form teams and play multiple matches. Bring water and sunscreen!',
  '2024-11-15 14:00:00+00',
  'Ocean Beach, San Francisco',
  '{
    "is_join": "true",
    "type": "activity",
    "date": "2024-11-15",
    "time": "14:00",
    "duration": "3 hours",
    "max_participants": 20,
    "cost": "Free",
    "difficulty": "beginner",
    "tags": "volleyball, beach, sports, tournament, team, ocean beach"
  }',
  '{}',
  NOW()
),

-- Book Club Join
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000005',
  'Book Club: Sci-Fi Discussion',
  'Monthly sci-fi book club meeting! This month we''re discussing ''The Martian'' by Andy Weir. Come share your thoughts and discover new books. Coffee and snacks provided.',
  '2024-11-19 19:00:00+00',
  'Café Luna, Mission District',
  '{
    "is_join": "true",
    "type": "event",
    "date": "2024-11-19",
    "time": "19:00",
    "duration": "2 hours",
    "max_participants": 10,
    "cost": "Free",
    "difficulty": "beginner",
    "tags": "books, reading, sci-fi, discussion, coffee, intellectual"
  }',
  '{}',
  NOW()
),

-- Yoga Join
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000006',
  'Yoga in the Park',
  'Start your weekend with peaceful yoga in beautiful Golden Gate Park! Suitable for all levels. Bring your own mat. We''ll focus on mindfulness and gentle stretches.',
  '2024-11-16 09:00:00+00',
  'Golden Gate Park, San Francisco',
  '{
    "is_join": "true",
    "type": "activity",
    "date": "2024-11-16",
    "time": "09:00",
    "duration": "1.5 hours",
    "max_participants": 25,
    "cost": "Free",
    "difficulty": "beginner",
    "tags": "yoga, park, mindfulness, wellness, morning, meditation"
  }',
  '{}',
  NOW()
),

-- Wine Tasting Trip
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000007',
  'Weekend Trip: Napa Valley Wine Tasting',
  'Join us for a weekend trip to Napa Valley! We''ll visit 3 wineries, enjoy tastings, and have lunch at a vineyard. Transportation included. Must be 21+.',
  '2024-11-22 09:00:00+00',
  'Napa Valley, CA',
  '{
    "is_join": "true",
    "type": "trip",
    "date": "2024-11-22",
    "time": "09:00",
    "duration": "8 hours",
    "max_participants": 8,
    "cost": "$120",
    "difficulty": "beginner",
    "tags": "wine, napa, tasting, weekend, trip, vineyard, 21+"
  }',
  '{}',
  NOW()
),

-- Rock Climbing Join
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000008',
  'Rock Climbing: Indoor Bouldering',
  'Try indoor rock climbing at the local climbing gym! Perfect for beginners - we''ll teach you the basics and provide all equipment. Great workout and fun challenge!',
  '2024-11-16 18:30:00+00',
  'Mission Cliffs, San Francisco',
  '{
    "is_join": "true",
    "type": "activity",
    "date": "2024-11-16",
    "time": "18:30",
    "duration": "2 hours",
    "max_participants": 6,
    "cost": "$25",
    "difficulty": "beginner",
    "tags": "climbing, bouldering, fitness, indoor, beginner, workout"
  }',
  '{}',
  NOW()
);

-- Display success message
SELECT 'Sample joins created successfully! GPT-5 can now recommend these activities to users.' as message;
