"""
AI Chat API endpoints with enhanced Lifestring features.
"""
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db, get_db_optional
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)
from app.api.deps import get_current_user
from app.models.user import User
from app.models.room import Room, Message, RoomParticipant
from app.services.openai_service import openai_service
from app.services.lifestring_ai_service import lifestring_ai, AIResponse
from app.services.ai_action_handler import create_action_handler

# Import web_search_service conditionally to avoid import errors
try:
    from app.services.web_search_service import web_search_service
except ImportError:
    web_search_service = None

# Import realtime_service conditionally to avoid import errors
try:
    from app.services.realtime_service import realtime_service
except ImportError:
    realtime_service = None

# Import hybrid_ai_service for intelligent model routing
try:
    from app.services.hybrid_ai_service import hybrid_ai_service, ModelChoice
    print(f"SUCCESS: Imported hybrid_ai_service: {hybrid_ai_service}")
except ImportError as e:
    print(f"IMPORT ERROR: {e}")
    hybrid_ai_service = None
    ModelChoice = None

def convert_question_key_to_text(question_key: str) -> str:
    """Convert question keys like 'fun-questions-0' to actual question text"""

    # Fun Questions
    fun_questions = [
        "What's your favorite movie of all time?",
        "What's your favorite book?",
        "What's your favorite song?",
        "What's your favorite food?",
        "What's your favorite thing to do to relax?",
        "What's your favorite color?",
        "What's your favorite holiday?",
        "The country you most want to visit?",
        "Sunny or RAINY day?",
        "Morning bird or Night Owl",
        "favorite smell or scent?",
        "Best memory",
        "Best feeling in the world?",
        "What place makes you feel the most at happy?",
        "What's something small that always improves your day?",
        "What's a feeling you wish you could experience more often?",
        "What does a perfect weekend look like for you?",
        "What's your Harry Potter House",
        "What's your favorite city you've ever visited?",
        "What is the superpower you would want most?"
    ]

    # Friend Preferences Questions
    friend_preferences_questions = [
        "What qualities do you value most in people?",
        "Are you looking for friends nearby, long distance or both?",
        "How important is shared interest?",
        "What kind of humor do you appreciate most?",
        "How important is it that friends share your values or beliefs?"
    ]

    # Goals + Ideas Questions
    goals_ideas_questions = [
        "What's a personal dream you are currently working toward?",
        "What's a big life goal you want to achieve in the next 5 years?",
        "Do your goals focus more on career, creativity, relationships, or experiences?",
        "What's an idea you've had for a long time but never started?",
        "What motivates you to pursue your dreams?"
    ]

    # Personal Questions
    personal_questions = [
        "What's something you're currently trying to improve about yourself?",
        "What's a passion or hobby you could talk about for hours?",
        "Who has influenced your life perspective the most?",
        "What's one thing people often misunderstand about you?",
        "What makes you feel truly understood by someone?"
    ]

    # Parse the question key
    try:
        if question_key.startswith('fun-questions-'):
            index = int(question_key.split('-')[-1])
            if 0 <= index < len(fun_questions):
                return fun_questions[index]
        elif question_key.startswith('friend-preferences-'):
            index = int(question_key.split('-')[-1])
            if 0 <= index < len(friend_preferences_questions):
                return friend_preferences_questions[index]
        elif question_key.startswith('goals-ideas-'):
            index = int(question_key.split('-')[-1])
            if 0 <= index < len(goals_ideas_questions):
                return goals_ideas_questions[index]
        elif question_key.startswith('personal-questions-'):
            index = int(question_key.split('-')[-1])
            if 0 <= index < len(personal_questions):
                return personal_questions[index]
    except (ValueError, IndexError):
        pass

    # If we can't map it, return the original key
    return question_key

router = APIRouter()

# Security scheme
security = HTTPBearer()


async def search_real_time_events(user_message: str, user_profile: dict = None) -> List[Dict[str, Any]]:
    """Search for real-time events based on user query and interests."""
    try:
        # Check if user is asking about real-time events
        real_time_keywords = [
            # Sports events
            'nfl games', 'nba games', 'mlb games', 'nhl games',
            'football games', 'basketball games', 'baseball games', 'hockey games',
            'games today', 'games tonight', 'games this week',
            'sports schedule', 'game schedule',
            # Local events
            'concerts', 'shows', 'events', 'what\'s happening',
            'events today', 'events tonight', 'events this week',
            'local events', 'things to do', 'activities',
            'festivals', 'farmers market', 'art shows',
            'live music', 'theater', 'comedy shows',
            'community events', 'meetups', 'workshops',
            'what can i do', 'weekend',
            # Time-specific queries that should prioritize real events
            'tomorrow', 'today', 'tonight', 'this evening',
            'next week', 'this month', 'upcoming',
            'this weekend', 'weekend'
        ]

        # Time-specific queries that should ONLY show real-time events (no joins)
        real_time_only_keywords = [
            'tomorrow', 'today', 'tonight', 'this evening',
            'this weekend', 'weekend', 'next week', 'this month',
            'what can i do tomorrow', 'what can i do today',
            'what can i do this weekend', 'what\'s happening tomorrow',
            'what\'s happening today', 'what\'s happening this weekend'
        ]

        message_lower = user_message.lower()
        is_real_time_query = any(keyword in message_lower for keyword in real_time_keywords)

        if not is_real_time_query:
            return []

        # Extract location if mentioned
        location = None
        location_keywords = ['in ', 'at ', 'near ']
        for keyword in location_keywords:
            if keyword in message_lower:
                parts = message_lower.split(keyword)
                if len(parts) > 1:
                    # Extract potential location (next few words)
                    location_part = parts[1].split()[:3]  # Take up to 3 words
                    location = ' '.join(location_part).strip()
                    break

        # Search for events using real-time service
        events = []

        # Extract location from message or use default
        location = 'Salt Lake City'  # Default location
        location_keywords = {
            'salt lake': 'Salt Lake City',
            'utah': 'Salt Lake City',
            'slc': 'Salt Lake City',
            'san francisco': 'San Francisco',
            'sf': 'San Francisco',
            'bay area': 'San Francisco',
            'berkeley': 'Berkeley',
            'new york': 'New York',
            'nyc': 'New York',
            'los angeles': 'Los Angeles',
            'la': 'Los Angeles',
            'chicago': 'Chicago',
            'denver': 'Denver'
        }

        for keyword, loc in location_keywords.items():
            if keyword in message_lower:
                location = loc
                break

        from app.services.realtime_service import realtime_service

        # 1. Check for sports events
        sport_type = None
        if 'nfl' in message_lower or 'football' in message_lower:
            sport_type = 'nfl'
        elif 'nba' in message_lower or 'basketball' in message_lower:
            sport_type = 'nba'
        elif 'mlb' in message_lower or 'baseball' in message_lower:
            sport_type = 'mlb'
        elif 'nhl' in message_lower or 'hockey' in message_lower:
            sport_type = 'nhl'

        # Get sports events if requested
        if sport_type or any(keyword in message_lower for keyword in ['games', 'sports', 'schedule']):
            try:
                sports_events = await realtime_service.get_sports_events(sport_type, limit=5)
                events.extend(sports_events)
            except Exception as e:
                print(f"Error fetching sports events: {e}")

        # 2. Check for local events (concerts, shows, festivals, etc.)
        local_event_keywords = [
            'concerts', 'shows', 'events', 'festivals', 'live music',
            'theater', 'comedy', 'art shows', 'farmers market',
            'community events', 'meetups', 'workshops', 'things to do',
            'activities', 'what\'s happening', 'what can i do', 'weekend'
        ]

        if any(keyword in message_lower for keyword in local_event_keywords):
            try:
                # Extract user interests from profile
                user_interests = []
                if user_profile:
                    # Get interests from different possible locations in profile
                    interests = user_profile.get('interests', []) or user_profile.get('interests_array', [])
                    passions = user_profile.get('passions', []) or user_profile.get('passions_array', [])
                    hobbies = user_profile.get('hobbies', []) or user_profile.get('hobbies_array', [])

                    user_interests.extend(interests)
                    user_interests.extend(passions)
                    user_interests.extend(hobbies)

                    # Remove empty strings and duplicates
                    user_interests = list(set([interest for interest in user_interests if interest and interest.strip()]))

                local_events = await realtime_service.get_local_events(location, limit=8, user_interests=user_interests)
                events.extend(local_events)

                if user_interests:
                    logger.info(f"Searched events with user interests: {user_interests}")

            except Exception as e:
                print(f"Error fetching local events: {e}")

        # Fallback if no events found
        if not events:
            events = [{
                'title': f'Events in {location}',
                'description': f'For current events in {location}, check local event websites, community boards, and social media groups.',
                'location': location,
                'url': None,
                'date': '2025-11-17T00:00:00',
                'event_type': 'general_info',
                'source': 'Local Community'
            }]

        # Return events in their original format for text integration
        return events

    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error searching real-time events: {str(e)}")
        return []


def format_events_as_text(events: List[Dict[str, Any]]) -> str:
    """Format real-time events as text without links."""
    if not events:
        return ""

    event_text = "\n\nHere are some events happening:\n\n"

    for event in events:
        title = event.get('title', 'Event')
        location = event.get('location', '')
        date = event.get('date', '')
        time = event.get('time', '')
        description = event.get('description', '')

        # Format the event entry without links
        event_entry = f"• {title}"

        if date and time:
            event_entry += f" - {date} at {time}"
        elif date:
            event_entry += f" - {date}"

        if location:
            event_entry += f"\n  📍 {location}"

        if description:
            event_entry += f"\n  {description}"

        event_text += event_entry + "\n\n"

    return event_text


