#!/usr/bin/env python3
"""
Test the chat interface with event requests
"""
import asyncio
import aiohttp
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv('python-backend/.env')

async def test_chat_events():
    """Test chat interface asking for events"""

    # Test data - simulating a user asking for events
    test_messages = [
        "What events are happening this weekend in Salt Lake City?",
        "What's happening today in Salt Lake City?",
        "Show me local events in Salt Lake City",
        "What can I do this weekend in Salt Lake City?"
    ]

    # Test both endpoints
    endpoints = [
        ("Test Endpoint", "http://localhost:8001/api/ai/lifestring-chat-test"),
        ("Public Endpoint", "http://localhost:8001/api/ai/lifestring-chat-public")
    ]

    for endpoint_name, url in endpoints:
        print(f"\n🔗 Testing {endpoint_name}: {url}")

        for i, message in enumerate(test_messages, 1):
            print(f"\n🧪 Test {i}: Testing Chat Interface with Event Request...")

            chat_data = {
                "message": message,
                "location": "Salt Lake City, UT",
                "interests": ["technology", "outdoor activities", "arts"]
            }

            print(f"💬 Message: {chat_data['message']}")
            print(f"📍 Location: {chat_data['location']}")
            print(f"🎯 Interests: {', '.join(chat_data['interests'])}")
    
        async with aiohttp.ClientSession() as session:
            try:
                # You'll need to add authentication headers here
                headers = {
                    'Content-Type': 'application/json',
                    # 'Authorization': 'Bearer your-token-here'  # Add if needed
                }

                async with session.post(url, json=chat_data, headers=headers) as response:
                    if response.status == 200:
                        result = await response.json()
                        print(f"\n✅ Chat Response:")
                        print(f"🤖 AI Response: {result.get('message', 'No response')}")

                        # Check if events were included
                        if 'events' in result:
                            print(f"\n📅 Events Found: {len(result['events'])}")
                            for event in result['events']:
                                print(f"   • {event['title']} - {event['date']}")

                        # Check for real-time data
                        if 'realtime_data' in result:
                            realtime = result['realtime_data']
                            if 'events' in realtime:
                                print(f"\n📅 Real-time Events Found: {len(realtime['events'])}")
                                for event in realtime['events']:
                                    print(f"   • {event['title']} - {event['date']} at {event['time']}")
                                    print(f"     Location: {event['location']}")
                                    print(f"     Free: {'Yes' if event.get('is_free') else 'No'}")

                        # Check if the message contains event information
                        message_text = result.get('message', '')
                        if 'events happening' in message_text.lower() or '•' in message_text:
                            print(f"\n📅 Events found in message text!")

                    else:
                        print(f"❌ Chat request failed with status {response.status}")
                        error_text = await response.text()
                        print(f"Error: {error_text}")

            except Exception as e:
                print(f"❌ Error testing chat: {e}")

            print("\n" + "="*50)

        print(f"\n🏁 Finished testing {endpoint_name}")
        print("="*80)

if __name__ == "__main__":
    asyncio.run(test_chat_events())
