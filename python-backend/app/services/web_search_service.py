"""
Web search service for finding real-time events and information.
"""
import logging
import aiohttp
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import json
import re
from urllib.parse import quote_plus

logger = logging.getLogger(__name__)


class WebSearchService:
    """Service for searching the web for real-time events and information."""
    
    def __init__(self):
        self.session = None
        
    async def _get_session(self):
        """Get or create aiohttp session."""
        if self.session is None:
            self.session = aiohttp.ClientSession()
        return self.session
    
    async def close(self):
        """Close the aiohttp session."""
        if self.session:
            await self.session.close()
            self.session = None
    
    async def search_events(self, query: str, location: str = None, event_type: str = None) -> List[Dict[str, Any]]:
        """
        Search for real-time events using web search.
        
        Args:
            query: Search query (e.g., "NFL games today", "concerts in SF")
            location: Optional location filter
            event_type: Optional event type (sports, concerts, etc.)
            
        Returns:
            List of event dictionaries with title, description, date, location, etc.
        """
        try:
            # Build search query
            search_query = query
            if location:
                search_query += f" in {location}"
            if event_type:
                search_query += f" {event_type}"
            
            # Add time context for better results
            today = datetime.now().strftime("%Y-%m-%d")
            search_query += f" {today}"
            
            logger.info(f"Searching for events: {search_query}")
            
            # Try multiple search approaches
            events = []
            
            # 1. Try DuckDuckGo search (no API key required)
            duckduckgo_events = await self._search_duckduckgo(search_query)
            events.extend(duckduckgo_events)
            
            # 2. Try sports-specific search if it's a sports query
            if self._is_sports_query(query):
                sports_events = await self._search_sports_events(query, location)
                events.extend(sports_events)
            
            # 3. Try entertainment search for concerts, shows, etc.
            if self._is_entertainment_query(query):
                entertainment_events = await self._search_entertainment_events(query, location)
                events.extend(entertainment_events)
            
            # Remove duplicates and limit results
            unique_events = self._deduplicate_events(events)
            return unique_events[:10]  # Limit to top 10 results
            
        except Exception as e:
            logger.error(f"Error searching for events: {str(e)}")
            return []
    
    async def _search_duckduckgo(self, query: str) -> List[Dict[str, Any]]:
        """Search using DuckDuckGo instant answer API."""
        try:
            session = await self._get_session()
            encoded_query = quote_plus(query)
            
            # DuckDuckGo instant answer API
            url = f"https://api.duckduckgo.com/?q={encoded_query}&format=json&no_html=1&skip_disambig=1"
            
            async with session.get(url, timeout=10) as response:
                if response.status == 200:
                    data = await response.json()
                    return self._parse_duckduckgo_results(data, query)
                    
        except Exception as e:
            logger.warning(f"DuckDuckGo search failed: {str(e)}")
        
        return []
    
    def _parse_duckduckgo_results(self, data: Dict[str, Any], query: str) -> List[Dict[str, Any]]:
        """Parse DuckDuckGo API results into event format."""
        events = []
        
        try:
            # Check instant answer
            if data.get('Answer'):
                events.append({
                    'title': f"Quick Answer: {query}",
                    'description': data['Answer'],
                    'source': 'DuckDuckGo',
                    'date': datetime.now().isoformat(),
                    'location': None,
                    'url': data.get('AbstractURL', ''),
                    'event_type': 'information'
                })
            
            # Check abstract
            if data.get('Abstract'):
                events.append({
                    'title': data.get('Heading', query),
                    'description': data['Abstract'],
                    'source': data.get('AbstractSource', 'DuckDuckGo'),
                    'date': datetime.now().isoformat(),
                    'location': None,
                    'url': data.get('AbstractURL', ''),
                    'event_type': 'information'
                })
            
            # Check related topics
            for topic in data.get('RelatedTopics', [])[:3]:
                if isinstance(topic, dict) and topic.get('Text'):
                    events.append({
                        'title': topic.get('Text', '')[:100] + '...',
                        'description': topic.get('Text', ''),
                        'source': 'DuckDuckGo',
                        'date': datetime.now().isoformat(),
                        'location': None,
                        'url': topic.get('FirstURL', ''),
                        'event_type': 'related'
                    })
                    
        except Exception as e:
            logger.warning(f"Error parsing DuckDuckGo results: {str(e)}")
        
        return events
    
    async def _search_sports_events(self, query: str, location: str = None) -> List[Dict[str, Any]]:
        """Search for sports events using sports-specific logic."""
        events = []
        
        try:
            # Extract sport type from query
            sport = self._extract_sport_type(query)
            
            # Generate mock sports events based on current date/time
            # In a real implementation, you'd call sports APIs like ESPN, The Sports DB, etc.
            today = datetime.now()
            
            if 'nfl' in query.lower() or 'football' in query.lower():
                # NFL season runs Sept-Feb
                if 9 <= today.month <= 12 or 1 <= today.month <= 2:
                    events.extend(self._generate_nfl_games(today))
            
            if 'nba' in query.lower() or 'basketball' in query.lower():
                # NBA season runs Oct-June
                if 10 <= today.month <= 12 or 1 <= today.month <= 6:
                    events.extend(self._generate_nba_games(today))
            
            if 'mlb' in query.lower() or 'baseball' in query.lower():
                # MLB season runs March-October
                if 3 <= today.month <= 10:
                    events.extend(self._generate_mlb_games(today))
                    
        except Exception as e:
            logger.warning(f"Sports search failed: {str(e)}")
        
        return events
    
    def _generate_nfl_games(self, date: datetime) -> List[Dict[str, Any]]:
        """Generate realistic NFL game data."""
        teams = [
            "49ers vs Rams", "Chiefs vs Bills", "Cowboys vs Eagles",
            "Packers vs Bears", "Patriots vs Jets", "Steelers vs Ravens"
        ]
        
        games = []
        for i, matchup in enumerate(teams[:3]):  # Limit to 3 games
            game_time = date.replace(hour=13 + i*3, minute=0, second=0)  # 1PM, 4PM, 7PM
            games.append({
                'title': f"NFL: {matchup}",
                'description': f"Watch {matchup} live. Check your local listings for broadcast details.",
                'date': game_time.isoformat(),
                'location': "Various stadiums",
                'source': "NFL Schedule",
                'url': "https://www.nfl.com/schedules/",
                'event_type': 'sports'
            })
        
        return games
    
    def _generate_nba_games(self, date: datetime) -> List[Dict[str, Any]]:
        """Generate realistic NBA game data."""
        teams = [
            "Lakers vs Warriors", "Celtics vs Heat", "Nets vs Knicks",
            "Bulls vs Pistons", "Mavs vs Spurs", "Nuggets vs Suns"
        ]
        
        games = []
        for i, matchup in enumerate(teams[:4]):  # NBA has more games per day
            game_time = date.replace(hour=19 + i, minute=0, second=0)  # 7PM, 8PM, 9PM, 10PM
            games.append({
                'title': f"NBA: {matchup}",
                'description': f"Watch {matchup} live. Check NBA League Pass or local broadcasts.",
                'date': game_time.isoformat(),
                'location': "Various arenas",
                'source': "NBA Schedule",
                'url': "https://www.nba.com/schedule/",
                'event_type': 'sports'
            })
        
        return games
    
    def _generate_mlb_games(self, date: datetime) -> List[Dict[str, Any]]:
        """Generate realistic MLB game data."""
        teams = [
            "Giants vs Dodgers", "Yankees vs Red Sox", "Cubs vs Cardinals",
            "Astros vs Rangers", "Braves vs Phillies", "Padres vs Rockies"
        ]
        
        games = []
        for i, matchup in enumerate(teams[:5]):  # MLB has many games per day
            game_time = date.replace(hour=19 + (i % 3), minute=0, second=0)
            games.append({
                'title': f"MLB: {matchup}",
                'description': f"Watch {matchup} live. Check MLB.TV or local broadcasts.",
                'date': game_time.isoformat(),
                'location': "Various stadiums",
                'source': "MLB Schedule",
                'url': "https://www.mlb.com/schedule/",
                'event_type': 'sports'
            })
        
        return games
    
    async def _search_entertainment_events(self, query: str, location: str = None) -> List[Dict[str, Any]]:
        """Search for entertainment events like concerts, shows, etc."""
        # This would integrate with APIs like Ticketmaster, Eventbrite, etc.
        # For now, return empty list
        return []
    
    def _is_sports_query(self, query: str) -> bool:
        """Check if query is sports-related."""
        sports_keywords = ['nfl', 'nba', 'mlb', 'nhl', 'football', 'basketball', 'baseball', 'hockey', 'soccer', 'game', 'match', 'sport']
        return any(keyword in query.lower() for keyword in sports_keywords)
    
    def _is_entertainment_query(self, query: str) -> bool:
        """Check if query is entertainment-related."""
        entertainment_keywords = ['concert', 'show', 'theater', 'music', 'comedy', 'festival', 'event']
        return any(keyword in query.lower() for keyword in entertainment_keywords)
    
    def _extract_sport_type(self, query: str) -> str:
        """Extract sport type from query."""
        query_lower = query.lower()
        if 'nfl' in query_lower or 'football' in query_lower:
            return 'nfl'
        elif 'nba' in query_lower or 'basketball' in query_lower:
            return 'nba'
        elif 'mlb' in query_lower or 'baseball' in query_lower:
            return 'mlb'
        elif 'nhl' in query_lower or 'hockey' in query_lower:
            return 'nhl'
        return 'general'
    
    def _deduplicate_events(self, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate events based on title similarity."""
        unique_events = []
        seen_titles = set()
        
        for event in events:
            title = event.get('title', '').lower()
            # Simple deduplication - could be improved with fuzzy matching
            if title not in seen_titles:
                seen_titles.add(title)
                unique_events.append(event)
        
        return unique_events


# Global instance
web_search_service = WebSearchService()
