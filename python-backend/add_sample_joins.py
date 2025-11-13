#!/usr/bin/env python3
"""
Simple script to add sample joins to the database via direct database connection.
This will populate the database with sample joins that GPT-5 can recommend to users.
"""

import os
import psycopg2
from datetime import datetime, timedelta
import uuid
import json

# Database connection string from environment
DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("❌ DATABASE_URL environment variable not set")
    exit(1)

# Sample joins data
sample_joins = [
    {
        'title': 'Weekend Hiking Adventure - Mount Tamalpais',
        'description': 'Join us for a beautiful weekend hike up Mount Tamalpais! Great views of the Bay Area and perfect for intermediate hikers. We\'ll meet at the parking lot and take the scenic route to the summit.',
        'location': 'Mount Tamalpais State Park, CA',
        'start_time': '2024-11-16 08:00:00+00',
        'meta_data': {
            'is_join': 'true',
            'type': 'activity',
            'date': '2024-11-16',
            'time': '08:00',
            'duration': '4 hours',
            'max_participants': 8,
            'cost': 'Free',
            'difficulty': 'intermediate',
            'tags': 'hiking, mountain, weekend, bay area, nature, outdoors'
        }
    },
    {
        'title': 'Cooking Class: Italian Pasta Making',
        'description': 'Learn to make authentic Italian pasta from scratch! We\'ll cover different pasta shapes, sauces, and techniques. All ingredients provided. Perfect for food lovers!',
        'location': 'Community Kitchen, San Francisco',
        'start_time': '2024-11-17 18:00:00+00',
        'meta_data': {
            'is_join': 'true',
            'type': 'event',
            'date': '2024-11-17',
            'time': '18:00',
            'duration': '3 hours',
            'max_participants': 12,
            'cost': '$45',
            'difficulty': 'beginner',
            'tags': 'cooking, italian, pasta, food, learning, hands-on'
        }
    },
    {
        'title': 'Photography Walk: Golden Gate Bridge',
        'description': 'Capture stunning photos of the Golden Gate Bridge from the best viewpoints! We\'ll explore different angles and lighting. Bring your camera or phone.',
        'location': 'Crissy Field, San Francisco',
        'start_time': '2024-11-13 16:00:00+00',
        'meta_data': {
            'is_join': 'true',
            'type': 'activity',
            'date': '2024-11-13',
            'time': '16:00',
            'duration': '2 hours',
            'max_participants': 15,
            'cost': 'Free',
            'difficulty': 'beginner',
            'tags': 'photography, golden gate, bridge, sunset, walking, sightseeing'
        }
    },
    {
        'title': 'Beach Volleyball Tournament',
        'description': 'Friendly beach volleyball tournament at Ocean Beach! All skill levels welcome. We\'ll form teams and play multiple matches. Bring water and sunscreen!',
        'location': 'Ocean Beach, San Francisco',
        'start_time': '2024-11-15 14:00:00+00',
        'meta_data': {
            'is_join': 'true',
            'type': 'activity',
            'date': '2024-11-15',
            'time': '14:00',
            'duration': '3 hours',
            'max_participants': 20,
            'cost': 'Free',
            'difficulty': 'beginner',
            'tags': 'volleyball, beach, sports, tournament, team, ocean beach'
        }
    },
    {
        'title': 'Book Club: Sci-Fi Discussion',
        'description': 'Monthly sci-fi book club meeting! This month we\'re discussing \'The Martian\' by Andy Weir. Come share your thoughts and discover new books. Coffee and snacks provided.',
        'location': 'Café Luna, Mission District',
        'start_time': '2024-11-19 19:00:00+00',
        'meta_data': {
            'is_join': 'true',
            'type': 'event',
            'date': '2024-11-19',
            'time': '19:00',
            'duration': '2 hours',
            'max_participants': 10,
            'cost': 'Free',
            'difficulty': 'beginner',
            'tags': 'books, reading, sci-fi, discussion, coffee, intellectual'
        }
    },
    {
        'title': 'Yoga in the Park',
        'description': 'Start your weekend with peaceful yoga in beautiful Golden Gate Park! Suitable for all levels. Bring your own mat. We\'ll focus on mindfulness and gentle stretches.',
        'location': 'Golden Gate Park, San Francisco',
        'start_time': '2024-11-16 09:00:00+00',
        'meta_data': {
            'is_join': 'true',
            'type': 'activity',
            'date': '2024-11-16',
            'time': '09:00',
            'duration': '1.5 hours',
            'max_participants': 25,
            'cost': 'Free',
            'difficulty': 'beginner',
            'tags': 'yoga, park, mindfulness, wellness, morning, meditation'
        }
    },
    {
        'title': 'Weekend Trip: Napa Valley Wine Tasting',
        'description': 'Join us for a weekend trip to Napa Valley! We\'ll visit 3 wineries, enjoy tastings, and have lunch at a vineyard. Transportation included. Must be 21+.',
        'location': 'Napa Valley, CA',
        'start_time': '2024-11-22 09:00:00+00',
        'meta_data': {
            'is_join': 'true',
            'type': 'trip',
            'date': '2024-11-22',
            'time': '09:00',
            'duration': '8 hours',
            'max_participants': 8,
            'cost': '$120',
            'difficulty': 'beginner',
            'tags': 'wine, napa, tasting, weekend, trip, vineyard, 21+'
        }
    },
    {
        'title': 'Rock Climbing: Indoor Bouldering',
        'description': 'Try indoor rock climbing at the local climbing gym! Perfect for beginners - we\'ll teach you the basics and provide all equipment. Great workout and fun challenge!',
        'location': 'Mission Cliffs, San Francisco',
        'start_time': '2024-11-16 18:30:00+00',
        'meta_data': {
            'is_join': 'true',
            'type': 'activity',
            'date': '2024-11-16',
            'time': '18:30',
            'duration': '2 hours',
            'max_participants': 6,
            'cost': '$25',
            'difficulty': 'beginner',
            'tags': 'climbing, bouldering, fitness, indoor, beginner, workout'
        }
    }
]

def add_sample_joins():
    """Add sample joins to the database."""
    try:
        # Connect to database
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        print("🔗 Connected to database")
        
        # Sample user ID for the joins creator
        sample_user_id = '00000000-0000-0000-0000-000000000001'
        
        # Insert each join
        for i, join_data in enumerate(sample_joins, 1):
            join_id = str(uuid.uuid4())
            
            # Insert into events table
            cur.execute("""
                INSERT INTO events (id, user_id, title, description, start_time, location, meta_data, custom_fields, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                join_id,
                sample_user_id,
                join_data['title'],
                join_data['description'],
                join_data['start_time'],
                join_data['location'],
                json.dumps(join_data['meta_data']),
                json.dumps({}),
                datetime.now()
            ))
            
            print(f"✅ Added join {i}/8: {join_data['title']}")
        
        # Commit changes
        conn.commit()
        print(f"\n🎉 Successfully added {len(sample_joins)} sample joins to the database!")
        print("🤖 GPT-5 can now recommend these real activities to users!")
        
        # Close connection
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error adding sample joins: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 Adding sample joins to Lifestring database...")
    success = add_sample_joins()
    
    if success:
        print("\n✨ Sample joins added successfully!")
        print("🧪 Test the AI chat by asking about:")
        print("   - 'I want to go hiking'")
        print("   - 'Any cooking classes?'")
        print("   - 'Photography activities?'")
        print("   - 'Beach volleyball games?'")
    else:
        print("\n❌ Failed to add sample joins")
