#!/usr/bin/env python3
"""
Test the real-time service directly to verify it's working
"""
import asyncio
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('python-backend/.env')

# Add the python-backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'python-backend'))

from app.api.v1.ai_chat import search_real_time_events

async def test_direct_realtime():
    """Test the search_real_time_events function directly"""
    
    test_messages = [
        "What events are happening this weekend in Salt Lake City?",
        "Show me local events in Salt Lake City",
        "What's happening today in Salt Lake City?",
        "events in Salt Lake City"
    ]
    
    user_profile = {
        'location': 'Salt Lake City, UT',
        'interests': ['technology', 'outdoor activities', 'arts']
    }
    
    for i, message in enumerate(test_messages, 1):
        print(f"\n🧪 Test {i}: Direct Real-time Service Test")
        print(f"💬 Message: {message}")
        
        try:
            events = await search_real_time_events(message, user_profile)
            
            if events:
                print(f"✅ Found {len(events)} events:")
                for event in events:
                    print(f"   • {event['title']}")
                    print(f"     Date: {event.get('date', 'TBD')} at {event.get('time', 'TBD')}")
                    print(f"     Location: {event.get('location', 'TBD')}")
                    print(f"     Free: {'Yes' if event.get('is_free') else 'No'}")
                    print(f"     Source: {event.get('source', 'Unknown')}")
                    print()
            else:
                print("❌ No events found")
                
        except Exception as e:
            print(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()
        
        print("="*50)

if __name__ == "__main__":
    asyncio.run(test_direct_realtime())