def extract_joins_from_response(response_text: str, user_message: str, user_profile: Dict[str, Any] = None) -> List[Dict[str, Any]]:
    """Extract join recommendations from AI response and return structured data."""
    joins = []

    # Check if the response mentions specific activities that could be joins
    message_lower = user_message.lower()
    response_lower = response_text.lower()

    # Sample joins data - Interest-based groups with locations
    sample_joins = {
        'hiking_bay_area': {
            'id': 'join_hiking_bay_area_001',
            'title': 'Bay Area Hiking Enthusiasts',
            'description': 'A community for hiking lovers in the San Francisco Bay Area. We organize regular hikes, share trail recommendations, and connect people who love exploring nature. All skill levels welcome!',
            'location': 'San Francisco Bay Area, CA',
            'duration': 'Ongoing',
            'max_participants': 50,
            'current_participants': 23,
            'difficulty': 'all_levels',
            'tags': ['hiking', 'bay area', 'nature', 'trails', 'outdoor', 'community', 'weekend'],
            'match_score': 95,
            'created_at': '2024-01-15T10:00:00Z',
            'user': {
                'id': 'user_hiking_bay_area_001',
                'name': 'Sarah Martinez',
                'avatar': 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
                'email': 'sarah.martinez@example.com',
                'bio': 'Experienced hiker who has explored trails throughout the Bay Area for over 8 years. Loves sharing hidden gems and helping newcomers discover the joy of hiking. Weekend warrior who believes the best conversations happen on the trail!'
            }
        },
        'photography_sf': {
            'id': 'join_photography_sf_001',
            'title': 'San Francisco Photography Group',
            'description': 'Connect with fellow photographers in San Francisco! Share techniques, explore the city together, and improve your skills. From beginners to professionals, everyone is welcome.',
            'location': 'San Francisco, CA',
            'duration': 'Ongoing',
            'max_participants': 30,
            'current_participants': 18,
            'difficulty': 'all_levels',
            'tags': ['photography', 'san francisco', 'art', 'creative', 'urban', 'landscape', 'portrait'],
            'match_score': 88,
            'created_at': '2024-01-15T10:00:00Z',
            'user': {
                'id': 'user_photography_sf_001',
                'name': 'Emma Thompson',
                'avatar': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
                'email': 'emma.thompson@example.com',
                'bio': 'Professional photographer turned community builder. Specializes in urban and landscape photography around San Francisco. Passionate about helping others improve their skills and discover the city through a creative lens. Always up for a photo walk!'
            }
        },
        'climbing_oakland': {
            'id': 'join_climbing_oakland_001',
            'title': 'Oakland Rock Climbing Community',
            'description': 'Rock climbing group based in Oakland. We climb at local gyms, outdoor crags, and organize trips to Yosemite and Tahoe. Great for meeting climbing partners and improving skills.',
            'location': 'Oakland, CA',
            'duration': 'Ongoing',
            'max_participants': 25,
            'current_participants': 12,
            'difficulty': 'intermediate',
            'tags': ['climbing', 'rock climbing', 'oakland', 'yosemite', 'outdoor', 'adventure', 'fitness'],
            'match_score': 92,
            'created_at': '2024-01-15T14:00:00Z',
            'user': {
                'id': 'user_climbing_oakland_001',
                'name': 'Alex Rodriguez',
                'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                'email': 'alex.rodriguez@example.com',
                'bio': 'Rock climbing instructor with 10+ years experience. Loves introducing people to the sport and organizing trips to Yosemite and Tahoe. Believes climbing builds both physical strength and mental resilience. Always happy to belay a new climber!'
            }
        },
        'boating_peninsula': {
            'id': 'join_boating_peninsula_001',
            'title': 'Peninsula Boating & Sailing Club',
            'description': 'Sailing and boating enthusiasts on the Peninsula! We organize sailing trips, share boat maintenance tips, and welcome both experienced sailors and those wanting to learn.',
            'location': 'San Mateo County, CA',
            'duration': 'Ongoing',
            'max_participants': 40,
            'current_participants': 16,
            'difficulty': 'all_levels',
            'tags': ['boating', 'sailing', 'peninsula', 'water sports', 'bay area', 'ocean', 'marina'],
            'match_score': 89,
            'created_at': '2024-01-15T16:00:00Z',
            'user': {
                'id': 'user_boating_peninsula_001',
                'name': 'Mike Chen',
                'avatar': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                'email': 'mike.chen@example.com',
                'bio': 'Sailing enthusiast and boat owner who has been exploring the Bay for 15+ years. Enjoys teaching newcomers the ropes and organizing group sailing trips. Believes the best way to learn sailing is through hands-on experience with a supportive community.'
            }
        },
        'volleyball': {
            'id': 'join_volleyball_001',
            'title': 'Beach Volleyball Tournament',
            'description': 'Join our friendly beach volleyball tournament at Ocean Beach. Teams will be formed on-site, all skill levels welcome!',
            'location': 'Ocean Beach, San Francisco',
            'duration': '3 hours',
            'max_participants': 16,
            'current_participants': 8,
            'difficulty': 'intermediate',
            'tags': ['volleyball', 'beach', 'tournament', 'team sport', 'ocean beach'],
            'match_score': 90,
            'created_at': '2024-01-15T11:00:00Z',
            'user': {
                'id': 'user_volleyball_001',
                'name': 'Jessica Martinez',
                'avatar': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
                'email': 'jessica.martinez@example.com'
            }
        },
        'climbing': {
            'id': 'join_climbing_001',
            'title': 'Indoor Rock Climbing/Bouldering',
            'description': 'Try indoor rock climbing and bouldering! Equipment provided, perfect for beginners and experienced climbers alike.',
            'location': 'Mission Cliffs, San Francisco',
            'duration': '2 hours',
            'max_participants': 6,
            'current_participants': 2,
            'difficulty': 'beginner',
            'tags': ['climbing', 'bouldering', 'indoor', 'fitness', 'beginner-friendly'],
            'match_score': 94,
            'created_at': '2024-01-15T18:00:00Z',
            'user': {
                'id': 'user_climbing_001',
                'name': 'David Thompson',
                'avatar': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
                'email': 'david.thompson@example.com'
            }
        }
    }

    # Salt Lake City specific joins
    salt_lake_joins = {
        'skiing': {
            'id': 'join_skiing_slc_001',
            'title': 'Weekend Skiing at Park City',
            'description': 'Join us for a day of skiing at Park City Mountain Resort! Perfect for intermediate skiers. Lift tickets and equipment rental available.',
            'location': 'Park City Mountain Resort, Park City, UT',
            'duration': '6 hours',
            'max_participants': 8,
            'current_participants': 4,
            'difficulty': 'intermediate',
            'tags': ['skiing', 'winter sports', 'park city', 'mountains', 'utah'],
            'match_score': 95,
            'created_at': '2024-01-15T08:00:00Z',
            'user': {
                'id': 'user_skiing_slc_001',
                'name': 'Jake Morrison',
                'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                'email': 'jake.morrison@example.com'
            }
        },
        'hiking_slc': {
            'id': 'join_hiking_slc_001',
            'title': 'Antelope Island Hiking Adventure',
            'description': 'Explore the beautiful trails of Antelope Island State Park with stunning views of the Great Salt Lake and wildlife spotting opportunities.',
            'location': 'Antelope Island State Park, Syracuse, UT',
            'duration': '4 hours',
            'max_participants': 10,
            'current_participants': 6,
            'difficulty': 'intermediate',
            'tags': ['hiking', 'nature', 'antelope island', 'wildlife', 'great salt lake'],
            'match_score': 92,
            'created_at': '2024-01-15T09:00:00Z',
            'user': {
                'id': 'user_hiking_slc_001',
                'name': 'Emma Rodriguez',
                'avatar': 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
                'email': 'emma.rodriguez@example.com',
                'bio': 'Outdoor enthusiast and Utah native who has been exploring the trails around Salt Lake City for over 6 years. Loves sharing the beauty of Utah\'s landscapes with newcomers and organizing group hikes to hidden gems. Passionate about wildlife photography and conservation.'
            }
        },
        'climbing_slc': {
            'id': 'join_climbing_slc_001',
            'title': 'Rock Climbing at Little Cottonwood Canyon',
            'description': 'Experience world-class granite climbing in Little Cottonwood Canyon. All skill levels welcome, equipment provided for beginners.',
            'location': 'Little Cottonwood Canyon, Salt Lake City, UT',
            'duration': '5 hours',
            'max_participants': 6,
            'current_participants': 3,
            'difficulty': 'beginner',
            'tags': ['rock climbing', 'outdoor', 'granite', 'cottonwood canyon', 'utah'],
            'match_score': 94,
            'created_at': '2024-01-15T10:00:00Z',
            'user': {
                'id': 'user_climbing_slc_001',
                'name': 'Alex Chen',
                'avatar': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                'email': 'alex.chen@example.com'
            }
        },
        'cycling_slc': {
            'id': 'join_cycling_slc_001',
            'title': 'Jordan River Parkway Bike Ride',
            'description': 'Leisurely bike ride along the Jordan River Parkway trail. Perfect for all fitness levels with beautiful scenery and wildlife.',
            'location': 'Jordan River Parkway, Salt Lake City, UT',
            'duration': '3 hours',
            'max_participants': 12,
            'current_participants': 7,
            'difficulty': 'beginner',
            'tags': ['cycling', 'biking', 'jordan river', 'parkway', 'nature'],
            'match_score': 88,
            'created_at': '2024-01-15T11:00:00Z',
            'user': {
                'id': 'user_cycling_slc_001',
                'name': 'Sarah Johnson',
                'avatar': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
                'email': 'sarah.johnson@example.com'
            }
        },
        'food_slc': {
            'id': 'join_food_slc_001',
            'title': 'Salt Lake City Food Tour',
            'description': 'Discover the best local eats in downtown Salt Lake City! We\'ll visit 5 unique restaurants and food trucks showcasing Utah\'s culinary scene.',
            'location': 'Downtown Salt Lake City, UT',
            'duration': '4 hours',
            'max_participants': 8,
            'current_participants': 5,
            'difficulty': 'beginner',
            'tags': ['food', 'culinary', 'downtown', 'restaurants', 'local cuisine'],
            'match_score': 90,
            'created_at': '2024-01-15T12:00:00Z',
            'user': {
                'id': 'user_food_slc_001',
                'name': 'Maria Gonzalez',
                'avatar': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
                'email': 'maria.gonzalez@example.com'
            }
        },
        'arts_slc': {
            'id': 'join_arts_slc_001',
            'title': 'Gallery Stroll in Salt Lake City',
            'description': 'Join us for the monthly Gallery Stroll in downtown Salt Lake City. Explore local art galleries, meet artists, and enjoy the vibrant arts scene.',
            'location': 'Downtown Salt Lake City Art District, UT',
            'duration': '3 hours',
            'max_participants': 15,
            'current_participants': 9,
            'difficulty': 'beginner',
            'tags': ['art', 'gallery', 'culture', 'downtown', 'creative'],
            'match_score': 87,
            'created_at': '2024-01-15T17:00:00Z',
            'user': {
                'id': 'user_arts_slc_001',
                'name': 'Jordan Kim',
                'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                'email': 'jordan.kim@example.com'
            }
        },
        'winter_slc': {
            'id': 'join_winter_slc_001',
            'title': 'Snowshoeing in Big Cottonwood Canyon',
            'description': 'Experience the winter wonderland of Big Cottonwood Canyon on snowshoes. Perfect for beginners, equipment rental available.',
            'location': 'Big Cottonwood Canyon, Salt Lake City, UT',
            'duration': '4 hours',
            'max_participants': 8,
            'current_participants': 4,
            'difficulty': 'beginner',
            'tags': ['snowshoeing', 'winter', 'cottonwood canyon', 'snow', 'mountains'],
            'match_score': 91,
            'created_at': '2024-01-15T13:00:00Z',
            'user': {
                'id': 'user_winter_slc_001',
                'name': 'Tyler Anderson',
                'avatar': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
                'email': 'tyler.anderson@example.com'
            }
        }
    }

    # Only suggest joins if user explicitly asks for group activities or events
    group_activity_keywords = [
        'group', 'join', 'activity', 'event', 'meetup', 'together',
        'group activity', 'things to do', 'activities', 'events near me',
        'what can i do', 'looking for', 'want to do', 'interested in doing',
        'learn', 'meet', 'connect', 'find people', 'enthusiasts', 'community',
        'club', 'groups', 'sailing', 'hiking', 'climbing', 'boating', 'photography',
        'people who like', 'people who enjoy', 'others who', 'someone who'
    ]

    # Check if user is asking for group activities
    is_group_activity_request = any(keyword in message_lower for keyword in group_activity_keywords)

    if not is_group_activity_request:
        return joins  # Return empty list if not asking for group activities

    # Determine user's location for location-based filtering
    user_location = None

    # First check user profile location
    if user_profile and user_profile.get('location'):
        user_location = user_profile['location'].lower()
    elif hasattr(user_message, 'user') and user_message.user:
        # Try to get location from user profile
        if hasattr(user_message.user, 'contact_info') and user_message.user.contact_info:
            user_location = user_message.user.contact_info.get('location', '').lower()

    # If no user location available, try to extract from message context or default
    if not user_location:
        # Check if location is mentioned in the message
        location_keywords = {
            'salt lake': 'salt lake city',
            'utah': 'salt lake city',
            'slc': 'salt lake city',
            'san francisco': 'san francisco',
            'sf': 'san francisco',
            'bay area': 'san francisco'
        }

        for keyword, location in location_keywords.items():
            if keyword in message_lower:
                user_location = location
                break

    # Determine if user is in Salt Lake City area (check both message and profile location)
    is_salt_lake = (
        any(keyword in message_lower for keyword in ['salt lake', 'slc', 'utah', 'antelope island']) or
        (user_location and any(keyword in user_location for keyword in ['salt lake', 'utah', 'slc']))
    )

    # Check for activity keywords and add location-appropriate joins
    if any(word in message_lower for word in ['hiking', 'hike', 'trail', 'mountain', 'nature', 'outdoor']):
        if is_salt_lake:
            joins.append(salt_lake_joins['hiking_slc'])
        else:
            joins.append(sample_joins['hiking_bay_area'])

    if any(word in message_lower for word in ['photography', 'photo', 'camera', 'picture']):
        joins.append(sample_joins['photography_sf'])

    if any(word in message_lower for word in ['boating', 'boat', 'sailing', 'sail', 'marina', 'water sports']):
        joins.append(sample_joins['boating_peninsula'])

    if any(word in message_lower for word in ['climbing', 'climb', 'rock', 'boulder']):
        if is_salt_lake:
            joins.append(salt_lake_joins['climbing_slc'])
        else:
            joins.append(sample_joins['climbing_oakland'])

    # If no specific activity mentioned, suggest one popular group based on location
    if not joins:
        if is_salt_lake:
            joins.append(salt_lake_joins['hiking_slc'])
        else:
            joins.append(sample_joins['hiking_bay_area'])

    return joins


class ChatRequest(BaseModel):
    """Request schema for AI chat."""
    message: str
    context: Dict[str, Any] = {}


class ChatResponse(BaseModel):
    """Response schema for AI chat."""
    response: str
    tokens: int
    cost: float


class EnhancedChatRequest(BaseModel):
    """Enhanced request schema for Lifestring AI."""
    message: str
    context: Dict[str, Any] = {}
    intent_hint: Optional[str] = None  # User can hint at intent
    profile_data: Optional[Dict[str, Any]] = None  # Profile data for personalization


