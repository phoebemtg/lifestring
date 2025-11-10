"""
Enhanced AI service for Lifestring's specific features.
Handles Strings, Connections, and Joins with structured outputs.
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from enum import Enum
import json
import logging
from datetime import datetime, timezone
import pytz
from sqlalchemy.orm import Session

from app.services.openai_service import openai_service
from app.models.user import User, DetailedProfile
from app.models.event import Event


class IntentType(str, Enum):
    """AI intent types for Lifestring features."""
    CREATE_STRING = "create_string"
    FIND_CONNECTIONS = "find_connections"
    SUGGEST_JOINS = "suggest_joins"
    GENERAL_CHAT = "general_chat"
    PROFILE_HELP = "profile_help"


class ActionType(str, Enum):
    """Action types the AI can trigger."""
    CREATE_STRING = "create_string"
    SEARCH_USERS = "search_users"
    SEARCH_JOINS = "search_joins"
    CREATE_JOIN = "create_join"
    UPDATE_PROFILE = "update_profile"


class AIAction(BaseModel):
    """Structured action the AI wants to perform."""
    type: ActionType
    data: Dict[str, Any]
    description: str


class AIResponse(BaseModel):
    """Enhanced AI response with structured outputs."""
    message: str
    intent: IntentType
    confidence: float
    actions: List[AIAction] = []
    suggested_strings: List[Dict[str, Any]] = []
    suggested_connections: List[str] = []  # User IDs
    suggested_joins: List[Dict[str, Any]] = []


class LifestringAIService:
    """Enhanced AI service for Lifestring-specific functionality."""
    
    def __init__(self):
        self.openai = openai_service

    async def search_joins(self, search_term: str, db: Session, limit: int = 5) -> List[Dict[str, Any]]:
        """Search for existing joins by keyword with creator profile info."""
        try:
            from sqlalchemy import or_

            # Search in title, description, and tags
            search_pattern = f"%{search_term.lower()}%"
            print(f"DEBUG: Searching for pattern: {search_pattern}")

            query = db.query(Event).filter(
                Event.meta_data.op('->>')('is_join') == 'true'
            ).filter(
                or_(
                    Event.title.ilike(search_pattern),
                    Event.description.ilike(search_pattern),
                    Event.meta_data.op('->>')('tags').ilike(search_pattern)
                )
            ).order_by(Event.created_at.desc()).limit(limit)

            events = query.all()
            print(f"DEBUG: Found {len(events)} events matching '{search_term}'")

            # Convert to join format with creator info
            joins = []
            for event in events:
                # Get creator info
                creator = db.query(User).filter(User.user_id == event.user_id).first()
                creator_info = {
                    'user_id': str(event.user_id),
                    'name': 'Anonymous User',
                    'location': None,
                    'interests': [],
                    'age': None
                }

                if creator:
                    creator_info['name'] = creator.name or 'Anonymous User'
                    if hasattr(creator, 'contact_info') and creator.contact_info:
                        creator_info['location'] = creator.contact_info.get('location')
                    if hasattr(creator, 'attributes') and creator.attributes:
                        creator_info['interests'] = creator.attributes.get('interests', [])
                        creator_info['age'] = creator.attributes.get('age')

                join_data = {
                    'id': str(event.id),
                    'title': event.title,
                    'description': event.description,
                    'type': event.meta_data.get('type', 'activity'),
                    'location': event.location,
                    'date': event.meta_data.get('date'),
                    'time': event.meta_data.get('time'),
                    'max_participants': event.meta_data.get('max_participants', 10),
                    'cost': event.meta_data.get('cost', 'Free'),
                    'difficulty': event.meta_data.get('difficulty', 'beginner'),
                    'tags': event.meta_data.get('tags', ''),
                    'created_at': event.created_at.isoformat() if event.created_at else None,
                    'creator': creator_info
                }
                joins.append(join_data)

            return joins

        except Exception as e:
            logging.error(f"Error searching joins: {str(e)}")
            return []
    
    async def process_message(
        self,
        message: str,
        context: Dict[str, Any] = None,
        user_id: Optional[str] = None
    ) -> AIResponse:
        """
        Process message for natural chat experience.

        Args:
            message: User's message
            context: Additional context
            user_id: Optional user ID (ignored for public endpoint)

        Returns:
            Natural AI response
        """
        # Build basic system prompt for public use
        system_prompt = self._build_public_system_prompt(context)

        # Build messages for OpenAI
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message}
        ]

        # Get natural chat response (no JSON formatting)
        try:
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"Attempting OpenAI call with message: {message}")

            response = await self.openai.chat_completion(
                messages=messages,
                temperature=0.7,
                max_tokens=500
            )

            logger.info(f"OpenAI response successful: {response['content'][:100]}...")

            # Return simple response
            return AIResponse(
                message=response["content"],
                intent=IntentType.GENERAL_CHAT,
                confidence=1.0,
                actions=[]
            )
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"OpenAI API failed: {str(e)}", exc_info=True)

            # Return natural fallback response if OpenAI fails
            return AIResponse(
                message=self._generate_natural_fallback_response(message),
                intent=IntentType.GENERAL_CHAT,
                confidence=1.0,
                actions=[]
            )

    async def process_user_message(
        self,
        message: str,
        user: User,
        conversation_history: List[Dict[str, str]] = None,
        context: Dict[str, Any] = None,
        db_session = None
    ) -> AIResponse:
        """
        Process user message and return structured response with actions.

        Args:
            message: User's message
            user: Current user
            conversation_history: Previous messages
            context: Additional context

        Returns:
            Structured AI response with actions
        """
        # Analyze user intent and search for relevant joins FIRST
        relevant_joins = []
        user_context = self._analyze_user_intent(message)

        if db_session and user_context['activities']:
            # Search for joins based on detected activities
            print(f"DEBUG: Detected activities: {user_context['activities']}")
            for keyword in user_context['activities']:
                print(f"DEBUG: Searching for keyword: {keyword}")
                joins = await self.search_joins(keyword, db_session, limit=3)
                print(f"DEBUG: Found {len(joins)} joins for keyword '{keyword}': {[j.get('title', 'No title') for j in joins]}")
                relevant_joins.extend(joins)

            # Remove duplicates and limit to top 5
            seen_ids = set()
            unique_joins = []
            for join in relevant_joins:
                if join['id'] not in seen_ids:
                    unique_joins.append(join)
                    seen_ids.add(join['id'])
                if len(unique_joins) >= 5:
                    break
            relevant_joins = unique_joins
            print(f"DEBUG: Final relevant_joins count: {len(relevant_joins)}")

        # Build enhanced system prompt WITH relevant joins
        system_prompt = self._build_lifestring_system_prompt(user, context, db_session, relevant_joins)

        # Build messages for OpenAI
        messages = [{"role": "system", "content": system_prompt}]

        # Add conversation history
        if conversation_history:
            messages.extend(conversation_history[-10:])  # Last 10 messages

        # Add current message
        messages.append({"role": "user", "content": message})

        # Get AI response with structured output
        ai_response = await self._get_structured_response(messages)

        # Add relevant joins to the response with smart contextual messaging
        if relevant_joins:
            ai_response.suggested_joins = relevant_joins

            # Create contextual message based on user intent
            if relevant_joins:
                # Determine the right message tone based on user context
                if 'seeking_activity' in user_context['intents']:
                    intro_message = "🔗 **Perfect! I found some Connected Strings with activities happening right now:**"
                elif 'seeking_companions' in user_context['intents']:
                    intro_message = "👥 **Great news! I found Connected Strings from people looking for companions:**"
                elif 'new_to_area' in user_context['intents']:
                    intro_message = "🌟 **Welcome! Here are some Connected Strings to help you meet locals:**"
                elif user_context['urgency'] == 'high':
                    intro_message = "⚡ **Quick! Here are some Connected Strings with immediate opportunities:**"
                else:
                    intro_message = "🔗 **I found some Connected Strings that match your interests:**"

                ai_response.message += f"\n\n{intro_message}\n\n"

                for i, join in enumerate(relevant_joins[:3]):
                    creator = join['creator']
                    ai_response.message += f"• **{join['title']}** by {creator['name']}"
                    if creator['location']:
                        ai_response.message += f" ({creator['location']})"
                    if join['date']:
                        ai_response.message += f" - {join['date']}"
                    if join['cost'] and join['cost'] != 'Free':
                        ai_response.message += f" - {join['cost']}"
                    ai_response.message += f"\n"

                # Add contextual call-to-action
                if 'seeking_companions' in user_context['intents']:
                    ai_response.message += f"\n💬 **These Connected Strings show real people looking for companions! Reach out to them directly, or create your own Connected String to attract the perfect activity partner!**"
                elif user_context['urgency'] == 'high':
                    ai_response.message += f"\n🚀 **Don't wait - these Connected Strings are happening soon! Connect now or create your own for today.**"
                else:
                    ai_response.message += f"\n✨ **These Connected Strings represent real people seeking connections! Reach out to them or create your own to find your perfect activity crew!**"

        return ai_response

    def _extract_activity_keywords(self, message: str) -> List[str]:
        """Extract potential activity keywords from user message."""
        # Common activity keywords to search for
        activity_keywords = [
            'boating', 'sailing', 'fishing', 'hiking', 'camping', 'climbing', 'skiing', 'snowboarding',
            'surfing', 'swimming', 'diving', 'kayaking', 'canoeing', 'rafting', 'cycling', 'biking',
            'running', 'jogging', 'yoga', 'pilates', 'gym', 'fitness', 'workout', 'tennis', 'golf',
            'basketball', 'football', 'soccer', 'volleyball', 'baseball', 'hockey', 'cricket',
            'photography', 'painting', 'drawing', 'music', 'singing', 'dancing', 'cooking', 'baking',
            'gardening', 'reading', 'writing', 'gaming', 'chess', 'poker', 'board games',
            'travel', 'trip', 'vacation', 'adventure', 'explore', 'sightseeing', 'backpacking',
            'startup', 'business', 'entrepreneur', 'coding', 'programming', 'tech', 'design',
            'study', 'learn', 'language', 'course', 'workshop', 'meetup', 'event', 'party',
            'coffee', 'drinks', 'dinner', 'lunch', 'brunch', 'restaurant', 'bar', 'club'
        ]

        message_lower = message.lower()
        found_keywords = []

        for keyword in activity_keywords:
            if keyword in message_lower:
                found_keywords.append(keyword)

        # Also extract potential custom keywords (nouns that might be activities)
        import re
        words = re.findall(r'\b[a-zA-Z]{3,}\b', message_lower)
        for word in words:
            if word not in found_keywords and len(word) > 3:
                # Add words that might be activities but aren't in our predefined list
                if any(activity_word in word for activity_word in ['ing', 'sport', 'game', 'club']):
                    found_keywords.append(word)

        return found_keywords[:5]  # Limit to 5 keywords

    def _analyze_user_intent(self, message: str) -> Dict[str, Any]:
        """Analyze user message to understand their intent and context."""
        message_lower = message.lower()

        # Intent patterns
        intent_patterns = {
            'seeking_activity': ['what should i do', 'i\'m bored', 'looking for something', 'need ideas', 'suggestions'],
            'planning_activity': ['planning to', 'want to', 'thinking about', 'considering', 'going to'],
            'seeking_companions': ['anyone want to', 'looking for people', 'find someone', 'join me', 'together'],
            'new_to_area': ['new to', 'just moved', 'don\'t know anyone', 'new in town', 'recently relocated'],
            'free_time': ['weekend', 'free time', 'nothing to do', 'spare time', 'day off', 'evening'],
            'skill_learning': ['learn', 'beginner', 'new to', 'never tried', 'how to', 'teach me'],
            'social_anxiety': ['shy', 'nervous', 'anxious', 'introverted', 'don\'t know how', 'scared']
        }

        # Time indicators
        time_indicators = {
            'immediate': ['now', 'today', 'tonight', 'this evening'],
            'soon': ['tomorrow', 'this weekend', 'next week', 'soon'],
            'planning': ['next month', 'planning', 'future', 'someday', 'eventually']
        }

        detected_intents = []
        time_context = 'general'

        # Check for intent patterns
        for intent, patterns in intent_patterns.items():
            if any(pattern in message_lower for pattern in patterns):
                detected_intents.append(intent)

        # Check for time context
        for time_type, indicators in time_indicators.items():
            if any(indicator in message_lower for indicator in indicators):
                time_context = time_type
                break

        return {
            'intents': detected_intents,
            'time_context': time_context,
            'activities': self._extract_activity_keywords(message),
            'urgency': 'high' if time_context == 'immediate' else 'medium' if time_context == 'soon' else 'low'
        }

    def _build_public_system_prompt(self, context: Dict[str, Any] = None) -> str:
        """Build system prompt for natural chat experience."""

        # Get current time information
        from datetime import datetime
        import pytz

        # Get current time in multiple timezones
        utc_now = datetime.now(pytz.UTC)
        pst_now = utc_now.astimezone(pytz.timezone('US/Pacific'))
        est_now = utc_now.astimezone(pytz.timezone('US/Eastern'))

        current_time_info = f"""
