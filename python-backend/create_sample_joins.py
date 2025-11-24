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
        # Sample joins data - Interest-based groups with locations
        sample_joins = [
            {
                'title': 'Bay Area Hiking Enthusiasts',
                'description': 'A community for hiking lovers in the San Francisco Bay Area. We organize regular hikes, share trail recommendations, and connect people who love exploring nature. All skill levels welcome!',
                'location': 'San Francisco Bay Area, CA',
                'meta_data': {
                    'is_join': 'true',
                    'type': 'hiking',
                    'group_type': 'ongoing',
                    'max_participants': 50,
                    'current_participants': 23,
                    'difficulty': 'all_levels',
                    'tags': 'hiking, bay area, nature, trails, outdoor, community, weekend',
                    'creator_profile': {
                        'name': 'Sarah Martinez',
                        'email': 'sarah.m@example.com',
                        'bio': 'Avid hiker and nature photographer. Love exploring Bay Area trails!'
                    }
                }
            },
            {
                'title': 'San Francisco Photography Group',
                'description': 'Connect with fellow photographers in San Francisco! Share techniques, explore the city together, and improve your skills. From beginners to professionals, everyone is welcome.',
                'location': 'San Francisco, CA',
                'meta_data': {
                    'is_join': 'true',
                    'type': 'photography',
                    'group_type': 'ongoing',
                    'max_participants': 30,
                    'current_participants': 18,
                    'difficulty': 'all_levels',
                    'tags': 'photography, san francisco, art, creative, urban, landscape, portrait',
                    'creator_profile': {
                        'name': 'Emma Thompson',
                        'email': 'emma.t@example.com',
                        'bio': 'Professional photographer and hiking enthusiast. Love sharing both passions!'
                    }
                }
            },
            {
                'title': 'Oakland Rock Climbing Community',
                'description': 'Rock climbing group based in Oakland. We climb at local gyms, outdoor crags, and organize trips to Yosemite and Tahoe. Great for meeting climbing partners and improving skills.',
                'location': 'Oakland, CA',
                'meta_data': {
                    'is_join': 'true',
                    'type': 'climbing',
                    'group_type': 'ongoing',
                    'max_participants': 25,
                    'current_participants': 12,
                    'difficulty': 'intermediate',
                    'tags': 'climbing, rock climbing, oakland, yosemite, outdoor, adventure, fitness',
                    'creator_profile': {
                        'name': 'Alex Rodriguez',
                        'email': 'alex.r@example.com',
                        'bio': 'Mountain climber and hiking guide. Conquered Half Dome 12 times!'
                    }
                }
            },
            {
                'title': 'Peninsula Boating & Sailing Club',
                'description': 'Sailing and boating enthusiasts on the Peninsula! We organize sailing trips, share boat maintenance tips, and welcome both experienced sailors and those wanting to learn.',
                'location': 'San Mateo County, CA',
                'meta_data': {
                    'is_join': 'true',
                    'type': 'boating',
                    'group_type': 'ongoing',
                    'max_participants': 40,
                    'current_participants': 16,
                    'difficulty': 'all_levels',
                    'tags': 'boating, sailing, peninsula, water sports, bay area, ocean, marina',
                    'creator_profile': {
                        'name': 'Mike Chen',
                        'email': 'mike.chen@example.com',
                        'bio': 'Weekend warrior who loves introducing people to sailing and water sports!'
                    }
                }
            },
            {
                'title': 'Berkeley Tech Professionals Network',
                'description': 'Networking group for tech professionals in Berkeley and surrounding areas. Share career insights, discuss latest technologies, and build meaningful professional connections.',
                'location': 'Berkeley, CA',
                'meta_data': {
                    'is_join': 'true',
                    'type': 'professional',
                    'group_type': 'ongoing',
                    'max_participants': 100,
                    'current_participants': 45,
                    'difficulty': 'all_levels',
                    'tags': 'tech, professional, networking, berkeley, career, startup, software',
                    'creator_profile': {
                        'name': 'Jennifer Liu',
                        'email': 'jennifer.l@example.com',
                        'bio': 'Software engineer and tech community organizer. Passionate about connecting people in tech!'
                    }
                }
            },
            {
                'title': 'Marin County Cycling Group',
                'description': 'Cycling enthusiasts in Marin County! Road cycling, mountain biking, and casual rides. We explore beautiful Marin trails and roads together. All cycling levels welcome.',
                'location': 'Marin County, CA',
                'meta_data': {
                    'is_join': 'true',
                    'type': 'cycling',
                    'group_type': 'ongoing',
                    'max_participants': 35,
                    'current_participants': 21,
                    'difficulty': 'all_levels',
                    'tags': 'cycling, biking, marin county, road cycling, mountain biking, fitness, outdoor',
                    'creator_profile': {
                        'name': 'David Park',
                        'email': 'david.p@example.com',
                        'bio': 'Cycling enthusiast and bike mechanic. Love exploring Marin\'s beautiful cycling routes!'
                    }
                }
            },
            {
                'title': 'South Bay Food & Wine Lovers',
                'description': 'Food and wine enthusiasts in the South Bay! We explore restaurants, attend wine tastings, and share culinary experiences. Perfect for foodies and wine lovers.',
                'location': 'South Bay, CA',
                'meta_data': {
                    'is_join': 'true',
                    'type': 'food_wine',
                    'group_type': 'ongoing',
                    'max_participants': 60,
                    'current_participants': 32,
                    'difficulty': 'all_levels',
                    'tags': 'food, wine, dining, south bay, culinary, restaurants, tasting, social',
                    'creator_profile': {
                        'name': 'Maria Gonzalez',
                        'email': 'maria.g@example.com',
                        'bio': 'Food blogger and wine enthusiast. Love discovering new flavors and sharing great meals!'
                    }
                }
            },
            {
                'title': 'East Bay Book Club & Literary Society',
                'description': 'Book lovers in the East Bay! We read diverse genres, discuss literature, and host author events. A welcoming community for all reading levels and interests.',
                'location': 'East Bay, CA',
                'meta_data': {
                    'is_join': 'true',
                    'type': 'books',
                    'group_type': 'ongoing',
                    'max_participants': 25,
                    'current_participants': 14,
                    'difficulty': 'all_levels',
                    'tags': 'books, reading, literature, east bay, discussion, authors, intellectual, social',
                    'creator_profile': {
                        'name': 'Robert Kim',
                        'email': 'robert.k@example.com',
                        'bio': 'Literature professor and avid reader. Love facilitating thoughtful book discussions!'
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