class EnhancedChatResponse(BaseModel):
    """Enhanced response schema with structured outputs."""
    message: str
    intent: str
    confidence: float
    actions: List[Dict[str, Any]] = []
    suggested_strings: List[Dict[str, Any]] = []
    suggested_connections: List[str] = []
    suggested_joins: List[Dict[str, Any]] = []
    tokens: int
    cost: float


class SimpleChatResponse(BaseModel):
    """Simple chat response for natural conversation."""
    message: str
    intent: str = "general_chat"
    confidence: float = 1.0
    joins: List[Dict[str, Any]] = []  # Add joins field for structured join data
    tokens: int = 0  # Add tokens field
    cost: float = 0.0  # Add cost field


@router.post("/ai/chat", response_model=ChatResponse)
async def create_ai_chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new AI chat room and get first response.
    """
    # Create AI chat room
    room = Room(
        name=f"AI Chat - {current_user.name or 'User'}",
        room_metadata={
            "type": "ai_chat",
            "model": settings.CHAT_MODEL,
            "created_by": str(current_user.user_id)
        }
    )
    db.add(room)
    db.flush()
    
    # Add user as participant
    participant = RoomParticipant(
        room_id=room.id,
        user_id=current_user.user_id
    )
    db.add(participant)
    
    
    # Add AI bot as participant
    ai_participant = RoomParticipant(
        room_id=room.id,
        user_id=settings.AI_BOT_USER_ID
    )
    db.add(ai_participant)
    
    # Save user message
    user_message = Message(
        room_id=room.id,
        user_id=current_user.user_id,
        content=request.message
    )
    db.add(user_message)
    db.commit()
    
    # Build context for AI
    system_prompt = await build_system_prompt(current_user, request.context)
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": request.message}
    ]
    
    # Get AI response
    ai_response = await openai_service.chat_completion(messages)
    
    # Save AI response
    ai_message = Message(
        room_id=room.id,
        user_id=settings.AI_BOT_USER_ID,
        content=ai_response["content"]
    )
    db.add(ai_message)
    db.commit()
    
    return {
        "response": ai_response["content"],
        "tokens": ai_response["tokens"],
        "cost": ai_response["cost"]
    }


@router.post("/ai/chat/{room_id}/message", response_model=ChatResponse)
async def send_ai_chat_message(
    room_id: str,
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Send a message to an existing AI chat room.
    """
    # Get room
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    # Check if user is participant
    if not room.has_participant(current_user.user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this room"
        )
    
    # Check if it's an AI chat room
    if not room.is_ai_chat:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This is not an AI chat room"
        )
    
    # Save user message
    user_message = Message(
        room_id=room.id,
        user_id=current_user.user_id,
        content=request.message
    )
    db.add(user_message)
    db.commit()
    
    # Get conversation history
    history = db.query(Message).filter(
        Message.room_id == room_id
    ).order_by(Message.created_at).limit(20).all()
    
    # Build messages for AI
    system_prompt = await build_system_prompt(current_user, request.context)
    messages = [{"role": "system", "content": system_prompt}]
    
    for msg in history:
        role = "assistant" if msg.user_id == settings.AI_BOT_USER_ID else "user"
        messages.append({"role": role, "content": msg.content})
    
    # Get AI response
    ai_response = await openai_service.chat_completion(messages)
    
    # Save AI response
    ai_message = Message(
        room_id=room.id,
        user_id=settings.AI_BOT_USER_ID,
        content=ai_response["content"]
    )
    db.add(ai_message)
    db.commit()
    
    return {
        "response": ai_response["content"],
        "tokens": ai_response["tokens"],
        "cost": ai_response["cost"]
    }


