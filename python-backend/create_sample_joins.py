#!/usr/bin/env python3
"""
Script to create sample joins for testing the AI recommendation system.
"""
import asyncio
import sys
import os
from datetime import datetime, timedelta
import uuid

# Add the parent directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import get_db
from app.models.event import Event
from sqlalchemy.orm import Session

def create_sample_joins():
    """Create sample joins for testing."""
    
    # Get database session
    db = next(get_db())
    
    try:
        # Sample joins data
        sample_joins = [
            {
                'title': 'Weekend Hiking Adventure - Mount Tamalpais',
                'description': 'Join us for a beautiful weekend hike up Mount Tamalpais! Great views of the Bay Area and perfect for intermediate hikers.',
                'location': 'Mount Tamalpais State Park, CA',
                'meta_data': {
                    'is_join': 'true',
                    'type': 'hiking',
                    'date': (datetime.now() + timedelta(days=2)).strftime('%Y-%m-%d'),
                    'time': '08:00',
                    'duration': '4 hours',
                    'max_participants': 8,
                    'cost': 'Free',
                    'difficulty': 'intermediate',
                    'tags': 'hiking, mountain, weekend, bay area, nature',
                    'creator_profile': {
                        'name': 'Sarah Martinez',
                        'email': 'sarah.m@example.com',
                        'bio': 'Avid hiker and nature photographer. Love exploring Bay Area trails!'
                    }
                }
            },
            {
                'title': 'Easy Morning Hike - Lands End',
                'description': 'Perfect for beginners! Beautiful coastal views and easy trails. Coffee meetup afterwards at nearby cafe.',
                'location': 'Lands End, San Francisco',
                'meta_data': {
                    'is_join': 'true',
                    'type': 'hiking',
                    'date': (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d'),
                    'time': '09:30',
                    'duration': '2 hours',
                    'max_participants': 6,
                    'cost': 'Free',
                    'difficulty': 'beginner',
                    'tags': 'hiking, coastal, easy, beginner, coffee, san francisco',
                    'creator_profile': {
                        'name': 'Mike Chen',
                        'email': 'mike.chen@example.com',
                        'bio': 'Weekend warrior who loves introducing people to hiking!'
                    }
                }
            },
            {
                'title': 'Challenging Hike - Half Dome Training',
                'description': 'Preparing for Half Dome? Join our training hike! Steep terrain, 6+ miles. Experienced hikers only.',
                'location': 'Mission Peak, Fremont',
                'meta_data': {
                    'is_join': 'true',
                    'type': 'hiking',
                    'date': (datetime.now() + timedelta(days=5)).strftime('%Y-%m-%d'),
                    'time': '06:00',
                    'duration': '5 hours',
                    'max_participants': 4,
                    'cost': 'Free',
                    'difficulty': 'advanced',
                    'tags': 'hiking, challenging, training, half dome, mission peak',
                    'creator_profile': {
                        'name': 'Alex Rodriguez',
                        'email': 'alex.r@example.com',
                        'bio': 'Mountain climber and hiking guide. Conquered Half Dome 12 times!'
                    }
                }
            },
            {
                'title': 'Sunset Hike & Photography',
                'description': 'Combine hiking with photography! Capture the golden hour from the best viewpoints. Bring your camera!',
                'location': 'Twin Peaks, San Francisco',
                'meta_data': {
                    'is_join': 'true',
                    'type': 'hiking',
                    'date': (datetime.now() + timedelta(days=3)).strftime('%Y-%m-%d'),
                    'time': '17:00',
                    'duration': '3 hours',
                    'max_participants': 10,
                    'cost': 'Free',
                    'difficulty': 'beginner',
                    'tags': 'hiking, photography, sunset, twin peaks, golden hour',
                    'creator_profile': {
                        'name': 'Emma Thompson',
                        'email': 'emma.t@example.com',
                        'bio': 'Professional photographer and hiking enthusiast. Love sharing both passions!'
                    }
                }
            },
            {
                'title': 'Family-Friendly Nature Walk',
                'description': 'Perfect for families with kids! Easy trails, nature education, and fun activities for children.',
                'location': 'Muir Woods National Monument',
                'meta_data': {
                    'is_join': 'true',
                    'type': 'hiking',
                    'date': (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d'),
                    'time': '10:00',
                    'duration': '2.5 hours',
                    'max_participants': 12,
                    'cost': '$15 parking',
                    'difficulty': 'beginner',
                    'tags': 'hiking, family, kids, nature, muir woods, redwoods',
                    'creator_profile': {
                        'name': 'Jennifer Park',
                        'email': 'jen.park@example.com',
                        'bio': 'Mom of two who loves getting kids excited about nature and hiking!'
                    }
                }
            }
        ]
        
        # Create a sample user ID (you might want to use a real user ID from your database)
        sample_user_id = str(uuid.uuid4())
        
        created_joins = []
        for join_data in sample_joins:
            # Create event record
            event = Event(
                id=str(uuid.uuid4()),
                user_id=sample_user_id,
                title=join_data['title'],
                description=join_data['description'],
                location=join_data['location'],
                meta_data=join_data['meta_data'],
                created_at=datetime.utcnow()
            )
            
            db.add(event)
            created_joins.append(event)
        
        # Commit all joins
        db.commit()
        
        print(f"Successfully created {len(created_joins)} sample joins:")
        for join in created_joins:
            print(f"- {join.title} ({join.meta_data.get('type')})")
        
        print("\nThese joins can now be discovered when users mention hiking, nature, mountains, etc.")
        
    except Exception as e:
        print(f"Error creating sample joins: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_joins()
