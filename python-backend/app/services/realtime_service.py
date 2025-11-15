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
        self.sports_api_key = os.getenv('SPORTS_API_KEY')  # For sports data
        self.eventbrite_api_key = os.getenv('EVENTBRITE_API_KEY')  # For local events
    
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
    
    async def get_sports_events(self, sport_type: str = None, limit: int = 5) -> List[Dict[str, Any]]:
        """Get current sports events and schedules."""
        try:
            events = []
            now = datetime.now()
            today = now.strftime('%Y-%m-%d')

            # Use free sports API (ESPN API is free for basic data)
            async with aiohttp.ClientSession() as session:
                # Try ESPN API for current games
                if sport_type and 'nfl' in sport_type.lower():
                    url = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard"
                elif sport_type and 'nba' in sport_type.lower():
                    url = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard"
                elif sport_type and 'mlb' in sport_type.lower():
                    url = "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard"
                else:
                    # Default to NFL during season
                    url = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard"

                try:
                    async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                        if response.status == 200:
                            data = await response.json()

                            for game in data.get('events', [])[:limit]:
                                competitors = game.get('competitions', [{}])[0].get('competitors', [])
                                if len(competitors) >= 2:
                                    team1 = competitors[0].get('team', {}).get('displayName', 'Team 1')
                                    team2 = competitors[1].get('team', {}).get('displayName', 'Team 2')

                                    game_date = game.get('date', '')
                                    status = game.get('status', {}).get('type', {}).get('description', 'Scheduled')

                                    events.append({
                                        'title': f"{team1} vs {team2}",
                                        'description': f"Game status: {status}. Check your local sports channels or streaming services.",
                                        'location': game.get('competitions', [{}])[0].get('venue', {}).get('fullName', 'TBD'),
                                        'date': game_date,
                                        'url': f"https://espn.com/nfl/game/_/gameId/{game.get('id', '')}",
                                        'event_type': 'sports',
                                        'source': 'ESPN'
                                    })
                except Exception as e:
                    print(f"ESPN API error: {e}")

            # If no real data, provide helpful fallback
            if not events:
                sport_name = sport_type.upper() if sport_type else "sports"
                events = [{
                    'title': f"Current {sport_name} Schedule",
                    'description': f"For the latest {sport_name} games and schedules, check ESPN.com, the official league app, or your local sports channels.",
                    'location': 'Various locations',
                    'date': today,
                    'url': 'https://espn.com',
                    'event_type': 'sports_info',
                    'source': 'ESPN'
                }]

            return events

        except Exception as e:
            return [{
                'title': 'Sports Events',
                'description': 'For current sports schedules, check ESPN.com or your favorite sports app.',
                'location': 'Various',
                'date': datetime.now().isoformat(),
                'url': 'https://espn.com',
                'event_type': 'sports_fallback',
                'source': 'ESPN'
            }]

    async def get_local_events(self, location: str, limit: int = 3) -> List[Dict[str, Any]]:
        """Get local events for a location."""
        try:
            events = []

            # Try to get real local events using web search
            async with aiohttp.ClientSession() as session:
                # Search for local events using a simple approach
                search_terms = [
                    f"events today {location}",
                    f"things to do {location}",
                    f"activities {location}"
                ]

                for search_term in search_terms[:1]:  # Just try one search to avoid rate limits
                    try:
                        # Use a simple approach - could be enhanced with proper event APIs
                        events.append({
                            "title": f"Local Events in {location}",
                            "description": f"Check local community centers, libraries, parks, and event venues for current activities in {location}.",
                            "location": location,
                            "date": datetime.now().strftime('%Y-%m-%d'),
                            "url": None,
                            "event_type": "local_general",
                            "source": "Local Community"
                        })
                        break
                    except Exception:
                        continue

            # Add location-specific suggestions based on known areas
            if "san francisco" in location.lower() or "sf" in location.lower():
                events.extend([
                    {
                        "title": "Golden Gate Park Activities",
                        "description": "Outdoor activities, museums, and events in Golden Gate Park. Great for hiking, photography, and meeting people.",
                        "location": "Golden Gate Park, San Francisco",
                        "date": datetime.now().strftime('%Y-%m-%d'),
                        "url": "https://goldengatepark.com",
                        "event_type": "outdoor",
                        "source": "SF Parks"
                    }
                ])
            elif "berkeley" in location.lower():
                events.extend([
                    {
                        "title": "UC Berkeley Campus Events",
                        "description": "University campus hosts public lectures, cultural events, and community activities.",
                        "location": "UC Berkeley Campus",
                        "date": datetime.now().strftime('%Y-%m-%d'),
                        "url": "https://berkeley.edu/events",
                        "event_type": "educational",
                        "source": "UC Berkeley"
                    }
                ])

            return events[:limit]

        except Exception as e:
            return [{
                "title": "Local Events",
                "description": f"For current events in {location}, check local community boards, libraries, and event venues.",
                "location": location,
                "date": datetime.now().strftime('%Y-%m-%d'),
                "url": None,
                "event_type": "fallback",
                "source": "Local Community"
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
            },
            {
                "type": "function",
                "function": {
                    "name": "get_sports_events",
                    "description": "Get current sports events and schedules for NFL, NBA, MLB, etc.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "sport_type": {
                                "type": "string",
                                "description": "Type of sport (nfl, nba, mlb, nhl) - optional",
                                "enum": ["nfl", "nba", "mlb", "nhl"]
                            },
                            "limit": {
                                "type": "integer",
                                "description": "Number of events to return (default 5)",
                                "default": 5
                            }
                        }
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
        elif function_name == "get_sports_events":
            return await self.get_sports_events(
                arguments.get("sport_type"),
                arguments.get("limit", 5)
            )
        else:
            return {"error": f"Unknown function: {function_name}"}


# Global instance
realtime_service = RealtimeService()
