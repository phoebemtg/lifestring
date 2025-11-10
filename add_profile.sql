-- Insert or update profile data for Phoebe
INSERT INTO detailed_profiles (
    id,
    user_id,
    bio,
    email,
    interests,
    passions,
    hobbies,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'a90f0ea5-ba98-44f5-a3a7-a922db9e1523',
    'I love climbing',
    'ptroupgalligan@gmail.com',
    ARRAY['climbing'],
    ARRAY['climbing'],
    ARRAY['climbing'],
    NOW(),
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    email = EXCLUDED.email,
    interests = EXCLUDED.interests,
    passions = EXCLUDED.passions,
    hobbies = EXCLUDED.hobbies,
    updated_at = NOW();

-- Verify the data was inserted
SELECT user_id, bio, email, interests, passions, hobbies 
FROM detailed_profiles 
WHERE user_id = 'a90f0ea5-ba98-44f5-a3a7-a922db9e1523';