@router.post("/ai/chat/{room_id}/stream")
async def stream_ai_chat_message(
    room_id: str,
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Send a message to AI chat and stream the response.
    """
    # Get room
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    # Check if user is participant
    if not room.has_participant(current_user.user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this room"
        )
    
    # Save user message
    user_message = Message(
        room_id=room.id,
        user_id=current_user.user_id,
        content=request.message
    )
    db.add(user_message)
    db.commit()
    
    # Get conversation history
    history = db.query(Message).filter(
        Message.room_id == room_id
    ).order_by(Message.created_at).limit(20).all()
    
    # Build messages for AI
    system_prompt = await build_system_prompt(current_user, request.context)
    messages = [{"role": "system", "content": system_prompt}]
    
    for msg in history:
        role = "assistant" if msg.user_id == settings.AI_BOT_USER_ID else "user"
        messages.append({"role": role, "content": msg.content})
    
    # Stream response
    async def generate():
        full_response = ""
        async for chunk in openai_service.chat_completion_stream(messages):
            full_response += chunk
            yield chunk
        
        # Save complete response
        ai_message = Message(
            room_id=room.id,
            user_id=settings.AI_BOT_USER_ID,
            content=full_response
        )
        db.add(ai_message)
        db.commit()
    
    return StreamingResponse(generate(), media_type="text/event-stream")


@router.post("/ai/lifestring-chat-public", response_model=SimpleChatResponse)
async def lifestring_ai_chat_public(
    request: EnhancedChatRequest
):
    """
    Public AI chat endpoint for natural conversation (no auth required).
    """
    import logging
    logger = logging.getLogger(__name__)

    try:
        from app.services.realtime_service import realtime_service

        logger.info(f"Received message: {request.message}")
        logger.info(f"Request context: {request.context}")
        logger.info(f"realtime_service available: {realtime_service is not None}")

        # Check if profile data was provided (either directly or in context)
        profile_data = request.profile_data
        if not profile_data and request.context and 'profile_data' in request.context:
            profile_data = request.context.get('profile_data')
            logger.info(f"Profile data extracted from context: {profile_data}")

        if profile_data:
            logger.info(f"Using profile data: {profile_data}")
            logger.info(f"🔍 PROFILE DATA FOUND - WILL PROCESS WITH JOINS")

            # Handle profile-specific queries directly
            message_lower = request.message.lower()
            if "passions" in message_lower or "interests" in message_lower or "hobbies" in message_lower:
                interests = profile_data.get('interests', []) or []
                passions = profile_data.get('passions', []) or []
                hobbies = profile_data.get('hobbies', []) or []
                bio = profile_data.get('bio', '') or ''

                # If asking specifically about passions
                if "passions" in message_lower:
                    if passions:
                        passions_text = ", ".join(passions)
                        message = f"Based on your profile, your passions include: {passions_text}!"
                        if bio:
                            message += f" Your bio says: '{bio}'"
                        message += " Would you like to explore these passions further or connect with others who share them?"
                    else:
                        message = "I don't see any passions listed in your profile yet. You can add them in your profile settings to help me provide more personalized suggestions!"

                    return SimpleChatResponse(
                        message=message,
                        intent="profile_inquiry",
                        confidence=0.95,
                        joins=[],
                        tokens=0,
                        cost=0.0
                    )

                # If asking specifically about hobbies
                elif "hobbies" in message_lower:
                    if hobbies:
                        hobbies_text = ", ".join(hobbies)
                        message = f"Based on your profile, your hobbies include: {hobbies_text}."
                    else:
                        message = "I don't see any hobbies listed in your profile yet. You can add them in your profile settings to help me provide more personalized suggestions!"

                    return SimpleChatResponse(
                        message=message,
                        intent="profile_inquiry",
                        confidence=0.95,
                        joins=[],
                        tokens=0,
                        cost=0.0
                    )

                # For interests query
                else:
                    all_interests = list(set(interests + passions))
                    if all_interests:
                        interests_text = ", ".join(all_interests)
                        message = f"Based on your profile, I can see you're interested in: {interests_text}!"
                        if bio:
                            message += f" Your bio says: '{bio}'"
                        message += " Would you like to explore these interests further or connect with others who share them?"
                    else:
                        message = "I don't see any specific interests listed in your profile yet. You can add them in your profile settings to help me provide more personalized suggestions!"

                    return SimpleChatResponse(
                        message=message,
                        intent="profile_inquiry",
                        confidence=0.95,
                        joins=[],
                        tokens=0,
                        cost=0.0
                    )

            # For other messages with profile data, use enhanced OpenAI with real-time capabilities
            import json

            # Build comprehensive personalized system prompt with current time/date
            import datetime
            import pytz
            from app.services.realtime_service import realtime_service

            # Get user's location from profile data for timezone detection
            user_location = None
            if profile_data:
                user_location = profile_data.get('location')

            # Get current time in user's timezone
            time_info = await realtime_service.get_current_time(user_location)
            current_time = time_info["current_time"]
            current_date = time_info["current_date"]

            # Also get times for major US timezones for reference
            import pytz
            utc_now = datetime.datetime.now(pytz.UTC)
            pst_time = utc_now.astimezone(pytz.timezone('US/Pacific')).strftime("%I:%M %p")
            mst_time = utc_now.astimezone(pytz.timezone('US/Mountain')).strftime("%I:%M %p")
            cst_time = utc_now.astimezone(pytz.timezone('US/Central')).strftime("%I:%M %p")
            est_time = utc_now.astimezone(pytz.timezone('US/Eastern')).strftime("%I:%M %p")

            # Extract potential joins from user message to include in system prompt
            logger.info(f"🔍 EXTRACTING JOINS FOR SYSTEM PROMPT")
            potential_joins = extract_joins_from_response("", request.message, profile_data)
            logger.info(f"🔍 POTENTIAL JOINS: {len(potential_joins) if potential_joins else 0}")

            # Prepare join information for system prompt
            join_prompt_addition = ""
            if potential_joins:
                join_info = potential_joins[0]  # Only use the first/most relevant join
                logger.info(f"🔍 JOIN INFO: {join_info['title']} by {join_info['user']['name']}")
                join_prompt_addition = f"""

**RECOMMENDED JOIN FOR THIS CONVERSATION:**
You should recommend the "{join_info['title']}" group in {join_info['location']}.
- Description: {join_info['description']}
- Created by: {join_info['user']['name']} - {join_info['user']['bio']}
- Location: {join_info['location']}
- Current members: {join_info['current_participants']}/{join_info['max_participants']}

CRITICAL INSTRUCTION: The user is asking about finding people with shared interests. You MUST respond by recommending the specific group above. Use this exact format:

"I'd recommend checking out the {join_info['title']} group! It was created by {join_info['user']['name']}."

DO NOT mention "Strings feed" or any other location - the join card will appear directly below your message.
DO NOT include the full bio in your text response - the join card will display that information.
DO NOT mention Connections feature. DO NOT give generic advice. ALWAYS mention the specific group name and creator name only."""
            else:
                logger.info(f"🔍 NO JOINS FOUND for message: {request.message}")

            system_prompt = f"""You are Strings, Lifestring's AI assistant. You can answer any questions the user has naturally and conversationally.

Current time: {current_time} on {current_date}.

TIMEZONE REFERENCE (for location-specific time queries):
- Pacific Time: {pst_time}
- Mountain Time: {mst_time} (Utah, Colorado, etc.)
- Central Time: {cst_time}
- Eastern Time: {est_time}

You are having a conversation with a user on Lifestring. Here's how Lifestring works:

**YOU ARE STRINGS**: You are the AI that users chat with about what they want to do and who they want to meet.

**JOINS**: These are specific events/activities with set times and locations that users can join. Joins are integrated directly into the main Strings interface - there is NO separate "Joins section". When users tell you what they want to do, recommend relevant Joins they can find in their main Strings feed.

**CONNECTIONS**: This is how users find friends - they get recommended people based on interests, location, and age. When users want to meet people, direct them to check their Connections.

**IMPORTANT UI STRUCTURE**:
- Lifestring Joins (ongoing groups/communities) appear as interactive cards directly in the chat with clickable buttons
- Real-time events (concerts, activities happening now) should be provided directly in your chat response with all details
- NEVER mention "Strings feed", "main Strings interface", "Joins section", or any separate interface
- NEVER mention "event cards", "cards appearing", or "look for cards" - just provide event information directly in your response
- When suggesting Lifestring community groups, provide natural conversational responses and let the join cards appear automatically below your message

**YOUR APPROACH**:
1. Answer general questions naturally (weather, time, jokes, etc.) - but ONLY respond with time when specifically asked "what time is it"
2. When users ask for group activities or events, provide natural conversational responses about what's available
3. When users want to meet people or make friends, direct them to their Connections feature
4. Have natural conversations about their interests and goals
5. NEVER mention external platforms like Meetup, Facebook, etc.
6. Focus on Lifestring's features: Joins for activities, Connections for meeting people
7. NEVER use markdown formatting like **bold** or *italics* - use plain text only
8. NEVER mention any separate interface - Lifestring joins appear directly in the chat as clickable cards, but real-time events should be provided directly in your response
9. PRIORITIZE real-time events over static joins when users ask about specific times:
   - "What can I do in Salt Lake tomorrow?" → suggest real-time events (museums, gardens, seasonal activities)
   - "What can I do in Salt Lake this weekend?" → suggest both real-time events and recurring joins
   - "I want to find hiking groups" → suggest static joins for ongoing activities
10. ALWAYS match suggestions to the location mentioned in their message FIRST, then fall back to their profile location
   - If they ask "What can I do in Utah?" → recommend Utah activities regardless of profile location
   - If they ask "What can I do in San Francisco?" → recommend Bay Area activities regardless of profile location
   - If no location mentioned in message → use their profile location

**LOCATION DETECTION PRIORITY**:
1. If user mentions "Utah", "Salt Lake", "SLC" in their message → recommend Utah activities
2. If user mentions "San Francisco", "SF", "Bay Area", "Berkeley" in their message → recommend Bay Area activities
3. If no location mentioned → use their profile location

**IMPORTANT**: When users ask about groups or communities on Lifestring, you will be provided with specific join recommendations in the system prompt. Prioritize recommending these specific joins. However, when users ask about real-time events, activities, or things happening in specific locations, you can use your Google Search capabilities to provide current, accurate information about events, activities, and happenings in their requested location.

**SMART CATEGORIZATION**: Automatically understand activity types from context:
- Hiking, camping, surfing → Outdoor Adventures
- Cooking, wine tasting, food tours → Culinary Experiences
- Photography, art, music → Creative Activities
- Volleyball, tennis, running → Active Sports
- Book clubs, lectures, discussions → Intellectual Pursuits
- Yoga, meditation, wellness → Wellness & Mindfulness
- Parties, meetups, social events → Social Experiences
- Gym, climbing, fitness classes → Fitness Challenges

**REMEMBER**: You are Strings - the conversational AI. Users chat with you, and you help them discover Joins and Connections on Lifestring.{join_prompt_addition}"""

            interests = profile_data.get('interests', []) or []
            hobbies = profile_data.get('hobbies', []) or []
            bio = profile_data.get('bio', '') or ''
            profile_questions = profile_data.get('profile_questions', {}) or {}
            name = profile_data.get('contact_info', {}).get('name', 'User') if 'contact_info' in profile_data else 'User'

            # Add age, location, birthday context
            age = profile_data.get('age')
            location = profile_data.get('location')
            birthday = profile_data.get('birthday')

            # Build comprehensive profile context
            profile_context = []
            if bio:
                profile_context.append(f"Bio: '{bio}'")

            if interests:
                profile_context.append(f"Interests: {', '.join(interests)}")

            if hobbies:
                profile_context.append(f"Hobbies: {', '.join(hobbies)}")

            if age:
                profile_context.append(f"Age: {age}")

            if location:
                profile_context.append(f"Location: {location}")

            if birthday:
                profile_context.append(f"Birthday: {birthday}")

            # Add profile questions to context
            if profile_questions:
                profile_context.append("Profile Questions & Answers:")
                for question_key, answer in profile_questions.items():
                    if answer and str(answer).strip():  # Only include non-empty answers
                        # Convert question key to actual question text
                        actual_question = convert_question_key_to_text(question_key)
                        profile_context.append(f"  Q: {actual_question}")
                        profile_context.append(f"  A: {answer}")

            # Always include the user's name in the system prompt
            system_prompt += f"\n\nYou're talking to {name}."

            if profile_context:
                system_prompt += f" Here's their profile:\n" + "\n".join(profile_context)
                system_prompt += "\n\nUse this information to provide personalized, relevant responses and recommendations based on their location, age, interests, and the current time."

            # Prepare messages for OpenAI
            messages = [
                {"role": "system", "content": system_prompt}
            ]

            # Add conversation history if provided
            conversation_history = request.context.get('conversation_history', [])
            if conversation_history:
                logger.info(f"Adding conversation history: {len(conversation_history)} messages")
                for msg in conversation_history:
                    if msg.get('type') == 'user':
                        messages.append({"role": "user", "content": msg.get('content', '')})
                    elif msg.get('type') == 'ai':
                        messages.append({"role": "assistant", "content": msg.get('content', '')})

            # Add current message
            messages.append({"role": "user", "content": request.message})

            # Use hybrid AI service if available, otherwise fallback to OpenAI
            logger.info(f"hybrid_ai_service available: {hybrid_ai_service is not None}")
            if hybrid_ai_service:
                response = await hybrid_ai_service.chat_completion(
                    messages=messages,
                    temperature=0.7,
                    max_tokens=500,
                    context={"profile_data": profile_data}
                )
            else:
                # Fallback to OpenAI with function calling
                tools = realtime_service.get_available_functions() if realtime_service else None
                logger.info(f"Using enhanced OpenAI service with tools: {tools is not None}")
                response = await openai_service.chat_completion(
                    messages=messages,
                    model="gpt-4o",
                    temperature=0.7,
                    max_tokens=500,
                    tools=tools if tools else None
                )

            # Handle function calls if present (only for OpenAI fallback)
            if not hybrid_ai_service and response.get("tool_calls"):
                # Execute function calls
                for tool_call in response["tool_calls"]:
                    function_name = tool_call["function"]["name"]
                    arguments = json.loads(tool_call["function"]["arguments"])

                    # Execute the function
                    function_result = await realtime_service.execute_function(function_name, arguments) if realtime_service else {"error": "Real-time service not available"}

                    # Add function result to messages
                    messages.append({
                        "role": "assistant",
                        "content": response["content"],
                        "tool_calls": [
                            {
                                "id": tc["id"],
                                "type": "function",
                                "function": tc["function"]
                            }
                            for tc in response["tool_calls"]
                        ]
                    })
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call["id"],
                        "content": json.dumps(function_result)
                    })

                # Get final response with function results
                final_response = await openai_service.chat_completion(
                    messages=messages,
                    model="gpt-4o",
                    temperature=0.7,
                    max_tokens=500
                )
            else:
                # For hybrid AI service, the response is already final
                final_response = response

                # Only use old real-time events search for OpenAI fallback
                if not hybrid_ai_service:
                    # Search for real-time events if user is asking about them
                    real_time_events = await search_real_time_events(request.message, profile_data)
                    response_message = final_response["content"]

                    # Check if this is a time-specific query that should only show real-time events
                    message_lower = request.message.lower()
                    real_time_only_keywords = [
                        'tomorrow', 'today', 'tonight', 'this evening',
                        'this weekend', 'weekend', 'next week', 'this month',
                        'what can i do tomorrow', 'what can i do today',
                        'what can i do this weekend', 'what\'s happening tomorrow',
                        'what\'s happening today', 'what\'s happening this weekend'
                    ]

                    is_real_time_only_query = any(keyword in message_lower for keyword in real_time_only_keywords)

                    if real_time_events:
                        # Add events as formatted text to the response
                        events_text = format_events_as_text(real_time_events)
                        if is_real_time_only_query:
                            response_message = events_text  # Replace AI response with just events for time-specific queries
                        else:
                            response_message += events_text  # Append events to AI response for general queries
                        logger.info(f"Added {len(real_time_events)} real-time events to response text")

                    # Only include joins if it's not a time-specific query
                    joins = [] if is_real_time_only_query else extract_joins_from_response(final_response["content"], request.message, profile_data)
                else:
                    # For hybrid AI service, use the response as-is (Google Grounding handles real-time data)
                    response_message = final_response["content"]
                    joins = extract_joins_from_response(final_response["content"], request.message, profile_data)

                return SimpleChatResponse(
                    message=response_message,
                    intent="general_chat",
                    confidence=0.9,
                    joins=joins,
                    tokens=final_response.get("tokens", 0),
                    cost=final_response.get("cost", 0.0)
                )

            # Only use old real-time events search for OpenAI fallback
            if not hybrid_ai_service:
                # Search for real-time events if user is asking about them
                real_time_events = await search_real_time_events(request.message, profile_data)
                response_message = response["content"]

                # Check if this is a time-specific query that should only show real-time events
                message_lower = request.message.lower()
                real_time_only_keywords = [
                    'tomorrow', 'today', 'tonight', 'this evening',
                    'this weekend', 'weekend', 'next week', 'this month',
                    'what can i do tomorrow', 'what can i do today',
                    'what can i do this weekend', 'what\'s happening tomorrow',
                    'what\'s happening today', 'what\'s happening this weekend'
                ]

                is_real_time_only_query = any(keyword in message_lower for keyword in real_time_only_keywords)

                if real_time_events:
                    # Add events as formatted text to the response
                    events_text = format_events_as_text(real_time_events)
                    if is_real_time_only_query:
                        response_message = events_text  # Replace AI response with just events for time-specific queries
                    else:
                        response_message += events_text  # Append events to AI response for general queries
                    logger.info(f"Added {len(real_time_events)} real-time events to response text")

                # Only include joins if it's not a time-specific query
                joins = [] if is_real_time_only_query else extract_joins_from_response(response["content"], request.message, profile_data)
            else:
                # For hybrid AI service, use the response as-is (Google Grounding handles real-time data)
                response_message = response["content"]
                joins = extract_joins_from_response(response["content"], request.message, profile_data)

            return SimpleChatResponse(
                message=response_message,
                intent="general_chat",
                confidence=0.9,
                joins=joins,
                tokens=response.get("tokens", 0),
                cost=response.get("cost", 0.0)
            )

        # If no profile data, use enhanced OpenAI with real-time capabilities
        import json
        import datetime
        from app.services.realtime_service import realtime_service

        # Get user's location from profile data for timezone detection
        user_location = None
        if profile_data:
            user_location = profile_data.get('location')

        # Get current time in user's timezone
        time_info = await realtime_service.get_current_time(user_location)
        current_time = time_info["current_time"]
        current_date = time_info["current_date"]

        # Also get times for major US timezones for reference
        import pytz
        utc_now = datetime.datetime.now(pytz.UTC)
        pst_time = utc_now.astimezone(pytz.timezone('US/Pacific')).strftime("%I:%M %p")
        mst_time = utc_now.astimezone(pytz.timezone('US/Mountain')).strftime("%I:%M %p")
        cst_time = utc_now.astimezone(pytz.timezone('US/Central')).strftime("%I:%M %p")
        est_time = utc_now.astimezone(pytz.timezone('US/Eastern')).strftime("%I:%M %p")

        # Extract potential joins from user message to include in system prompt
        logger.info(f"🔍 EXTRACTING JOINS FOR SYSTEM PROMPT")
        potential_joins = extract_joins_from_response("", request.message, profile_data)
        logger.info(f"🔍 POTENTIAL JOINS: {len(potential_joins) if potential_joins else 0}")

        # Prepare join information for system prompt
        join_prompt_addition = ""
        if potential_joins:
            join_info = potential_joins[0]  # Only use the first/most relevant join
            logger.info(f"🔍 JOIN INFO: {join_info['title']} by {join_info['user']['name']}")
            join_prompt_addition = f"""

**RECOMMENDED JOIN FOR THIS CONVERSATION:**
You should recommend the "{join_info['title']}" group in {join_info['location']}.
- Description: {join_info['description']}
- Created by: {join_info['user']['name']} - {join_info['user']['bio']}
- Location: {join_info['location']}
- Current members: {join_info['current_participants']}/{join_info['max_participants']}

CRITICAL INSTRUCTION: The user is asking about finding people with shared interests. You MUST respond by recommending the specific group above. Use this exact format:

"I'd recommend checking out the {join_info['title']} group! It was created by {join_info['user']['name']}, who {join_info['user']['bio']} You can find this group in your Strings feed."

DO NOT mention Connections feature. DO NOT give generic advice. ALWAYS mention the specific group name and creator details."""
        else:
            logger.info(f"🔍 NO JOINS FOUND for message: {request.message}")

        system_prompt = f"""You are Strings, Lifestring's AI assistant. You can answer any questions the user has naturally and conversationally.

Current time: {current_time} on {current_date}.

TIMEZONE REFERENCE (for location-specific time queries):
- Pacific Time: {pst_time}
- Mountain Time: {mst_time} (Utah, Colorado, etc.)
- Central Time: {cst_time}
- Eastern Time: {est_time}

You are having a conversation with a user on Lifestring. Here's how Lifestring works:

**YOU ARE STRINGS**: You are the AI that users chat with about what they want to do and who they want to meet.

**JOINS**: These are ongoing interest-based groups/communities where people with shared interests connect and organize activities together. Joins are integrated directly into the main Strings interface - there is NO separate "Joins section". When users ask about finding groups or communities, recommend ONE relevant Join they can find in their main Strings feed.

**CONNECTIONS**: This is how users find friends - they get recommended people based on interests, location, and age. When users want to meet people, direct them to check their Connections.

**IMPORTANT UI STRUCTURE**:
- Joins are NOT in a separate section - they appear as cards in the main Strings interface
- NEVER say "you can find this event under the Joins section" or similar
- Instead say "you can find this event in your Strings feed" or "look for this in your main Strings interface"

**YOUR APPROACH**:
1. Answer general questions naturally (weather, time, jokes, etc.) - but ONLY respond with time when specifically asked "what time is it"
2. When users tell you what they want to do or activities they're interested in, recommend relevant Joins they can find in their Strings feed
3. When users want to meet people or make friends, direct them to their Connections where they'll find recommended people
4. Have natural conversations about their interests and goals
5. NEVER mention external platforms like Meetup, Facebook, etc.
6. Focus on Lifestring's features: Joins for activities, Connections for meeting people
7. NEVER use markdown formatting like **bold** or *italics* - use plain text only
8. NEVER mention a "Joins section" - joins are integrated into the main Strings interface
9. ONLY suggest Joins when user explicitly asks for group activities, events, or things to do
10. ALWAYS match Join suggestions to user's location - Salt Lake City gets Utah activities, San Francisco gets Bay Area activities

**IMPORTANT**: When users ask about groups or communities on Lifestring, you will be provided with specific join recommendations in the system prompt. Prioritize recommending these specific joins. However, when users ask about real-time events, activities, or things happening in specific locations, you can use your Google Search capabilities to provide current, accurate information about events, activities, and happenings in their requested location.

**SMART CATEGORIZATION**: Automatically understand activity types from context:
- Hiking, camping, surfing → Outdoor Adventures
- Cooking, wine tasting, food tours → Culinary Experiences
- Photography, art, music → Creative Activities
- Volleyball, tennis, running → Active Sports
- Book clubs, lectures, discussions → Intellectual Pursuits
- Yoga, meditation, wellness → Wellness & Mindfulness
- Parties, meetups, social events → Social Experiences
- Gym, climbing, fitness classes → Fitness Challenges

**REAL-TIME EVENTS**: When users ask about events, activities, or things happening in specific locations (like "what events are happening in Madrid this weekend" or "who's playing at The Depot"), use your Google Search capabilities to find current, real-time information. Provide specific event names, dates, times, locations, and ticket information directly in your chat response. NEVER mention "event cards" or "cards appearing" - just give the information directly.

**REMEMBER**: You are Strings - the conversational AI. Users chat with you, and you help them discover Joins and Connections on Lifestring.{join_prompt_addition}"""

        # Prepare messages for OpenAI
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": request.message}
        ]

        # Use hybrid AI service if available, otherwise fallback to OpenAI
        logger.info(f"🔍 ABOUT TO CALL HYBRID AI SERVICE - system_prompt length: {len(system_prompt)}")
        logger.info(f"Profile data available - hybrid_ai_service available: {hybrid_ai_service is not None}")
        if hybrid_ai_service:
            # Get available real-time functions for hybrid AI service
            tools = realtime_service.get_available_functions() if realtime_service else None
            logger.info(f"Providing tools to hybrid AI service: {tools is not None}")

            response = await hybrid_ai_service.chat_completion(
                messages=messages,
                temperature=0.7,
                max_tokens=500,
                context={},
                tools=tools
            )
        else:
            # Get available real-time functions
            tools = realtime_service.get_available_functions() if realtime_service else None
            logger.info(f"Fallback to OpenAI service with tools: {tools is not None}")

            # Get AI response with function calling capability
            response = await openai_service.chat_completion(
                messages=messages,
                model=settings.CHAT_MODEL,
            temperature=0.7,
            max_tokens=500,
            tools=tools if tools else None
        )

        # Handle function calls if present
        if response.get("tool_calls"):
            logger.info(f"Processing {len(response['tool_calls'])} function calls from {'hybrid AI service' if hybrid_ai_service else 'OpenAI fallback'}")

            # Execute function calls
            for tool_call in response["tool_calls"]:
                function_name = tool_call["function"]["name"]
                arguments = json.loads(tool_call["function"]["arguments"])

                # Execute the function
                function_result = await realtime_service.execute_function(function_name, arguments) if realtime_service else {"error": "Real-time service not available"}

                # Add function result to messages
                messages.append({
                    "role": "assistant",
                    "content": response["content"],
                    "tool_calls": [
                        {
                            "id": tc["id"],
                            "type": "function",
                            "function": tc["function"]
                        }
                        for tc in response["tool_calls"]
                    ]
                })
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call["id"],
                    "content": json.dumps(function_result)
                })

            # Get final response with function results
            if hybrid_ai_service:
                final_response = await hybrid_ai_service.chat_completion(
                    messages=messages,
                    temperature=0.7,
                    max_tokens=500,
                    context={},
                    tools=tools
                )
            else:
                final_response = await openai_service.chat_completion(
                    messages=messages,
                    model="gpt-4o",
                    temperature=0.7,
                    max_tokens=500
                )
        else:
            # No function calls, use response as-is
            final_response = response

        logger.info(f"AI response: {final_response['content']}")

        # Only use old real-time events search for OpenAI fallback
        if not hybrid_ai_service:
            # Search for real-time events if user is asking about them
            real_time_events = await search_real_time_events(request.message, profile_data)
            response_message = final_response["content"]

            # Check if this is a time-specific query that should only show real-time events
            message_lower = request.message.lower()
            real_time_only_keywords = [
                'tomorrow', 'today', 'tonight', 'this evening',
                'this weekend', 'weekend', 'next week', 'this month',
                'what can i do tomorrow', 'what can i do today',
                'what can i do this weekend', 'what\'s happening tomorrow',
                'what\'s happening today', 'what\'s happening this weekend'
            ]

            is_real_time_only_query = any(keyword in message_lower for keyword in real_time_only_keywords)

            if real_time_events:
                # Add events as formatted text to the response
                events_text = format_events_as_text(real_time_events)
                if is_real_time_only_query:
                    response_message = events_text  # Replace AI response with just events for time-specific queries
                else:
                    response_message += events_text  # Append events to AI response for general queries
                logger.info(f"Added {len(real_time_events)} real-time events to response text")

            # Only include joins if it's not a time-specific query
            joins = [] if is_real_time_only_query else extract_joins_from_response(final_response["content"], request.message, None)
        else:
            # For hybrid AI service, use the response as-is (Google Grounding handles real-time data)
            response_message = final_response["content"]
            joins = extract_joins_from_response(final_response["content"], request.message, None)

        return SimpleChatResponse(
            message=response_message,
            intent="general_chat",
            confidence=0.9,
            joins=joins,
            tokens=final_response.get("tokens", 0),
            cost=final_response.get("cost", 0.0)
        )


    except Exception as e:
        logger.error(f"Error in AI chat: {str(e)}", exc_info=True)
        # Fallback response for any errors
        return SimpleChatResponse(
            message="I'm having trouble connecting right now. Please try again in a moment.",
            intent="general_chat",
            confidence=1.0,
            joins=[],
            tokens=0,
            cost=0.0
        )



@router.post("/ai/test-auth")
async def test_auth(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Test JWT authentication without database access."""
    try:
        from app.core.security import get_user_id_from_token
        token = credentials.credentials
        user_id = get_user_id_from_token(token)
        return {"success": True, "user_id": user_id, "message": "JWT authentication successful"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"JWT validation failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.get("/ai/debug-config")
async def debug_config():
    """Debug endpoint to check configuration."""
    from app.core.config import settings
    return {
        "jwt_secret_length": len(settings.SUPABASE_JWT_SECRET),
        "jwt_secret_start": settings.SUPABASE_JWT_SECRET[:20] + "...",
        "supabase_url": settings.SUPABASE_URL,
        "algorithm": settings.ALGORITHM
    }


@router.post("/ai/public-chat", response_model=EnhancedChatResponse)
async def public_ai_chat(
    request: EnhancedChatRequest,
    db: Session = Depends(get_db)
):
    """
    Public AI chat endpoint for testing (no authentication required).
    Uses the enhanced Lifestring AI service with Connected Strings search.
    """
    try:
        # Create a mock user for public endpoint (required by process_user_message)
        from app.models.user import User
        import uuid
        mock_user = User(
            user_id=uuid.uuid4(),
            contact_info={
                "email": "public@example.com",
                "name": "Public User"
            },
            attributes={},
            biography={},
            meta={}
        )

        # Use the enhanced Lifestring AI service with database access
        response = await lifestring_ai.process_user_message(
            message=request.message,
            user=mock_user,
            conversation_history=None,
            context=request.context,
            db_session=db  # Pass database session for Connected Strings search
        )

        # Convert AIResponse to EnhancedChatResponse format
        # Convert AIAction objects to dictionaries
        actions_dict = []
        for action in response.actions:
            actions_dict.append({
                "type": action.type.value if hasattr(action.type, 'value') else str(action.type),
                "data": action.data,
                "description": action.description
            })

        return EnhancedChatResponse(
            message=response.message,
            intent=response.intent.value if hasattr(response.intent, 'value') else str(response.intent),
            confidence=response.confidence,
            actions=actions_dict,
            suggested_strings=response.suggested_strings,
            suggested_connections=response.suggested_connections,
            suggested_joins=response.suggested_joins,
            tokens=0,  # AIResponse doesn't track tokens
            cost=0.0   # AIResponse doesn't track cost
        )

    except Exception as e:
        print(f"Error in public_ai_chat: {e}")
        return EnhancedChatResponse(
            message="I'm having trouble connecting right now. Please try again in a moment.",
            intent="error",
            confidence=1.0,
            actions=[],
            suggested_strings=[],
            suggested_connections=[],
            suggested_joins=[],
            tokens=0,
            cost=0.0
        )


@router.post("/ai/lifestring-chat-test", response_model=EnhancedChatResponse)
async def lifestring_ai_chat_test(request: EnhancedChatRequest):
    """
    TEST ENDPOINT: Enhanced AI chat with Lifestring-specific features (no auth required).
    Returns structured responses with actions for Strings, Connections, and Joins.
    """
    try:
        # Use a test user ID for testing
        user_id = "6d259f2e-189c-4d31-a6bd-139ccd986b30"  # Phoebe's user ID for testing

        # Use profile data from request if provided (either directly or in context), otherwise fetch from database
        profile_data = None
        if hasattr(request, 'profile_data') and request.profile_data:
            profile_data = request.profile_data
            print(f"Using profile data from request.profile_data: {profile_data}")
        elif request.context and 'profile_data' in request.context:
            profile_data = request.context.get('profile_data')
            print(f"Using profile data from request.context: {profile_data}")

        if not profile_data:
            # Use centralized profile service
            from app.services.profile_service import profile_service
            profile_data = await profile_service.get_user_profile(user_id)

            if not profile_data:
                # Fallback to test data for known user
                if user_id == "a90f0ea5-ba98-44f5-a3a7-a922db9e1523":
                    profile_data = {
                        "bio": "I love climbing",
                        "interests": ["climbing"],
                        "passions": ["climbing", "hiking", "photography"],
                        "hobbies": ["camping", "hiking", "rock climbing", "photography"],
                        "skills": [],
                        "contact_info": {"name": "Phoebe"}
                    }
                else:
                    profile_data = {
                        "bio": "",
                        "interests": [],
                        "passions": [],
                        "hobbies": [],
                        "skills": [],
                        "contact_info": {"name": "User"}
                    }

        # Handle profile-specific queries
        message_lower = request.message.lower()
        if "passions" in message_lower or "interests" in message_lower or "hobbies" in message_lower:
            if profile_data:
                interests = profile_data.get('interests', []) or []
                passions = profile_data.get('passions', []) or []
                hobbies = profile_data.get('hobbies', []) or []
                bio = profile_data.get('bio', '') or ''

                # If asking specifically about passions
                if "passions" in message_lower:
                    if passions:
                        passions_text = ", ".join(passions)
                        message = f"Based on your profile, your passions include: {passions_text}!"
                        if bio:
                            message += f" Your bio says: '{bio}'"
                        message += " Would you like to explore these passions further or connect with others who share them?"
                    else:
                        message = "I don't see any passions listed in your profile yet. You can add them in your profile settings to help me provide more personalized suggestions!"

                    return EnhancedChatResponse(
                        message=message,
                        intent="profile_inquiry",
                        confidence=0.95,
                        actions=[],
                        suggested_strings=[],
                        suggested_connections=[],
                        suggested_joins=[],
                        tokens=50,
                        cost=0.0001
                    )

                # If asking specifically about hobbies
                elif "hobbies" in message_lower:
                    if hobbies:
                        hobbies_text = ", ".join(hobbies)
                        message = f"Based on your profile, your hobbies include: {hobbies_text}."
                    else:
                        message = "I don't see any hobbies listed in your profile yet. You can add them in your profile settings to help me provide more personalized suggestions!"

                    return EnhancedChatResponse(
                        message=message,
                        intent="profile_inquiry",
                        confidence=0.95,
                        actions=[],
                        suggested_strings=[],
                        suggested_connections=[],
                        suggested_joins=[],
                        tokens=50,
                        cost=0.0001
                    )

                # For interests query
                else:
                    all_interests = list(set(interests + passions))
                    if all_interests:
                        interests_text = ", ".join(all_interests)
                        message = f"Based on your profile, I can see you're interested in: {interests_text}!"
                        if bio:
                            message += f" Your bio says: '{bio}'"
                        message += " Would you like to explore these interests further or connect with others who share them?"
                    else:
                        message = "I don't see any specific interests listed in your profile yet. You can add them in your profile settings to help me provide more personalized suggestions!"

                    return EnhancedChatResponse(
                        message=message,
                        intent="profile_inquiry",
                        confidence=0.95,
                        actions=[],
                        suggested_strings=[],
                        suggested_connections=[],
                        suggested_joins=[],
                        tokens=100,
                        cost=0.0002
                    )

        # For other messages, use OpenAI with personalized context
        from openai import OpenAI

        # Build comprehensive personalized system prompt
        system_prompt = """You are a helpful AI assistant for Lifestring, a platform that helps people connect based on shared interests and experiences. You help users create "strings" - posts that help them find activities, connections, and communities.

IMPORTANT: Never mention external platforms like Meetup, Facebook, Instagram, or other social networks. Always focus on Lifestring's features and community."""

        if profile_data:
            interests = profile_data.get('interests', []) or []
            passions = profile_data.get('passions', []) or []
            hobbies = profile_data.get('hobbies', []) or []
            bio = profile_data.get('bio', '') or ''
            skills = profile_data.get('skills', []) or []
            name = profile_data.get('contact_info', {}).get('name', 'User') if 'contact_info' in profile_data else 'Phoebe'

            # Build comprehensive profile context
            profile_context = []
            if bio:
                profile_context.append(f"Bio: '{bio}'")

            all_interests = list(set(interests + passions))
            if all_interests:
                profile_context.append(f"Interests/Passions: {', '.join(all_interests)}")

            if hobbies:
                profile_context.append(f"Hobbies: {', '.join(hobbies)}")

            if skills:
                profile_context.append(f"Skills: {', '.join(skills)}")

            # Always include the user's name in the system prompt
            system_prompt += f"\n\nYou're talking to {name}."

            if profile_context:
                system_prompt += f" Here's their profile:\n" + "\n".join(profile_context)
                system_prompt += "\n\nUse this information to provide personalized suggestions for activities, connections, and communities. When they ask about creating strings or finding people, reference their interests and suggest specific activities or groups they might enjoy."

        # Use Hybrid AI Service (Gemini for events/real-time, GPT for complex reasoning)
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": request.message}
        ]

        # Use hybrid AI service if available, otherwise fallback to OpenAI
        print(f"DEBUG: hybrid_ai_service available: {hybrid_ai_service is not None}")
        if hybrid_ai_service:
            response = await hybrid_ai_service.chat_completion(
                messages=messages,
                temperature=0.7,
                max_tokens=500,
                context={"profile_data": profile_data}
            )
            ai_response = response["content"]
            tokens_used = response["tokens"]
            cost = response["cost"]
            model_info = f"{response.get('provider', 'unknown')} ({response.get('model', 'unknown')})"
            logger.info(f"Hybrid AI used: {model_info} - {response.get('routing_reason', 'No reason')}")
        else:
            # Fallback to direct OpenAI
            from openai import OpenAI
            client = OpenAI(api_key=settings.OPENAI_API_KEY)

            response = client.chat.completions.create(
                model=settings.CHAT_MODEL,
                messages=messages,
                max_tokens=500,
                temperature=0.7
            )

            ai_response = response.choices[0].message.content
            tokens_used = response.usage.total_tokens if response.usage else 500
            cost = 0.001
            model_info = "openai_fallback"

        # Search for real-time events if user is asking about them
        real_time_events = await search_real_time_events(request.message, profile_data)
        response_message = ai_response

        # Check if this is a time-specific query that should only show real-time events
        message_lower = request.message.lower()
        real_time_only_keywords = [
            'tomorrow', 'today', 'tonight', 'this evening',
            'this weekend', 'weekend', 'next week', 'this month',
            'what can i do tomorrow', 'what can i do today',
            'what can i do this weekend', 'what\'s happening tomorrow',
            'what\'s happening today', 'what\'s happening this weekend'
        ]

        is_real_time_only_query = any(keyword in message_lower for keyword in real_time_only_keywords)

        if real_time_events:
            # Add events as formatted text to the response
            events_text = format_events_as_text(real_time_events)
            if is_real_time_only_query:
                response_message = events_text  # Replace AI response with just events for time-specific queries
            else:
                response_message += events_text  # Append events to AI response for general queries
            print(f"Added {len(real_time_events)} real-time events to response text")

        return EnhancedChatResponse(
            message=response_message,
            intent="general_chat",
            confidence=0.9,
            actions=[],
            suggested_strings=[],
            suggested_connections=[],
            suggested_joins=[],
            tokens=tokens_used,
            cost=cost
        )

    except Exception as e:
        print(f"Error in lifestring_ai_chat_test: {e}")
        return EnhancedChatResponse(
            message="I'm having trouble connecting right now. Please try again in a moment.",
            intent="error",
            confidence=1.0,
            actions=[],
            suggested_strings=[],
            suggested_connections=[],
            suggested_joins=[],
            tokens=0,
            cost=0.0
        )

@router.post("/ai/lifestring-chat", response_model=EnhancedChatResponse)
async def lifestring_ai_chat(
    request: EnhancedChatRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db_optional)
):
    """
    Enhanced AI chat with Lifestring-specific features.
    Returns structured responses with actions for Strings, Connections, and Joins.
    """
    try:
        # Verify JWT token
        from app.core.security import get_user_id_from_token
        token = credentials.credentials
        user_id = get_user_id_from_token(token)

        # Check if database is available
        current_user = None
        if db is not None:
            try:
                # Get current user from database
                current_user = db.query(User).filter(User.user_id == user_id).first()
            except Exception as db_error:
                logger.warning(f"Database query failed, proceeding without DB: {db_error}")
                db = None

        # If database is not available or user not found in DB, proceed with profile data from request
        if db is None or current_user is None:
            logger.info("Database not available or user not found, using profile data from request")
            # Use the same logic as the public endpoint but convert response format
            public_response = await lifestring_ai_chat_public(request)

            # Convert SimpleChatResponse to EnhancedChatResponse format
            return EnhancedChatResponse(
                message=public_response.message,
                intent=public_response.intent,
                confidence=public_response.confidence,
                actions=[],
                suggested_strings=[],
                suggested_connections=[],
                suggested_joins=public_response.joins,  # Convert joins to suggested_joins
                tokens=public_response.tokens,
                cost=public_response.cost
            )

        # Find or create AI chat room for this user
        ai_room = db.query(Room).join(RoomParticipant).filter(
            RoomParticipant.user_id == user_id,
            Room.room_metadata['type'].astext == 'ai_chat'
        ).first()

        if not ai_room:
            # Create new AI chat room
            ai_room = Room(
                name=f"AI Chat - {current_user.contact_info.get('name', 'User') if current_user.contact_info else 'User'}",
                room_metadata={
                    "type": "ai_chat",
                    "model": settings.CHAT_MODEL,
                    "created_by": str(user_id)
                }
            )
            db.add(ai_room)
            db.flush()

            # Add user as participant
            user_participant = RoomParticipant(
                room_id=ai_room.id,
                user_id=user_id
            )
            db.add(user_participant)

            # Add AI bot as participant
            ai_participant = RoomParticipant(
                room_id=ai_room.id,
                user_id=settings.AI_BOT_USER_ID
            )
            db.add(ai_participant)
            db.commit()

        # Save user message to conversation history
        user_message = Message(
            room_id=ai_room.id,
            user_id=user_id,
            content=request.message
        )
        db.add(user_message)
        db.commit()

        # Get conversation history for context
        history = db.query(Message).filter(
            Message.room_id == ai_room.id
        ).order_by(Message.created_at).limit(20).all()

        # Use profile data from request if provided (either directly or in context), otherwise fetch from database
        profile_data = None
        if hasattr(request, 'profile_data') and request.profile_data:
            profile_data = request.profile_data
            print(f"Using profile data from request.profile_data: {profile_data}")
        elif request.context and 'profile_data' in request.context:
            profile_data = request.context.get('profile_data')
            print(f"Using profile data from request.context: {profile_data}")

        if not profile_data:
            # Use centralized profile service with JWT token for RLS policies
            from app.services.profile_service import profile_service
            profile_data = await profile_service.get_user_profile(user_id, token)

            if not profile_data:
                # Fallback to known data for this user
                if user_id == "a90f0ea5-ba98-44f5-a3a7-a922db9e1523":
                    profile_data = {
                        "bio": "I love climbing",
                        "interests": ["climbing"],
                        "passions": ["climbing"],
                        "hobbies": ["camping", "hiking", "rock climbing", "photography"],
                        "contact_info": {"name": "Phoebe Troup-Galligan"}
                    }
                else:
                    profile_data = {
                        "bio": "",
                        "interests": [],
                        "passions": [],
                        "hobbies": [],
                        "skills": [],
                        "contact_info": {"name": "User"}
                    }

        # Handle simple utility queries first
        message_lower = request.message.lower()

        # Handle time requests
        if any(keyword in message_lower for keyword in ['time', 'clock', 'what time', 'current time']):
            from app.services.realtime_service import realtime_service

            # Get user's location from profile data for timezone detection
            user_location = None
            if profile_data:
                user_location = profile_data.get('location')

            # Get time information, extracting location from message if specified
            time_info = await realtime_service.get_time_for_location_query(request.message, user_location)

            # Build response based on whether it's a specific location query
            if time_info.get('is_specific_query'):
                query_location = time_info.get('query_location')
                time_str = f"{time_info['current_time']} on {time_info['current_date']}"
                message = f"The current time in {query_location} is {time_str}."
            else:
                time_str = f"{time_info['current_time']} on {time_info['current_date']}"
                message = f"The current time is {time_str}."

            return EnhancedChatResponse(
                message=message,
                intent="time_inquiry",
                confidence=0.95,
                actions=[],
                suggested_strings=[],
                suggested_connections=[],
                suggested_joins=[],
                tokens=len(message.split()),
                cost=0.0001
            )

        # Handle sports/events queries with enhanced real-time data
        sports_keywords = ['nba games', 'nfl games', 'mlb games', 'nhl games', 'games today', 'games tonight', 'sports', 'basketball games', 'football games', 'baseball games', 'hockey games']
        if any(keyword in message_lower for keyword in sports_keywords):
            from app.services.realtime_service import realtime_service

            # Determine sport type from message
            sport_type = None
            if 'nba' in message_lower or 'basketball' in message_lower:
                sport_type = 'nba'
            elif 'nfl' in message_lower or 'football' in message_lower:
                sport_type = 'nfl'
            elif 'mlb' in message_lower or 'baseball' in message_lower:
                sport_type = 'mlb'
            elif 'nhl' in message_lower or 'hockey' in message_lower:
                sport_type = 'nhl'

            try:
                sports_events = await realtime_service.get_sports_events(sport_type, limit=5)

                if sports_events and sports_events[0].get('event_type') != 'sports_fallback':
                    # Format real sports data
                    events_text = ""
                    live_games = []
                    upcoming_games = []
                    completed_games = []

                    for event in sports_events:
                        status = event.get('status', '').lower()
                        if status in ['in', 'live']:
                            live_games.append(event)
                        elif status in ['final', 'completed']:
                            completed_games.append(event)
                        else:
                            upcoming_games.append(event)

                    # Build response with live games first
                    if live_games:
                        events_text += "🔴 **LIVE GAMES:**\n"
                        for event in live_games:
                            events_text += f"• {event['title']}: {event['description']}\n"
                        events_text += "\n"

                    if upcoming_games:
                        events_text += "📅 **UPCOMING GAMES:**\n"
                        for event in upcoming_games:
                            events_text += f"• {event['title']}: {event['description']}\n"
                        events_text += "\n"

                    if completed_games:
                        events_text += "✅ **RECENT RESULTS:**\n"
                        for event in completed_games[:2]:  # Limit recent results
                            events_text += f"• {event['title']}: {event['description']}\n"

                    sport_name = sport_type.upper() if sport_type else "sports"
                    response_message = f"Here are the current {sport_name} games:\n\n{events_text.strip()}\n\nFor more details, check ESPN.com or your favorite sports app!"

                    return EnhancedChatResponse(
                        message=response_message,
                        intent="sports_inquiry",
                        confidence=0.95,
                        actions=[],
                        suggested_strings=[],
                        suggested_connections=[],
                        suggested_joins=[],
                        tokens=len(response_message.split()),
                        cost=0.0001
                    )
                else:
                    # Fallback response
                    sport_name = sport_type.upper() if sport_type else "sports"
                    fallback_message = f"I don't see any {sport_name} games scheduled right now. For the latest schedules and scores, I recommend checking ESPN.com, the official league apps, or your local sports channels!"

                    return EnhancedChatResponse(
                        message=fallback_message,
                        intent="sports_inquiry",
                        confidence=0.8,
                        actions=[],
                        suggested_strings=[],
                        suggested_connections=[],
                        suggested_joins=[],
                        tokens=len(fallback_message.split()),
                        cost=0.0001
                    )

            except Exception as e:
                logger.error(f"Error fetching sports events: {e}")
                sport_name = sport_type.upper() if sport_type else "sports"
                error_message = f"I'm having trouble getting the latest {sport_name} information right now. Please check ESPN.com or your favorite sports app for current games and schedules!"

                return EnhancedChatResponse(
                    message=error_message,
                    intent="sports_inquiry",
                    confidence=0.7,
                    actions=[],
                    suggested_strings=[],
                    suggested_connections=[],
                    suggested_joins=[],
                    tokens=len(error_message.split()),
                    cost=0.0001
                )

        # Handle profile-specific queries
        if "passions" in message_lower or "interests" in message_lower or "hobbies" in message_lower:
            if profile_data:
                interests = profile_data.get('interests', []) or []
                passions = profile_data.get('passions', []) or []
                hobbies = profile_data.get('hobbies', []) or []
                bio = profile_data.get('bio', '') or ''

                # If asking specifically about passions
                if "passions" in message_lower:
                    if passions:
                        passions_text = ", ".join(passions)
                        message = f"Based on your profile, your passions include: {passions_text}!"
                        if bio:
                            message += f" Your bio says: '{bio}'"
                        message += " Would you like to explore these passions further or connect with others who share them?"
                    else:
                        message = "I don't see any passions listed in your profile yet. You can add them in your profile settings to help me provide more personalized suggestions!"

                    return EnhancedChatResponse(
                        message=message,
                        intent="profile_inquiry",
                        confidence=0.95,
                        actions=[],
                        suggested_strings=[],
                        suggested_connections=[],
                        suggested_joins=[],
                        tokens=50,
                        cost=0.0001
                    )

                # If asking specifically about hobbies
                if "hobbies" in message_lower:
                    if hobbies:
                        hobbies_text = ", ".join(hobbies)
                        message = f"Based on your profile, your hobbies include: {hobbies_text}."
                    else:
                        message = "I don't see any hobbies listed in your profile yet. You can add them in your profile settings to help me provide more personalized suggestions!"

                    return EnhancedChatResponse(
                        message=message,
                        intent="profile_inquiry",
                        confidence=0.95,
                        actions=[],
                        suggested_strings=[],
                        suggested_connections=[],
                        suggested_joins=[],
                        tokens=50,
                        cost=0.0001
                    )

                # For interests query
                all_interests = list(set(interests + passions))
                if all_interests:
                    interests_text = ", ".join(all_interests)
                    message = f"Based on your profile, I can see you're interested in: {interests_text}!"
                    if bio:
                        message += f" Your bio says: '{bio}'"
                    message += " Would you like to explore these interests further or connect with others who share them?"
                else:
                    message = "I don't see any specific interests listed in your profile yet. You can add them in your profile settings to help me provide more personalized suggestions!"

                return EnhancedChatResponse(
                    message=message,
                    intent="profile_inquiry",
                    confidence=0.95,
                    actions=[],
                    suggested_strings=[],
                    suggested_connections=[],
                    suggested_joins=[],
                    tokens=100,
                    cost=0.0002
                )
            else:
                return EnhancedChatResponse(
                    message="I'm having trouble accessing your profile right now. You can add interests and hobbies in your profile settings to help me provide personalized suggestions!",
                    intent="profile_inquiry",
                    confidence=0.8,
                    actions=[],
                    suggested_strings=[],
                    suggested_connections=[],
                    suggested_joins=[],
                    tokens=50,
                    cost=0.0001
                )

        # For other messages, use enhanced OpenAI with real-time capabilities and personalized context
        from datetime import datetime
        import json
        from app.services.realtime_service import realtime_service

        # Get user's location from profile data for timezone detection
        user_location = None
        if profile_data:
            user_location = profile_data.get('location')

        # Get current time in user's timezone
        time_info = await realtime_service.get_current_time(user_location)
        system_prompt = f"""You are Strings, Lifestring's AI assistant. The current time is {time_info['current_time']} on {time_info['current_date']}.

You are having a conversation with a user on Lifestring. Here's how Lifestring works:

**YOU ARE STRINGS**: You are the AI that users chat with about what they want to do and who they want to meet.

**JOINS**: These are ongoing interest-based groups/communities where people with shared interests connect and organize activities together. Joins are integrated directly into the main Strings interface - there is NO separate "Joins section". When users ask about finding groups or communities, recommend ONE relevant Join they can find in their main Strings feed.

**CONNECTIONS**: This is how users find friends - they get recommended people based on interests, location, and age. When users want to meet people, direct them to check their Connections.

**IMPORTANT UI STRUCTURE**:
- Joins are NOT in a separate section - they appear as cards in the main Strings interface
- NEVER say "you can find this event under the Joins section" or similar
- Instead say "you can find this event in your Strings feed" or "look for this in your main Strings interface"

**YOUR APPROACH**:
1. Answer general questions naturally (weather, time, jokes, etc.) using real-time data - but ONLY respond with time when specifically asked "what time is it"
2. When users ask about finding groups, communities, or people with shared interests, recommend ONE relevant Join they can find in their Strings feed
3. When users want to meet people or make friends, direct them to their Connections where they'll find recommended people
4. Have natural conversations about their interests and goals
5. NEVER mention external platforms like Meetup, Facebook, etc.
6. Focus on Lifestring's features: Joins for communities, Connections for meeting people
7. NEVER mention a "Joins section" - joins are integrated into the main Strings interface
8. ONLY suggest ONE Join when user asks for groups, communities, or shared interest activities
9. When suggesting a Join, ALWAYS mention the specific group name, what it's about, and include details about the creator so users can connect with them
10. Format Join suggestions like: "I'd recommend the [Group Name] in [Location]. This is a community for [description]. It was created by [Creator Name], who [creator bio/background]. You can find this group in your Strings feed."
11. ALWAYS match Join suggestions to user's location - Salt Lake City gets Utah groups, San Francisco gets Bay Area groups
12. SPECIAL RULE FOR HIKING: When users ask about "finding people who like hiking" or similar, ALWAYS suggest a hiking group join and provide full details about the group creator

**IMPORTANT**: When users ask about groups or communities on Lifestring, you will be provided with specific join recommendations in the system prompt. Prioritize recommending these specific joins. However, when users ask about real-time events, activities, or things happening in specific locations, you can use your Google Search capabilities to provide current, accurate information about events, activities, and happenings in their requested location.

**SMART CATEGORIZATION**: Automatically understand activity types from context:
- Hiking, camping, surfing → Outdoor Adventures
- Cooking, wine tasting, food tours → Culinary Experiences
- Photography, art, music → Creative Activities
- Volleyball, tennis, running → Active Sports
- Book clubs, lectures, discussions → Intellectual Pursuits
- Yoga, meditation, wellness → Wellness & Mindfulness
- Parties, meetups, social events → Social Experiences
- Gym, climbing, fitness classes → Fitness Challenges

**PROFILE UPDATES**: You can help users update their profile information directly from the chat. When users mention:
- New hobbies or interests: Use add_hobbies or add_interests functions
- Moving to a new location: Use update_profile_location function
- New skills they've learned: Use add_skills function
- Want to update their bio: Use update_bio function
Always confirm the update was successful and be natural about it.

**REMEMBER**: You are Strings - the conversational AI. Users chat with you, and you help them discover Joins and Connections on Lifestring."""

        if profile_data:
            interests = profile_data.get('interests', []) or []
            hobbies = profile_data.get('hobbies', []) or []
            bio = profile_data.get('bio', '') or ''
            location = profile_data.get('location', '') or ''
            age = profile_data.get('age', '') or ''
            birthday = profile_data.get('birthday', '') or ''
            work = profile_data.get('work', '') or ''
            goals = profile_data.get('goals', '') or ''
            dreams = profile_data.get('dreams', '') or ''
            profile_questions = profile_data.get('profile_questions', {}) or {}
            name = profile_data.get('contact_info', {}).get('name', 'User') if profile_data and 'contact_info' in profile_data else 'User'
            print(f"DEBUG: Extracted name for authenticated endpoint: '{name}' from profile_data: {profile_data}")
            print(f"DEBUG: Profile questions found: {len(profile_questions)} answers")

            # Build comprehensive profile context
            profile_context = []
            if bio:
                profile_context.append(f"Bio: '{bio}'")

            if interests:
                profile_context.append(f"Interests: {', '.join(interests)}")

            if hobbies:
                profile_context.append(f"Hobbies: {', '.join(hobbies)}")

            if location:
                profile_context.append(f"Location: {location}")

            if age:
                profile_context.append(f"Age: {age}")

            if birthday:
                profile_context.append(f"Birthday: {birthday}")

            if work:
                profile_context.append(f"Work: {work}")

            if goals:
                profile_context.append(f"Goals: {goals}")

            if dreams:
                profile_context.append(f"Dreams: {dreams}")

            # Add profile questions to context
            if profile_questions:
                profile_context.append("Profile Questions & Answers:")
                for question_key, answer in profile_questions.items():
                    if answer and str(answer).strip():  # Only include non-empty answers
                        # Convert question key to actual question text
                        actual_question = convert_question_key_to_text(question_key)
                        profile_context.append(f"  Q: {actual_question}")
                        profile_context.append(f"  A: {answer}")

            # Always include the user's name in the system prompt
            system_prompt += f"\n\nYou're talking to {name}."

            if profile_context:
                system_prompt += f" Here's their profile:\n" + "\n".join(profile_context)
                system_prompt += "\n\nUse this profile information to provide personalized recommendations, especially when they ask about activities, weather-related suggestions, or local events. Consider their location, age, interests, and hobbies when making suggestions."
        else:
            system_prompt += "\n\nBe friendly and helpful. If the user mentions interests, encourage them to add them to their profile for more personalized suggestions."

        # Use enhanced OpenAI service with real-time capabilities
        messages = [{"role": "system", "content": system_prompt}]

        # Add conversation history (excluding the current message we just saved)
        for msg in history[:-1]:  # Exclude the last message (current user message)
            role = "assistant" if str(msg.user_id) == settings.AI_BOT_USER_ID else "user"
            messages.append({"role": role, "content": msg.content})

        # Extract potential joins from user message to include in system prompt
        potential_joins = extract_joins_from_response("", request.message, profile_data)
        logger.info(f"🔍 AUTHENTICATED ENDPOINT - Found {len(potential_joins) if potential_joins else 0} potential joins")
        if potential_joins:
            join_info = potential_joins[0]  # Only use the first/most relevant join
            logger.info(f"🔍 AUTHENTICATED ENDPOINT - Using join: {join_info['title']} by {join_info['user']['name']}")
            system_prompt += f"""

**RECOMMENDED JOIN FOR THIS CONVERSATION:**
You should recommend the "{join_info['title']}" group in {join_info['location']}.
- Description: {join_info['description']}
- Created by: {join_info['user']['name']} - {join_info['user']['bio']}
- Location: {join_info['location']}
- Current members: {join_info['current_participants']}/{join_info['max_participants']}

CRITICAL INSTRUCTION: The user is asking about finding people with shared interests. You MUST respond by recommending the specific group above. Use this exact format:

"I'd recommend checking out the {join_info['title']} group! It was created by {join_info['user']['name']}."

DO NOT mention "Strings feed" or any other location - the join card will appear directly below your message.
DO NOT include the full bio in your text response - the join card will display that information.
DO NOT mention Connections feature. DO NOT give generic advice. ALWAYS mention the specific group name and creator name only."""

            # Update the system message in the messages array with the modified prompt
            messages[0] = {"role": "system", "content": system_prompt}

        # Add current user message
        messages.append({"role": "user", "content": request.message})

        # Get available real-time functions
        tools = realtime_service.get_available_functions() if realtime_service else None
        logger.info(f"Authenticated endpoint using enhanced OpenAI service with tools: {tools is not None}")

        # Get AI response with function calling capability
        response = await openai_service.chat_completion(
            messages=messages,
            tools=tools,
            model=settings.CHAT_MODEL,
            max_tokens=500,
            temperature=0.7
        )

        # Handle function calls if present
        if response.get("tool_calls"):
            logger.info(f"Processing {len(response['tool_calls'])} function calls")

            for tool_call in response["tool_calls"]:
                function_name = tool_call["function"]["name"]
                arguments = json.loads(tool_call["function"]["arguments"])

                # Execute the function (pass user_id and token for profile updates)
                function_result = await realtime_service.execute_function(function_name, arguments, user_id, token) if realtime_service else {"error": "Real-time service not available"}

                # Add function result to messages
                messages.append({
                    "role": "assistant",
                    "content": response["content"],
                    "tool_calls": [
                        {
                            "id": tc["id"],
                            "type": "function",
                            "function": tc["function"]
                        }
                        for tc in response["tool_calls"]
                    ]
                })

                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call["id"],
                    "content": json.dumps(function_result)
                })

            # Get final response with function results
            final_response = await openai_service.chat_completion(
                messages=messages,
                model="gpt-4o",
                max_tokens=500,
                temperature=0.7
            )

            ai_response = final_response["content"]
        else:
            ai_response = response["content"]

        # Save AI response to conversation history (with error handling)
        try:
            ai_message = Message(
                room_id=ai_room.id,
                user_id=settings.AI_BOT_USER_ID,
                content=ai_response
            )
            db.add(ai_message)
            db.commit()
        except Exception as e:
            logger.error(f"Error saving AI message to database (non-critical): {e}")

        # Update conversation memory with user preferences (async, don't block response)
        # Skip if database is not available
        try:
            if db:  # Only try if we have a valid database session
                from app.services.conversation_memory_service import conversation_memory_service
                await conversation_memory_service.update_user_memory(db, user_id, str(ai_room.id), profile_data or {})
        except Exception as e:
            logger.error(f"Error updating conversation memory (non-critical): {e}")

        # Extract joins for the response (same logic as public endpoint)
        logger.info(f"🔍 AUTHENTICATED ENDPOINT - About to extract joins from message: {request.message}")
        logger.info(f"🔍 AUTHENTICATED ENDPOINT - Profile data available: {profile_data is not None}")
        joins = extract_joins_from_response(ai_response, request.message, profile_data)
        logger.info(f"🎯 Authenticated endpoint extracted {len(joins) if joins else 0} joins")
        if joins:
            logger.info(f"🎯 First join: {joins[0]['title']} by {joins[0]['user']['name']}")

        return EnhancedChatResponse(
            message=ai_response,
            intent="general_chat",
            confidence=0.9,
            actions=[],
            suggested_strings=[],
            suggested_connections=[],
            suggested_joins=joins,
            tokens=response.get("tokens", 500),
            cost=response.get("cost", 0.001)
        )

    except HTTPException:
        # Re-raise HTTP exceptions (like 401 Unauthorized) so they return proper status codes
        raise
    except Exception as e:
        print(f"Error in lifestring_ai_chat: {e}")

        # If it's a database connection error, try to fall back to public endpoint functionality
        if "connection" in str(e).lower() or "database" in str(e).lower():
            try:
                # Try to use the public endpoint logic as fallback
                from app.services.lifestring_ai_service import lifestring_ai_service

                # Create a simple request object for the public endpoint
                public_request = PublicChatRequest(
                    message=request.message,
                    user_name=profile_data.get('contact_info', {}).get('name', 'User') if profile_data else 'User',
                    context=request.context
                )

                # Use the public AI service
                response = await lifestring_ai_service.chat(
                    message=public_request.message,
                    user_name=public_request.user_name,
                    context=public_request.context
                )

                return EnhancedChatResponse(
                    message=response["message"],
                    intent=response.get("intent", "general_chat"),
                    confidence=response.get("confidence", 0.9),
                    actions=[],
                    suggested_strings=[],
                    suggested_connections=[],
                    suggested_joins=[],
                    tokens=response.get("tokens", 0),
                    cost=response.get("cost", 0.0)
                )

            except Exception as fallback_error:
                print(f"Fallback also failed: {fallback_error}")

        # Final fallback
        return EnhancedChatResponse(
            message="I'm having trouble connecting right now. Please try again in a moment.",
            intent="error",
            confidence=1.0,
            actions=[],
            suggested_strings=[],
            suggested_connections=[],
            suggested_joins=[],
            tokens=0,
            cost=0.0
        )