CURRENT TIME INFORMATION:
- UTC: {utc_now.strftime('%Y-%m-%d %H:%M:%S %Z')}
- Pacific Time: {pst_now.strftime('%Y-%m-%d %H:%M:%S %Z')}
- Eastern Time: {est_now.strftime('%Y-%m-%d %H:%M:%S %Z')}
- Day of week: {utc_now.strftime('%A')}
"""

        prompt_parts = [
            "You are Strings, the AI companion for Lifestring - a platform that helps people connect through shared interests and activities.",
            "",
            current_time_info,
            "",
            "🎯 YOUR MISSION: Help people find their tribe and create meaningful connections through shared experiences.",
            "",
            "LIFESTRING FEATURES:",
            "• STRINGS: Social posts where users share thoughts, interests, and activities",
            "• CONNECTIONS: Users can connect with others who share similar interests",
            "• JOINS: Events, trips, and activities that users can participate in together",
            "",
            "YOUR PERSONALITY:",
            "• Genuinely excited about helping people connect and try new things",
            "• Conversational and relatable - like talking to a knowledgeable friend",
            "• Proactive in suggesting activities and connections",
            "• Encouraging but not pushy - respect when people just want to chat",
            "• Use emojis sparingly but effectively to add warmth",
            "",
            "🚀 CORE INTELLIGENCE - You excel at:",
            "",
            "1. **ACTIVITY RECOGNITION** - Instantly recognize when someone mentions:",
            "   • Hobbies (photography, cooking, gaming, reading, art, music)",
            "   • Sports & fitness (hiking, cycling, yoga, rock climbing, running)",
            "   • Travel & adventures (weekend trips, international travel, road trips)",
            "   • Learning & growth (languages, skills, courses, workshops)",
            "   • Social activities (parties, meetups, networking, dating)",
            "   • Professional goals (startups, collaborations, career development)",
            "",
            "2. **CONTEXTUAL SUGGESTIONS** - When users mention activities:",
            "   • If they seem lonely/bored → Suggest finding activity partners via Joins",
            "   • If they have free time → Recommend existing Joins they could join",
            "   • If they're planning something → Suggest creating a Join to find companions",
            "   • If they're new to an area → Help them find local community through Joins",
            "",
            "3. **SMART RESPONSES** - Always consider:",
            "   • Time context (weekend plans, evening activities, seasonal events)",
            "   • Location relevance (local vs travel activities)",
            "   • Skill level (beginner-friendly vs advanced)",
            "   • Social energy (solo activities vs group experiences)",
            "",
            "CRITICAL RULES:",
            "• NEVER mention external platforms (Facebook, Meetup, Discord, etc.)",
            "• ALWAYS keep suggestions within Lifestring ecosystem",
            "• Be specific and actionable in your suggestions",
            "• Match your energy to the user's mood and context",
            "",
            "RESPONSE STYLE:",
            "• Start with acknowledgment of what they shared",
            "• Provide relevant, specific suggestions",
            "• End with encouragement to take action on Lifestring",
            "• Keep responses conversational, not robotic",
        ]

        # Add context if provided
        if context:
            prompt_parts.extend([
                "",
                f"Current context: {json.dumps(context)}"
            ])

        prompt_parts.extend([
            "",
            "Be helpful, friendly, and conversational. Answer questions naturally without offering structured actions."
        ])

        return "\n".join(prompt_parts)

    def _generate_natural_fallback_response(self, message: str) -> str:
        """Generate a natural ChatGPT-like response when OpenAI API is unavailable."""
        import re
        import random

        message_lower = message.lower()

        # Simple greetings
        if any(word in message_lower for word in ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening']):
            greetings = [
                "Hello! It's great to meet you. What's on your mind today?",
                "Hi there! I'm excited to chat with you. What would you like to talk about?",
                "Hey! Thanks for reaching out. What can I help you with or what interests you?",
                "Good to see you! I'm here to chat about whatever you'd like to explore.",
                "Hello! I'm ready to have a great conversation. What's interesting you lately?"
            ]
            return random.choice(greetings)

        # Removed hardcoded hiking responses - let OpenAI handle all responses naturally

        # Removed all hardcoded topic responses - let OpenAI handle everything naturally

        # Social/friendship
        if any(word in message_lower for word in ['friend', 'hang out', 'social', 'meet', 'people', 'connect']):
            return "Making meaningful connections is what life's all about! It's really great that you're putting yourself out there to meet new people. What kind of activities or interests do you enjoy sharing with others? I find that the best friendships often grow from shared experiences and common interests. Whether it's trying new activities, exploring hobbies, or just having great conversations, there are so many ways to build genuine connections."

        # Work/career
        if any(word in message_lower for word in ['work', 'job', 'career', 'professional', 'business', 'networking']):
            return "Professional connections and career development are so important! Whether you're looking to advance in your current field, explore new opportunities, or just connect with like-minded professionals, building a strong network can open up amazing possibilities. What area do you work in or what kind of career interests are you exploring? I'd be happy to chat about professional growth and networking strategies."

        # Default response - more natural and engaging (v2)
        default_responses = [
            "That's really interesting! I'd love to hear more about what you're thinking. What aspects of this interest you most? I'm here to chat and help you explore whatever's on your mind.",

            "I find that fascinating! There's so much we could dive into there. What draws you to this particular topic? I'm excited to learn more about your perspective.",

            "That sounds really engaging! I'd love to explore this with you. What got you interested in this, and what would you like to know more about?",

            "How interesting! I can tell there's a lot of depth to what you're sharing. What aspects are you most curious about? I'm here to chat through it with you.",

            "That's a great topic to explore! I'm curious to hear more about your thoughts on this. What questions do you have, or what would you like to discuss further?"
        ]

        import random
        return random.choice(default_responses)

    def _build_lifestring_system_prompt(self, user: User, context: Dict[str, Any] = None, db_session = None, relevant_joins: List[Dict] = None) -> str:
        """Build enhanced system prompt for Lifestring AI."""

        # Get current time information
        from datetime import datetime
        import pytz

        # Get current time in multiple timezones
        utc_now = datetime.now(pytz.UTC)
        pst_now = utc_now.astimezone(pytz.timezone('US/Pacific'))
        est_now = utc_now.astimezone(pytz.timezone('US/Eastern'))

        current_time_info = f"""
