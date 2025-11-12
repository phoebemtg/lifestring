#!/usr/bin/env python3
"""
Create sample joins via API calls for testing GPT-5 recommendations.
"""
import requests
import json
from datetime import datetime, timedelta

# Backend API URL
API_BASE = "https://lifestring-api-6946562411.us-central1.run.app/api"

# Sample joins data
sample_joins = [
    {
        "title": "Weekend Hiking Adventure - Mount Tamalpais",
        "description": "Join us for a beautiful weekend hike up Mount Tamalpais! Great views of the Bay Area and perfect for intermediate hikers. We'll meet at the parking lot and take the scenic route to the summit.",
        "type": "activity",
        "location": "Mount Tamalpais State Park, CA",
        "date": (datetime.now() + timedelta(days=2)).strftime('%Y-%m-%d'),
        "time": "08:00",
        "duration": "4 hours",
        "max_participants": 8,
        "cost": "Free",
        "difficulty": "intermediate",
        "tags": ["hiking", "mountain", "weekend", "bay area", "nature", "outdoors"]
    },
    {
        "title": "Cooking Class: Italian Pasta Making",
        "description": "Learn to make authentic Italian pasta from scratch! We'll cover different pasta shapes, sauces, and techniques. All ingredients provided. Perfect for food lovers!",
        "type": "event",
        "location": "Community Kitchen, San Francisco",
        "date": (datetime.now() + timedelta(days=5)).strftime('%Y-%m-%d'),
        "time": "18:00",
        "duration": "3 hours",
        "max_participants": 12,
        "cost": "$45",
        "difficulty": "beginner",
        "tags": ["cooking", "italian", "pasta", "food", "learning", "hands-on"]
    },
    {
        "title": "Photography Walk: Golden Gate Bridge",
        "description": "Capture stunning photos of the Golden Gate Bridge from the best viewpoints! We'll explore different angles and lighting. Bring your camera or phone.",
        "type": "activity",
        "location": "Crissy Field, San Francisco",
        "date": (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d'),
        "time": "16:00",
        "duration": "2 hours",
        "max_participants": 15,
        "cost": "Free",
        "difficulty": "beginner",
        "tags": ["photography", "golden gate", "bridge", "sunset", "walking", "sightseeing"]
    },
    {
        "title": "Beach Volleyball Tournament",
        "description": "Friendly beach volleyball tournament at Ocean Beach! All skill levels welcome. We'll form teams and play multiple matches. Bring water and sunscreen!",
        "type": "activity",
        "location": "Ocean Beach, San Francisco",
        "date": (datetime.now() + timedelta(days=3)).strftime('%Y-%m-%d'),
        "time": "14:00",
        "duration": "3 hours",
        "max_participants": 20,
        "cost": "Free",
        "difficulty": "beginner",
        "tags": ["volleyball", "beach", "sports", "tournament", "team", "ocean beach"]
    },
    {
        "title": "Book Club: Sci-Fi Discussion",
        "description": "Monthly sci-fi book club meeting! This month we're discussing 'The Martian' by Andy Weir. Come share your thoughts and discover new books. Coffee and snacks provided.",
        "type": "event",
        "location": "Café Luna, Mission District",
        "date": (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d'),
        "time": "19:00",
        "duration": "2 hours",
        "max_participants": 10,
        "cost": "Free",
        "difficulty": "beginner",
        "tags": ["books", "reading", "sci-fi", "discussion", "coffee", "intellectual"]
    },
    {
        "title": "Yoga in the Park",
        "description": "Start your weekend with peaceful yoga in beautiful Golden Gate Park! Suitable for all levels. Bring your own mat. We'll focus on mindfulness and gentle stretches.",
        "type": "activity",
        "location": "Golden Gate Park, San Francisco",
        "date": (datetime.now() + timedelta(days=2)).strftime('%Y-%m-%d'),
        "time": "09:00",
        "duration": "1.5 hours",
        "max_participants": 25,
        "cost": "Free",
        "difficulty": "beginner",
        "tags": ["yoga", "park", "mindfulness", "wellness", "morning", "meditation"]
    },
    {
        "title": "Weekend Trip: Napa Valley Wine Tasting",
        "description": "Join us for a weekend trip to Napa Valley! We'll visit 3 wineries, enjoy tastings, and have lunch at a vineyard. Transportation included. Must be 21+.",
        "type": "trip",
        "location": "Napa Valley, CA",
        "date": (datetime.now() + timedelta(days=10)).strftime('%Y-%m-%d'),
        "time": "09:00",
        "duration": "8 hours",
        "max_participants": 8,
        "cost": "$120",
        "difficulty": "beginner",
        "tags": ["wine", "napa", "tasting", "weekend", "trip", "vineyard", "21+"]
    },
    {
        "title": "Rock Climbing: Indoor Bouldering",
        "description": "Try indoor rock climbing at the local climbing gym! Perfect for beginners - we'll teach you the basics and provide all equipment. Great workout and fun challenge!",
        "type": "activity",
        "location": "Mission Cliffs, San Francisco",
        "date": (datetime.now() + timedelta(days=4)).strftime('%Y-%m-%d'),
        "time": "18:30",
        "duration": "2 hours",
        "max_participants": 6,
        "cost": "$25",
        "difficulty": "beginner",
        "tags": ["climbing", "bouldering", "fitness", "indoor", "beginner", "workout"]
    }
]

def create_sample_joins():
    """Create sample joins using the public API endpoint."""
    print("🚀 Creating sample joins for GPT-5 testing...")
    
    created_count = 0
    for join_data in sample_joins:
        try:
            # Use the public endpoint to create joins
            response = requests.post(
                f"{API_BASE}/joins",
                json=join_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code in [200, 201]:
                created_count += 1
                print(f"✅ Created: {join_data['title']}")
            else:
                print(f"❌ Failed to create {join_data['title']}: {response.status_code}")
                print(f"   Response: {response.text}")
                
        except Exception as e:
            print(f"❌ Error creating {join_data['title']}: {str(e)}")
    
    print(f"\n🎉 Successfully created {created_count}/{len(sample_joins)} sample joins!")
    print("\nThese joins will now be available for GPT-5 to recommend when users ask about:")
    print("- Hiking and outdoor activities")
    print("- Cooking and food experiences") 
    print("- Photography and creative pursuits")
    print("- Sports and fitness activities")
    print("- Book clubs and intellectual discussions")
    print("- Yoga and wellness activities")
    print("- Wine tasting and weekend trips")
    print("- Rock climbing and adventure sports")

if __name__ == "__main__":
    create_sample_joins()
