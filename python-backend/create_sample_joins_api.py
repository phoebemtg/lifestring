#!/usr/bin/env python3
"""
Create sample joins via API calls for testing GPT-5 recommendations.
"""
import requests
import json
from datetime import datetime, timedelta

# Backend API URL
API_BASE = "https://lifestring-api-6946562411.us-central1.run.app/api"

# Sample joins data - Interest-based groups with locations
sample_joins = [
    {
        "title": "Bay Area Hiking Enthusiasts",
        "description": "A community for hiking lovers in the San Francisco Bay Area. We organize regular hikes, share trail recommendations, and connect people who love exploring nature. All skill levels welcome!",
        "type": "hiking",
        "location": "San Francisco Bay Area, CA",
        "group_type": "ongoing",
        "max_participants": 50,
        "current_participants": 23,
        "difficulty": "all_levels",
        "tags": ["hiking", "bay area", "nature", "trails", "outdoor", "community", "weekend"]
    },
    {
        "title": "San Francisco Photography Group",
        "description": "Connect with fellow photographers in San Francisco! Share techniques, explore the city together, and improve your skills. From beginners to professionals, everyone is welcome.",
        "type": "photography",
        "location": "San Francisco, CA",
        "group_type": "ongoing",
        "max_participants": 30,
        "current_participants": 18,
        "difficulty": "all_levels",
        "tags": ["photography", "san francisco", "art", "creative", "urban", "landscape", "portrait"]
    },
    {
        "title": "Oakland Rock Climbing Community",
        "description": "Rock climbing group based in Oakland. We climb at local gyms, outdoor crags, and organize trips to Yosemite and Tahoe. Great for meeting climbing partners and improving skills.",
        "type": "climbing",
        "location": "Oakland, CA",
        "group_type": "ongoing",
        "max_participants": 25,
        "current_participants": 12,
        "difficulty": "intermediate",
        "tags": ["climbing", "rock climbing", "oakland", "yosemite", "outdoor", "adventure", "fitness"]
    },
    {
        "title": "Peninsula Boating & Sailing Club",
        "description": "Sailing and boating enthusiasts on the Peninsula! We organize sailing trips, share boat maintenance tips, and welcome both experienced sailors and those wanting to learn.",
        "type": "boating",
        "location": "San Mateo County, CA",
        "group_type": "ongoing",
        "max_participants": 40,
        "current_participants": 16,
        "difficulty": "all_levels",
        "tags": ["boating", "sailing", "peninsula", "water sports", "bay area", "ocean", "marina"]
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
