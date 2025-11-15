"""
Conversation memory service for extracting and storing user preferences from chat history.
"""
import json
import re
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.room import Message
from app.services.openai_service import openai_service


class ConversationMemoryService:
    """Service for managing conversation memory and user preference extraction."""
    
    def __init__(self):
        self.preference_patterns = {
            'favorite_activities': [
                r'i love (\w+)',
                r'i enjoy (\w+)',
                r'my favorite (\w+) is (\w+)',
                r'i really like (\w+)',
                r'i\'m passionate about (\w+)'
            ],
            'dislikes': [
                r'i hate (\w+)',
                r'i don\'t like (\w+)',
                r'i dislike (\w+)',
                r'not a fan of (\w+)'
            ],
            'goals': [
                r'i want to (\w+)',
                r'my goal is to (\w+)',
                r'i\'m trying to (\w+)',
                r'i hope to (\w+)'
            ],
            'locations': [
                r'i live in (\w+)',
                r'i\'m from (\w+)',
                r'i\'m in (\w+)',
                r'i\'m located in (\w+)'
            ]
        }
    
    async def extract_preferences_from_message(self, message_content: str) -> Dict[str, List[str]]:
        """
        Extract user preferences from a single message using pattern matching.
        
        Args:
            message_content: The message content to analyze
            
        Returns:
            Dictionary of extracted preferences by category
        """
        preferences = {
            'favorite_activities': [],
            'dislikes': [],
            'goals': [],
            'locations': []
        }
        
        message_lower = message_content.lower()
        
        for category, patterns in self.preference_patterns.items():
            for pattern in patterns:
                matches = re.findall(pattern, message_lower)
                if matches:
                    if isinstance(matches[0], tuple):
                        # Handle patterns with multiple groups
                        preferences[category].extend([' '.join(match) for match in matches])
                    else:
                        # Handle patterns with single group
                        preferences[category].extend(matches)
        
        return preferences
    
    async def extract_preferences_with_ai(self, messages: List[str], user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Use AI to extract user preferences from conversation history.
        
        Args:
            messages: List of user messages from conversation
            user_profile: Current user profile data
            
        Returns:
            Extracted preferences and insights
        """
        try:
            # Prepare conversation text
            conversation_text = "\n".join(messages[-10:])  # Last 10 messages
            
            # Create AI prompt for preference extraction
            system_prompt = """
            You are an AI assistant that analyzes conversation history to extract user preferences and insights.
            
            Based on the conversation below, extract:
            1. Activities the user enjoys or mentions positively
            2. Things the user dislikes or mentions negatively  
            3. Goals or aspirations the user mentions
            4. Locations or places the user mentions
            5. Any other notable preferences or personality traits
            
            Return your analysis as a JSON object with these keys:
            - favorite_activities: array of activities
            - dislikes: array of things they dislike
            - goals: array of goals/aspirations
            - locations: array of locations mentioned
            - personality_traits: array of personality insights
            - interests: array of interests mentioned
            
            Only include items that are clearly expressed by the user. Be conservative and accurate.
            """
            
            user_prompt = f"""
            Current user profile:
            - Name: {user_profile.get('contact_info', {}).get('name', 'User')}
            - Bio: {user_profile.get('bio', '')}
            - Interests: {', '.join(user_profile.get('interests', []))}
            - Hobbies: {', '.join(user_profile.get('hobbies', []))}
            
            Conversation history:
            {conversation_text}
            
            Extract preferences from this conversation:
            """
            
            messages_for_ai = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
            
            response = await openai_service.chat_completion(
                messages=messages_for_ai,
                model="gpt-4o-mini",  # Use cheaper model for analysis
                max_tokens=500,
                temperature=0.1  # Low temperature for consistent extraction
            )
            
            # Parse JSON response
            try:
                preferences = json.loads(response["content"])
                return preferences
            except json.JSONDecodeError:
                # Fallback to pattern matching if AI response isn't valid JSON
                return await self._fallback_pattern_extraction(messages)
                
        except Exception as e:
            print(f"Error in AI preference extraction: {e}")
            return await self._fallback_pattern_extraction(messages)
    
    async def _fallback_pattern_extraction(self, messages: List[str]) -> Dict[str, Any]:
        """Fallback to pattern-based extraction if AI fails."""
        combined_preferences = {
            'favorite_activities': [],
            'dislikes': [],
            'goals': [],
            'locations': [],
            'personality_traits': [],
            'interests': []
        }
        
        for message in messages:
            prefs = await self.extract_preferences_from_message(message)
            for key, values in prefs.items():
                combined_preferences[key].extend(values)
        
        # Remove duplicates
        for key in combined_preferences:
            combined_preferences[key] = list(set(combined_preferences[key]))
        
        return combined_preferences
    
    async def update_user_memory(self, db: Session, user_id: str, room_id: str, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update user memory based on recent conversation history.
        
        Args:
            db: Database session
            user_id: User ID
            room_id: Room ID for conversation
            user_profile: Current user profile
            
        Returns:
            Updated memory/preferences
        """
        try:
            # Get recent user messages from this conversation
            recent_messages = db.query(Message).filter(
                Message.room_id == room_id,
                Message.user_id == user_id
            ).order_by(Message.created_at.desc()).limit(10).all()
            
            if not recent_messages:
                return {}
            
            # Extract message content
            message_contents = [msg.content for msg in reversed(recent_messages)]
            
            # Use AI to extract preferences
            extracted_preferences = await self.extract_preferences_with_ai(message_contents, user_profile)
            
            # Store in user's meta field (could be enhanced with dedicated table)
            user = db.query(User).filter(User.user_id == user_id).first()
            if user:
                if not user.meta:
                    user.meta = {}
                
                # Update conversation memory
                if 'conversation_memory' not in user.meta:
                    user.meta['conversation_memory'] = {}
                
                memory = user.meta['conversation_memory']
                memory['last_updated'] = datetime.now().isoformat()
                memory['preferences'] = extracted_preferences
                
                # Merge with existing preferences
                for key, values in extracted_preferences.items():
                    if key not in memory:
                        memory[key] = []
                    if isinstance(values, list):
                        memory[key] = list(set(memory[key] + values))
                
                db.commit()
                
            return extracted_preferences
            
        except Exception as e:
            print(f"Error updating user memory: {e}")
            return {}


# Global instance
conversation_memory_service = ConversationMemoryService()
