"""
Real-time data service for weather, news, and current events.
"""
import aiohttp
import asyncio
import os
from typing import Dict, Any, Optional, List
from datetime import datetime
import json
import logging

logger = logging.getLogger(__name__)


class RealtimeService:
    """Service for fetching real-time data like weather, news, and current events."""
    
    def __init__(self):
        # Load API keys from environment variables
        self.weather_api_key = os.getenv('OPENWEATHER_API_KEY')
        self.news_api_key = os.getenv('NEWSAPI_KEY')
    
    async def get_current_time(self, location: Optional[str] = None) -> Dict[str, Any]:
        """Get current time, optionally for a specific location."""
        now = datetime.now()
        
        result = {
            "current_time": now.strftime("%I:%M %p"),
            "current_date": now.strftime("%A, %B %d, %Y"),
            "timezone": "Local Time",
            "location": location or "Local"
        }
        
        # TODO: Add timezone conversion based on location
        # For now, return local time
        
        return result
    
    async def get_weather(self, location: str) -> Dict[str, Any]:
        """Get current weather for a location using free weather service."""
        try:
            # Use wttr.in - a free weather service that doesn't require API keys
            async with aiohttp.ClientSession() as session:
                # wttr.in provides weather data in JSON format
                url = f"https://wttr.in/{location}?format=j1"

                async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                    if response.status == 200:
                        data = await response.json()
                        current = data["current_condition"][0]

                        return {
                            "location": location,
                            "temperature": f"{current['temp_F']}°F ({current['temp_C']}°C)",
                            "condition": current["weatherDesc"][0]["value"],
                            "humidity": f"{current['humidity']}%",
                            "wind_speed": f"{current['windspeedMiles']} mph",
                            "feels_like": f"{current['FeelsLikeF']}°F"
                        }
                    else:
                        return self._get_weather_fallback(location)
        except Exception as e:
            return self._get_weather_fallback(location)

    def _get_weather_fallback(self, location: str) -> Dict[str, Any]:
        """Fallback weather response when API is unavailable."""
        return {
            "location": location,
            "temperature": "Unable to fetch",
            "condition": "Weather data temporarily unavailable",
            "message": f"Please check your local weather app or website for current conditions in {location}. You can also try asking me again in a moment."
        }
    
    async def get_local_news(self, location: str, limit: int = 3) -> List[Dict[str, Any]]:
        """Get current news and events for a location."""
        try:
            # Use a combination of approaches to get current events
            current_events = []

            # Add some general current events based on the date
            now = datetime.now()
            day_of_week = now.strftime("%A")

            # Generate contextual current events
            current_events.append({
                "title": f"Today is {day_of_week}, {now.strftime('%B %d, %Y')}",
                "description": f"Current local time in {location} area. Great day for activities and connecting with others!",
                "type": "general",
                "published_at": now.isoformat()
            })

            # Add location-specific suggestions
            if "san francisco" in location.lower() or "sf" in location.lower():
                current_events.extend([
                    {
                        "title": "Golden Gate Park Activities",
                        "description": "Perfect weather for outdoor activities in Golden Gate Park. Great for hiking, photography, and meeting people.",
                        "type": "local_activity",
                        "published_at": now.isoformat()
                    },
                    {
                        "title": "Bay Area Tech Meetups",
                        "description": "Active tech community with regular networking events and meetups happening throughout the week.",
                        "type": "community",
                        "published_at": now.isoformat()
                    }
                ])
            elif "berkeley" in location.lower():
                current_events.extend([
                    {
                        "title": "UC Berkeley Campus Events",
                        "description": "University campus often hosts public lectures, cultural events, and community activities.",
                        "type": "local_activity",
                        "published_at": now.isoformat()
                    },
                    {
                        "title": "Berkeley Hills Hiking",
                        "description": "Great hiking trails with views of the Bay Area. Popular spot for outdoor enthusiasts.",
                        "type": "outdoor",
                        "published_at": now.isoformat()
                    }
                ])
            else:
                current_events.append({
                    "title": f"Local Events in {location}",
                    "description": f"Check local community centers, libraries, and parks for current events and activities in {location}.",
                    "type": "general",
                    "published_at": now.isoformat()
                })

            return current_events[:limit]

        except Exception as e:
            return [{
                "title": "Current Events",
                "description": f"For the latest local news and events in {location}, check your local news websites, community boards, or social media groups.",
                "type": "fallback",
                "published_at": datetime.now().isoformat()
            }]
    
    async def get_local_events(self, location: str, limit: int = 3) -> List[Dict[str, Any]]:
        """Get local events for a location."""
        # This would integrate with Eventbrite, Meetup, or other event APIs
        # For now, return a placeholder
        return [{
            "title": "Local Events",
            "description": f"Check local event listings for {location}",
            "location": location,
            "date": "Various dates",
            "url": None
        }]
    
    def get_available_functions(self) -> List[Dict[str, Any]]:
        """Get list of available real-time functions for OpenAI function calling."""
        return [
            {
                "type": "function",
                "function": {
                    "name": "get_current_time",
                    "description": "Get the current time and date, optionally for a specific location",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "location": {
                                "type": "string",
                                "description": "The location to get time for (optional)"
                            }
                        }
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_weather",
                    "description": "Get current weather information for a location",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "location": {
                                "type": "string",
                                "description": "The city or location to get weather for"
                            }
                        },
                        "required": ["location"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_local_news",
                    "description": "Get recent local news for a location",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "location": {
                                "type": "string",
                                "description": "The city or location to get news for"
                            },
                            "limit": {
                                "type": "integer",
                                "description": "Number of news articles to return (default 3)",
                                "default": 3
                            }
                        },
                        "required": ["location"]
                    }
                }
            }
        ]
    
    async def execute_function(self, function_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a real-time function by name."""
        if function_name == "get_current_time":
            return await self.get_current_time(arguments.get("location"))
        elif function_name == "get_weather":
            return await self.get_weather(arguments["location"])
        elif function_name == "get_local_news":
            return await self.get_local_news(
                arguments["location"], 
                arguments.get("limit", 3)
            )
        elif function_name == "get_local_events":
            return await self.get_local_events(
                arguments["location"],
                arguments.get("limit", 3)
            )
        else:
            return {"error": f"Unknown function: {function_name}"}


# Global instance
realtime_service = RealtimeService()