CURRENT TIME INFORMATION:
- UTC: {utc_now.strftime('%Y-%m-%d %H:%M:%S %Z')}
- Pacific Time: {pst_now.strftime('%Y-%m-%d %H:%M:%S %Z')}
- Eastern Time: {est_now.strftime('%Y-%m-%d %H:%M:%S %Z')}
- Day of week: {utc_now.strftime('%A')}
"""

        # Enhanced prompt with intelligent context awareness
        prompt_parts = [
            "You are Strings, the AI companion for Lifestring - a platform that helps people connect through shared interests and activities.",
            "",
            current_time_info,
            "",
            "🎯 YOUR MISSION: Be the ultimate social connector - help people find their tribe and create amazing experiences together.",
            "",
            "LIFESTRING ECOSYSTEM:",
            "• STRINGS: Social posts for sharing thoughts, interests, and activities",
            "• CONNECTED STRINGS: Special Strings that show people looking for companions for activities, trips, and events",
            "• CONNECTIONS: Smart matching with compatible users based on shared interests",
            "",
            "🧠 ADVANCED INTELLIGENCE:",
            "",
            "**CONTEXT AWARENESS:**",
            "• Time sensitivity (weekend plans, seasonal activities, evening events)",
            "• Location relevance (local meetups vs travel adventures)",
            "• Social energy (introvert-friendly vs high-energy group activities)",
            "• Skill levels (beginner workshops vs advanced challenges)",
            "",
            "**ACTIVITY PATTERN RECOGNITION:**",
            "• 'I'm bored' → Show existing Connected Strings for immediate activities",
            "• 'I want to try X' → Recommend Connected Strings or suggest creating one",
            "• 'I'm new here' → Focus on local Connected Strings for community building",
            "• 'I love X but...' → Help find like-minded people through Connected Strings",
            "• 'This weekend I...' → Show time-specific Connected Strings",
            "",
            "**SMART SUGGESTIONS:**",
            "• Match suggestions to user's expressed interests and personality",
            "• Consider practical factors (location, timing, cost, difficulty)",
            "• Prioritize activities that build lasting connections",
            "• Balance solo growth with social experiences",
            "",
            "CRITICAL RULES:",
            "• NEVER mention external platforms (Facebook, Meetup, Discord, etc.)",
            "• ALWAYS suggest Lifestring-based solutions",
            "• Be specific and actionable, not generic",
            "• Match energy level to user's mood and context",
            "",
            "RESPONSE FORMAT:",
            "Always respond with JSON containing:",
            "- message: Your conversational response (warm and encouraging)",
            "- intent: One of [create_string, find_connections, suggest_joins, create_join, general_chat, profile_help, time_query]",
            "- confidence: Float 0-1 indicating confidence in intent",
            "- actions: Array of actions to perform",
            "- suggested_strings: Array of string suggestions",
            "- suggested_connections: Array of user IDs to suggest",
            "- suggested_joins: Array of join/activity suggestions",
        ]
        
        # Add user context
        if user:
            prompt_parts.extend([
                "",
                f"CURRENT USER: {user.name or 'User'}",
            ])

            # Try to get detailed profile data
            detailed_profile = None
            if db_session:
                try:
                    detailed_profile = db_session.query(DetailedProfile).filter(
                        DetailedProfile.user_id == user.user_id
                    ).first()
                except Exception as e:
                    print(f"Error fetching detailed profile: {e}")

            if detailed_profile:
                # Use detailed profile data
                if detailed_profile.bio:
                    prompt_parts.append(f"Bio: {detailed_profile.bio}")

                if detailed_profile.location:
                    prompt_parts.append(f"Location: {detailed_profile.location}")

                if detailed_profile.interests:
                    prompt_parts.append(f"Interests: {', '.join(detailed_profile.interests)}")

                if detailed_profile.passions:
                    prompt_parts.append(f"Passions: {', '.join(detailed_profile.passions)}")

                if detailed_profile.hobbies:
                    prompt_parts.append(f"Hobbies: {', '.join(detailed_profile.hobbies)}")

                if detailed_profile.goals:
                    prompt_parts.append(f"Goals: {detailed_profile.goals}")

                if detailed_profile.work:
                    prompt_parts.append(f"Work: {detailed_profile.work}")

                if detailed_profile.education:
                    prompt_parts.append(f"Education: {detailed_profile.education}")
            else:
                # Fallback to basic user data
                if hasattr(user, 'interests') and user.interests:
                    prompt_parts.append(f"Interests: {', '.join(user.interests)}")

                if hasattr(user, 'passions') and user.passions:
                    prompt_parts.append(f"Passions: {', '.join(user.passions)}")

                # Add location if available
                if hasattr(user, 'contact_info') and user.contact_info:
                    location = user.contact_info.get('location')
                    if location:
                        prompt_parts.append(f"Location: {location}")
        
        # Add context
        if context:
            prompt_parts.extend([
                "",
                f"ADDITIONAL CONTEXT: {json.dumps(context)}"
            ])
        
        prompt_parts.extend([
            "",
            "EXAMPLES:",
            "",
            "User: 'I want to find people who like hiking'",
            "Response: {",
            '  "message": "I\'d love to help you find hiking enthusiasts! Let me search for people with similar interests.",',
            '  "intent": "find_connections",',
            '  "confidence": 0.9,',
            '  "actions": [{"type": "search_users", "data": {"interests": ["hiking"]}, "description": "Search for users interested in hiking"}]',
            "}",
            "",
            "User: 'I want to plan a trip to Japan'",
            "Response: {",
            '  "message": "That sounds amazing! I can help you create a trip and find travel companions.",',
            '  "intent": "suggest_joins",',
            '  "confidence": 0.85,',
            '  "actions": [{"type": "create_join", "data": {"type": "trip", "destination": "Japan"}, "description": "Create Japan trip"}]',
            "}",
            "",
            "Be conversational, helpful, and always include actionable suggestions."
        ])

        # Add relevant Connected Strings if found
        if relevant_joins:
            prompt_parts.extend([
                "",
                "🔗 **IMPORTANT: RELEVANT CONNECTED STRINGS FOUND**",
                "",
                "I found these Connected Strings that match the user's interests. Include them in your response:",
                ""
            ])

            for join in relevant_joins:
                creator_info = join.get('creator', {})
                creator_name = creator_info.get('name', 'Unknown')
                creator_email = creator_info.get('email', '')

                prompt_parts.extend([
                    f"**{join['title']}**",
                    f"- Creator: {creator_name} ({creator_email})",
                    f"- Description: {join['description']}",
                    f"- Location: {join.get('location', 'TBD')}",
                    f"- Cost: {join.get('cost', 'Free')}",
                    f"- Difficulty: {join.get('difficulty', 'Any level')}",
                    f"- Max participants: {join.get('max_participants', 'Unlimited')}",
                    ""
                ])

            prompt_parts.extend([
                "**IMPORTANT**: Mention these specific Connected Strings in your response and provide the creator's contact information so the user can reach out directly.",
                ""
            ])

        return "\n".join(prompt_parts)
    
    async def _get_structured_response(self, messages: List[Dict[str, str]]) -> AIResponse:
        """Get structured response from OpenAI."""
        
        # Request JSON response
        response = await self.openai.chat_completion(
            messages=messages,
            temperature=0.7,
            max_tokens=800,
            response_format={"type": "json_object"}
        )
        
        try:
            # Parse JSON response
            response_data = json.loads(response["content"])
            
            # Create structured response
            ai_response = AIResponse(
                message=response_data.get("message", "I'm here to help!"),
                intent=IntentType(response_data.get("intent", "general_chat")),
                confidence=float(response_data.get("confidence", 0.5)),
                actions=[
                    AIAction(**action) for action in response_data.get("actions", [])
                ],
                suggested_strings=response_data.get("suggested_strings", []),
                suggested_connections=response_data.get("suggested_connections", []),
                suggested_joins=response_data.get("suggested_joins", [])
            )
            
            return ai_response
            
        except (json.JSONDecodeError, ValueError, KeyError) as e:
            # Fallback to simple response
            return AIResponse(
                message=response["content"],
                intent=IntentType.GENERAL_CHAT,
                confidence=0.3,
                actions=[]
            )
    
    async def summarize_conversation_to_string(
        self,
        conversation: List[Dict[str, str]],
        user: User
    ) -> Dict[str, Any]:
        """
        Summarize a conversation into a potential string/post.
        
        Args:
            conversation: List of messages
            user: Current user
            
        Returns:
            String suggestion data
        """
        # Build prompt for summarization
        messages = [
            {
                "role": "system",
                "content": (
                    "Summarize this conversation into a social post/string for Lifestring. "
                    "Extract the key activity, interest, or topic the user wants to share or find people for. "
                    "Return JSON with: title, content, tags, activity_type, location (if mentioned)."
                )
            },
            {
                "role": "user", 
                "content": f"Conversation to summarize:\n{json.dumps(conversation)}"
            }
        ]
        
        response = await self.openai.chat_completion(
            messages=messages,
            temperature=0.3,
            max_tokens=300,
            response_format={"type": "json_object"}
        )
        
        try:
            return json.loads(response["content"])
        except json.JSONDecodeError:
            return {
                "title": "New Activity",
                "content": "Looking to connect with like-minded people!",
                "tags": [],
                "activity_type": "general"
            }


# Create global instance
lifestring_ai = LifestringAIService()
