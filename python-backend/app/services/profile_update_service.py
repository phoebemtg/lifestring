"""
Profile update service for handling AI-driven profile modifications.
"""
import logging
from typing import Dict, Any, List, Optional
from app.core.config import settings
import httpx

logger = logging.getLogger(__name__)


class ProfileUpdateService:
    """Service for updating user profiles via AI chat commands."""
    
    def __init__(self):
        self.supabase_url = settings.SUPABASE_URL
        self.supabase_anon_key = settings.SUPABASE_ANON_KEY
    
    async def update_profile_field(
        self, 
        user_id: str, 
        field: str, 
        value: Any,
        token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Update a specific profile field for a user.
        
        Args:
            user_id: The user's ID
            field: The field to update (location, bio, etc.)
            value: The new value for the field
            token: User's auth token for authorization
            
        Returns:
            Dict with success status and message
        """
        try:
            async with httpx.AsyncClient() as client:
                headers = {
                    "apikey": self.supabase_anon_key,
                    "Content-Type": "application/json"
                }
                
                if token:
                    headers["Authorization"] = f"Bearer {token}"
                
                # Prepare update data
                update_data = {field: value}
                
                # Update detailed_profiles table
                response = await client.patch(
                    f"{self.supabase_url}/rest/v1/detailed_profiles",
                    headers=headers,
                    params={"user_id": f"eq.{user_id}"},
                    json=update_data
                )
                
                if response.status_code == 204:  # Supabase returns 204 for successful updates
                    return {
                        "success": True,
                        "message": f"Successfully updated {field}",
                        "field": field,
                        "value": value
                    }
                else:
                    logger.error(f"Failed to update profile field {field}: {response.status_code} - {response.text}")
                    return {
                        "success": False,
                        "message": f"Failed to update {field}",
                        "error": response.text
                    }
                    
        except Exception as e:
            logger.error(f"Error updating profile field {field}: {str(e)}")
            return {
                "success": False,
                "message": f"Error updating {field}",
                "error": str(e)
            }
    
    async def add_to_array_field(
        self, 
        user_id: str, 
        field: str, 
        items: List[str],
        token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Add items to an array field (hobbies, interests, skills, etc.).
        
        Args:
            user_id: The user's ID
            field: The array field to update (hobbies, interests, skills, passions)
            items: List of items to add
            token: User's auth token for authorization
            
        Returns:
            Dict with success status and message
        """
        try:
            # First, get current values
            current_profile = await self._get_current_profile(user_id, token)
            if not current_profile:
                return {
                    "success": False,
                    "message": "Could not retrieve current profile"
                }
            
            # Get current array values
            current_items = current_profile.get(field, []) or []
            
            # Add new items (avoid duplicates)
            new_items = []
            for item in items:
                if item.lower() not in [existing.lower() for existing in current_items]:
                    new_items.append(item)
            
            if not new_items:
                return {
                    "success": True,
                    "message": f"All items already exist in {field}",
                    "field": field,
                    "added_items": []
                }
            
            # Update with combined list
            updated_items = current_items + new_items
            
            result = await self.update_profile_field(user_id, field, updated_items, token)
            if result["success"]:
                result["added_items"] = new_items
                result["message"] = f"Added {len(new_items)} new items to {field}"
            
            return result
            
        except Exception as e:
            logger.error(f"Error adding to array field {field}: {str(e)}")
            return {
                "success": False,
                "message": f"Error adding to {field}",
                "error": str(e)
            }
    
    async def _get_current_profile(self, user_id: str, token: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Get current profile data for a user."""
        try:
            async with httpx.AsyncClient() as client:
                headers = {
                    "apikey": self.supabase_anon_key,
                    "Content-Type": "application/json"
                }
                
                if token:
                    headers["Authorization"] = f"Bearer {token}"
                
                response = await client.get(
                    f"{self.supabase_url}/rest/v1/detailed_profiles",
                    headers=headers,
                    params={"user_id": f"eq.{user_id}", "select": "*"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data[0] if data else None
                else:
                    logger.error(f"Failed to get current profile: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error getting current profile: {str(e)}")
            return None


# Global instance
profile_update_service = ProfileUpdateService()
