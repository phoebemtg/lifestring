"""
Profile service for centralized user profile data management.
"""
import os
import httpx
from typing import Dict, Any, Optional
from app.core.config import settings


class ProfileService:
    """Service for managing user profile data across different sources."""
    
    def __init__(self):
        self.supabase_url = settings.SUPABASE_URL
        self.supabase_anon_key = settings.SUPABASE_ANON_KEY
    
    async def get_user_profile(self, user_id: str, token: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Get comprehensive user profile data from both user_profiles and detailed_profiles.
        
        Args:
            user_id: The user's ID
            token: Optional JWT token for RLS policies
            
        Returns:
            Consolidated profile data or None if not found
        """
        try:
            async with httpx.AsyncClient() as client:
                headers = {
                    "apikey": self.supabase_anon_key,
                    "Content-Type": "application/json"
                }
                
                # Add user JWT token if available for RLS policies
                if token:
                    headers["Authorization"] = f"Bearer {token}"
                
                # Get detailed profile data (where frontend saves detailed info)
                detailed_profile = await self._get_detailed_profile(client, headers, user_id)
                
                # Get basic user profile data (created automatically)
                user_profile = await self._get_user_profile(client, headers, user_id)
                
                # Merge the data with detailed_profile taking precedence
                return self._merge_profile_data(user_profile, detailed_profile)
                
        except Exception as e:
            print(f"Error fetching user profile: {e}")
            return None
    
    async def _get_detailed_profile(self, client: httpx.AsyncClient, headers: Dict[str, str], user_id: str) -> Optional[Dict[str, Any]]:
        """Get data from detailed_profiles table."""
        try:
            response = await client.get(
                f"{self.supabase_url}/rest/v1/detailed_profiles?user_id=eq.{user_id}",
                headers=headers
            )
            
            if response.status_code == 200:
                profiles = response.json()
                if profiles:
                    return profiles[0]
            return None
        except Exception as e:
            print(f"Error fetching detailed profile: {e}")
            return None
    
    async def _get_user_profile(self, client: httpx.AsyncClient, headers: Dict[str, str], user_id: str) -> Optional[Dict[str, Any]]:
        """Get data from user_profiles table."""
        try:
            response = await client.get(
                f"{self.supabase_url}/rest/v1/user_profiles?user_id=eq.{user_id}",
                headers=headers
            )
            
            if response.status_code == 200:
                profiles = response.json()
                if profiles:
                    return profiles[0]
            return None
        except Exception as e:
            print(f"Error fetching user profile: {e}")
            return None
    
    def _merge_profile_data(self, user_profile: Optional[Dict[str, Any]], detailed_profile: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """
        Merge user_profile and detailed_profile data into a consistent format.
        
        Args:
            user_profile: Data from user_profiles table
            detailed_profile: Data from detailed_profiles table
            
        Returns:
            Merged profile data in consistent format
        """
        if not user_profile and not detailed_profile:
            return None
        
        # Start with empty profile
        merged_profile = {
            "bio": "",
            "interests": [],
            "passions": [],
            "hobbies": [],
            "skills": [],
            "goals": "",
            "dreams": "",
            "work": "",
            "education": "",
            "location": "",
            "age": None,
            "birthday": None,
            "contact_info": {"name": "User"}
        }
        
        # Add data from user_profile (basic profile)
        if user_profile:
            contact_info = user_profile.get('contact_info', {})
            if contact_info:
                merged_profile["contact_info"] = contact_info
                merged_profile["location"] = contact_info.get('location', '')
                merged_profile["birthday"] = contact_info.get('birthday')
            
            attributes = user_profile.get('attributes', {})
            if attributes:
                merged_profile["interests"] = attributes.get('interests', []) or []
                merged_profile["passions"] = attributes.get('passions', []) or []
                merged_profile["hobbies"] = attributes.get('hobbies', []) or []
                merged_profile["skills"] = attributes.get('skills', []) or []
            
            biography = user_profile.get('biography', {})
            if biography:
                merged_profile["bio"] = biography.get('bio', '')
                merged_profile["goals"] = biography.get('goals', '')
                merged_profile["dreams"] = biography.get('dreams', '')
                merged_profile["work"] = biography.get('work', '')
                merged_profile["education"] = biography.get('education', '')
        
        # Override with detailed_profile data (more recent/detailed)
        if detailed_profile:
            # Direct fields from detailed_profiles
            for field in ["bio", "goals", "dreams", "work", "education", "location", "age", "birthday"]:
                if detailed_profile.get(field):
                    merged_profile[field] = detailed_profile[field]
            
            # Array fields
            for field in ["interests", "passions", "hobbies", "skills"]:
                if detailed_profile.get(field):
                    merged_profile[field] = detailed_profile[field]
            
            # Name from detailed_profile
            if detailed_profile.get('name') or detailed_profile.get('full_name'):
                merged_profile["contact_info"]["name"] = detailed_profile.get('name') or detailed_profile.get('full_name')

        # Add conversation memory from user_profile meta if available
        if user_profile and user_profile.get('meta'):
            meta = user_profile['meta']
            if meta.get('conversation_memory'):
                merged_profile["conversation_memory"] = meta['conversation_memory']

        return merged_profile


# Global instance
profile_service = ProfileService()
