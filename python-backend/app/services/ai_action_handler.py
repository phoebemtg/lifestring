"""
AI Action Handler - Executes actions suggested by the AI.
Handles creating strings, finding connections, suggesting joins, etc.
"""
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.models.user import User, UserConnection, UserEmbedding
from app.models.string import String, StringEmbedding
from app.models.event import Event
from app.services.openai_service import openai_service


class AIActionHandler:
    """Handles execution of AI-suggested actions."""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def execute_action(
        self,
        action_type: str,
        action_data: Dict[str, Any],
        current_user: User
    ) -> Dict[str, Any]:
        """
        Execute an AI-suggested action.
        
        Args:
            action_type: Type of action to execute
            action_data: Data for the action
            current_user: User executing the action
            
        Returns:
            Result of the action
        """
        handlers = {
            "create_string": self._create_string,
            "search_users": self._search_users,
            "search_joins": self._search_joins,
            "create_join": self._create_join,
            "update_profile": self._update_profile
        }
        
        handler = handlers.get(action_type)
        if not handler:
            return {"error": f"Unknown action type: {action_type}"}
        
        try:
            return await handler(action_data, current_user)
        except Exception as e:
            return {"error": str(e)}
    
    async def _create_string(self, data: Dict[str, Any], user: User) -> Dict[str, Any]:
        """Create a new string/post."""
        
        # Extract data
        content = data.get("content", "")
        title = data.get("title", "")
        tags = data.get("tags", [])
        activity_type = data.get("activity_type", "general")
        location = data.get("location")
        
        # Create string
        string = String(
            user_id=user.user_id,
            content_text=content,
            stringable_type=activity_type,
            attributes={
                "title": title,
                "tags": tags,
                "location": location,
                "ai_generated": True
            }
        )
        
        self.db.add(string)
        self.db.flush()
        
        # Generate embedding for the string
        embedding_text = f"{title} {content} {' '.join(tags)}"
        embedding_vector = await openai_service.create_embedding(embedding_text)
        
        string_embedding = StringEmbedding(
            string_id=string.id,
            embedding=embedding_vector,
            model_version="text-embedding-3-small"
        )
        
        self.db.add(string_embedding)
        self.db.commit()
        
        return {
            "success": True,
            "string_id": str(string.id),
            "message": "String created successfully!"
        }
    
    async def _search_users(self, data: Dict[str, Any], user: User) -> Dict[str, Any]:
        """Search for users based on criteria."""
        
        interests = data.get("interests", [])
        location = data.get("location")
        activity_type = data.get("activity_type")
        max_results = data.get("max_results", 10)
        
        # Build query
        query = self.db.query(User).filter(User.user_id != user.user_id)
        
        # Filter by interests (if user has interests field)
        if interests:
            # This would need to be adapted based on how interests are stored
            # For now, assume interests are in a JSON field
            for interest in interests:
                query = query.filter(
                    User.attributes.op('->>')('interests').op('?')(interest)
                )
        
        # Filter by location
        if location:
            query = query.filter(
                User.contact_info.op('->>')('location').ilike(f"%{location}%")
            )
        
        # Get results
        users = query.limit(max_results).all()
        
        # Format results
        user_results = []
        for found_user in users:
            user_results.append({
                "user_id": str(found_user.user_id),
                "name": found_user.name,
                "location": found_user.contact_info.get("location") if found_user.contact_info else None,
                "interests": found_user.attributes.get("interests", []) if found_user.attributes else [],
                "compatibility_score": 0.8  # Placeholder - would calculate based on embeddings
            })
        
        return {
            "success": True,
            "users": user_results,
            "count": len(user_results)
        }
    
    async def _search_joins(self, data: Dict[str, Any], user: User) -> Dict[str, Any]:
        """Search for joins/events/activities."""
        
        activity_type = data.get("activity_type", "")
        location = data.get("location")
        interests = data.get("interests", [])
        max_results = data.get("max_results", 10)
        
        # Build query for events
        query = self.db.query(Event)
        
        # Filter by activity type
        if activity_type:
            query = query.filter(
                Event.custom_fields.op('->>')('activity_type').ilike(f"%{activity_type}%")
            )
        
        # Filter by location
        if location:
            query = query.filter(
                Event.location.ilike(f"%{location}%")
            )
        
        # Get results
        events = query.limit(max_results).all()
        
        # Format results
        join_results = []
        for event in events:
            join_results.append({
                "event_id": str(event.id),
                "title": event.title,
                "description": event.description,
                "location": event.location,
                "date": event.date.isoformat() if event.date else None,
                "activity_type": event.custom_fields.get("activity_type") if event.custom_fields else None,
                "participants_count": 0,  # Would need to count participants
                "match_score": 0.7  # Placeholder
            })
        
        return {
            "success": True,
            "joins": join_results,
            "count": len(join_results)
        }
    
    async def _create_join(self, data: Dict[str, Any], user: User) -> Dict[str, Any]:
        """Create a new join/event/activity."""
        
        title = data.get("title", "New Activity")
        description = data.get("description", "")
        activity_type = data.get("type", "general")
        location = data.get("location")
        destination = data.get("destination")
        
        # Create event
        event = Event(
            user_id=user.user_id,
            title=title,
            description=description,
            location=location or destination,
            custom_fields={
                "activity_type": activity_type,
                "destination": destination,
                "ai_generated": True,
                "looking_for_participants": True
            }
        )
        
        self.db.add(event)
        self.db.commit()
        
        return {
            "success": True,
            "event_id": str(event.id),
            "message": f"Created {activity_type}: {title}"
        }
    
    async def _update_profile(self, data: Dict[str, Any], user: User) -> Dict[str, Any]:
        """Update user profile based on AI suggestions."""
        
        # Extract suggested updates
        interests = data.get("interests", [])
        passions = data.get("passions", [])
        bio_updates = data.get("bio_updates", {})
        
        # Update user attributes
        if not user.attributes:
            user.attributes = {}
        
        if interests:
            user.attributes["interests"] = list(set(
                user.attributes.get("interests", []) + interests
            ))
        
        if passions:
            user.attributes["passions"] = list(set(
                user.attributes.get("passions", []) + passions
            ))
        
        # Update biography
        if bio_updates:
            if not user.biography:
                user.biography = {}
            user.biography.update(bio_updates)
        
        self.db.commit()
        
        return {
            "success": True,
            "message": "Profile updated with AI suggestions",
            "updated_fields": {
                "interests": interests,
                "passions": passions,
                "bio_updates": bio_updates
            }
        }


def create_action_handler(db: Session) -> AIActionHandler:
    """Create an action handler instance."""
    return AIActionHandler(db)