@router.post("/ai/summarize-to-string")
async def summarize_conversation_to_string(
    room_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Summarize a conversation into a potential string/post.
    """
    # Get room and verify access
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room or not room.has_participant(current_user.user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found or access denied"
        )

    # Get conversation history
    messages = db.query(Message).filter(
        Message.room_id == room_id
    ).order_by(Message.created_at).all()

    # Convert to format for AI service
    conversation = []
    for msg in messages:
        role = "assistant" if msg.user_id == settings.AI_BOT_USER_ID else "user"
        conversation.append({"role": role, "content": msg.content})

    # Generate string suggestion
    string_suggestion = await lifestring_ai.summarize_conversation_to_string(
        conversation=conversation,
        user=current_user
    )

    return {
        "string_suggestion": string_suggestion,
        "room_id": room_id
    }


@router.post("/ai/execute-action")
async def execute_ai_action(
    action_type: str,
    action_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Execute an AI-suggested action.
    """
    action_handler = create_action_handler(db)

    result = await action_handler.execute_action(
        action_type=action_type,
        action_data=action_data,
        current_user=current_user
    )

    return result


async def build_system_prompt(user: User, context: Dict[str, Any]) -> str:
    """Build system prompt with user context and detailed profile data."""
    import datetime
    import pytz
    from app.services.realtime_service import realtime_service

    # Get user's location for timezone detection
    user_location = None
    profile = context.get('profile', {})
    if profile and profile.get('location'):
        user_location = profile['location']

    # Get current time in user's timezone
    time_info = await realtime_service.get_current_time(user_location)
    current_time = time_info["current_time"]
    current_date = time_info["current_date"]

    prompt_parts = [
        "You are a helpful AI assistant for Lifestring, a social networking platform.",
        f"You are chatting with {user.name or 'a user'}.",
        f"Current time: {current_time} on {current_date}."
    ]

    # Check for detailed profile data in context
    detailed_profile = context.get('detailed_profile') if context else None
    profile_data = context.get('profile_data') if context else None

    # Use profile_data if available (from frontend), otherwise detailed_profile
    profile = profile_data or detailed_profile

    if profile:
        # Add location-based context
        if profile.get('location'):
            prompt_parts.append(f"Their location: {profile['location']}.")

        # Add age context
        if profile.get('age'):
            prompt_parts.append(f"Their age: {profile['age']}.")

        # Add birthday context
        if profile.get('birthday'):
            prompt_parts.append(f"Their birthday: {profile['birthday']}.")

        # Use detailed profile data for richer context
        if profile.get('bio'):
            prompt_parts.append(f"About them: {profile['bio']}")

        if profile.get('interests'):
            interests = profile['interests']
            if isinstance(interests, list) and interests:
                prompt_parts.append(f"Their interests include: {', '.join(interests)}.")

        if profile.get('hobbies'):
            hobbies = profile['hobbies']
            if isinstance(hobbies, list) and hobbies:
                prompt_parts.append(f"Their hobbies include: {', '.join(hobbies)}.")

        if profile.get('passions'):
            passions = profile['passions']
            if isinstance(passions, list) and passions:
                prompt_parts.append(f"Their passions include: {', '.join(passions)}.")

        if profile.get('skills'):
            skills = profile['skills']
            if isinstance(skills, list) and skills:
                prompt_parts.append(f"Their skills include: {', '.join(skills)}.")

        if profile.get('goals'):
            prompt_parts.append(f"Their goals: {profile['goals']}")

        if profile.get('dreams'):
            prompt_parts.append(f"Their dreams: {profile['dreams']}")

        # Add conversation memory if available
        if profile.get('conversation_memory'):
            memory = profile['conversation_memory']
            if memory.get('favorite_activities'):
                prompt_parts.append(f"From past conversations, they've mentioned enjoying: {', '.join(memory['favorite_activities'])}.")
            if memory.get('goals'):
                prompt_parts.append(f"They've expressed goals to: {', '.join(memory['goals'])}.")
            if memory.get('personality_traits'):
                prompt_parts.append(f"Personality insights from conversations: {', '.join(memory['personality_traits'])}.")
    else:
        # Fallback to basic user data
        if hasattr(user, 'interests') and user.interests:
            prompt_parts.append(f"Their interests include: {', '.join(user.interests)}.")

        if hasattr(user, 'passions') and user.passions:
            prompt_parts.append(f"Their passions include: {', '.join(user.passions)}.")

        # Check for conversation memory in user meta
        if hasattr(user, 'meta') and user.meta and user.meta.get('conversation_memory'):
            memory = user.meta['conversation_memory']
            if memory.get('favorite_activities'):
                prompt_parts.append(f"From past conversations, they've mentioned enjoying: {', '.join(memory['favorite_activities'])}.")

    prompt_parts.append("Use this information to provide personalized, relevant responses and recommendations based on their location, age, interests, and the current time.")
    prompt_parts.append("When asked about time, provide the current time shown above. When making recommendations, consider their location and age.")
    prompt_parts.append("IMPORTANT: Never make up information you don't know. If you don't have specific information about events, schedules, or facts, say so clearly.")
    prompt_parts.append("NEVER answer with random times when confused - only provide the current time when specifically asked about time.")
    prompt_parts.append("If asked about your favorite movie or personal preferences, explain that you're an AI and don't have personal preferences, but you can help them explore their interests.")
    prompt_parts.append("Be friendly, helpful, and concise.")

    return " ".join(prompt_parts)


@router.post("/ai/test-profile-update", response_model=dict)
async def test_profile_update():
    """Test endpoint for profile update functionality."""
    try:
        from app.services.realtime_service import realtime_service

        # Test adding hobbies
        result = await realtime_service.execute_function(
            "add_hobbies",
            {"hobbies": ["photography", "reading"]},
            user_id="test-user-id",
            token="test-token"
        )

        return {
            "success": True,
            "result": result,
            "available_functions": [func["function"]["name"] for func in realtime_service.get_available_functions()]
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "error_type": type(e).__name__
        }


@router.post("/ai/test-profile-ai", response_model=dict)
async def test_profile_ai():
    """Test AI recognition of profile update requests."""
    try:
        from app.services.hybrid_ai_service import hybrid_ai_service

        # Test messages that should trigger profile updates
        test_messages = [
            "I love photography and want to add it to my hobbies",
            "I moved to Seattle",
            "I'm interested in rock climbing",
            "I learned Python programming",
            "Update my bio to say I'm a software engineer"
        ]

        results = []
        for message in test_messages:
            # Use hybrid AI service to see if it would call profile functions
            messages = [
                {"role": "system", "content": "You are a helpful AI assistant that can update user profiles."},
                {"role": "user", "content": message}
            ]

            response = await hybrid_ai_service.chat_completion(
                messages=messages,
                context={
                    "profile_data": {
                        "location": "Salt Lake City, UT",
                        "name": "Phoebe Troup-Galligan",
                        "passions": ["hiking", "climbing", "boating"]
                    }
                }
            )

            results.append({
                "message": message,
                "response": response.get("content", ""),
                "function_calls": response.get("function_calls", [])
            })

        return {
            "success": True,
            "test_results": results
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "error_type": type(e).__name__
        }

