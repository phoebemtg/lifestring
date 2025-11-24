#!/usr/bin/env python3
"""
Test script for the updated Eventbrite API integration
"""
import asyncio
import aiohttp
import sys
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv('python-backend/.env')

# Add the python-backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'python-backend'))

from app.services.realtime_service import RealtimeService

async def test_eventbrite_api():
    """Test the RapidAPI Eventbrite integration"""
    print("🧪 Testing RapidAPI Eventbrite Integration...")
    
    # Create service instance
    service = RealtimeService()
    
    # Test location
    location = "Salt Lake City, UT"
    
    print(f"📍 Testing location: {location}")
    print(f"🔑 API Key configured: {'Yes' if service.eventbrite_api_key else 'No'}")
    
    if not service.eventbrite_api_key:
        print("❌ No API key found! Check your .env file.")
        return
    
    # Test the API call
    async with aiohttp.ClientSession() as session:
        try:
            events = await service._get_eventbrite_events(session, location, 5)
            
            print(f"\n✅ Successfully fetched {len(events)} events!")
            
            for i, event in enumerate(events, 1):
                print(f"\n📅 Event {i}:")
                print(f"   Title: {event['title']}")
                print(f"   Date: {event['date']} at {event['time']}")
                print(f"   Location: {event['location']}")
                print(f"   Description: {event['description'][:100]}...")
                print(f"   Free: {'Yes' if event['is_free'] else 'No'}")
                print(f"   Source: {event['source']}")
                
        except Exception as e:
            print(f"❌ Error testing API: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_eventbrite_api())
