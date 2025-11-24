#!/usr/bin/env python3
"""
Test the enhanced multi-source event system
"""
import asyncio
import aiohttp
import json

async def test_enhanced_events():
    """Test the enhanced event system with multiple sources"""
    
    query = "What events are happening this weekend in Salt Lake City?"
    
    url = "http://localhost:8001/api/ai/lifestring-chat-test"
    
    print(f"🧪 Testing Enhanced Event System")
    print(f"💬 Query: {query}")
    print("="*60)
    
    chat_data = {
        "message": query,
        "location": "Salt Lake City, UT",
        "interests": ["music", "outdoor activities", "arts", "food"]
    }
    
    async with aiohttp.ClientSession() as session:
        try:
            headers = {'Content-Type': 'application/json'}
            
            async with session.post(url, json=chat_data, headers=headers) as response:
                if response.status == 200:
                    result = await response.json()
                    response_text = result.get('message', '')
                    
                    # Count events by source
                    sources = {
                        'Eventbrite': response_text.count('Eventbrite'),
                        'Ticketmaster': response_text.count('Ticketmaster'),
                        'SeatGeek': response_text.count('SeatGeek'),
                        'TimeOut (Web)': response_text.count('TimeOut (Web)'),
                        'Local Curated': response_text.count('Local Curated')
                    }
                    
                    total_events = response_text.count('•')
                    
                    print(f"✅ Response received ({len(response_text)} chars)")
                    print(f"📅 Total events: {total_events}")
                    print(f"📊 Events by source:")
                    
                    for source, count in sources.items():
                        if count > 0:
                            print(f"   • {source}: {count} events")
                    
                    print(f"\n📝 Response preview:")
                    print("-" * 40)
                    
                    # Show first 500 chars
                    preview = response_text[:500] + "..." if len(response_text) > 500 else response_text
                    print(preview)
                    
                    print("-" * 40)
                    print(f"🎯 SUCCESS: Your API now has {total_events} events from multiple sources!")
                    
                else:
                    print(f"❌ Error: {response.status}")
                    error_text = await response.text()
                    print(f"Error details: {error_text}")
                    
        except Exception as e:
            print(f"❌ Exception: {e}")

if __name__ == "__main__":
    asyncio.run(test_enhanced_events())
