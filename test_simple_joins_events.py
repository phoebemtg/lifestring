#!/usr/bin/env python3
"""
Simple test to show when joins vs events appear
"""
import asyncio
import aiohttp
import json

async def test_simple():
    """Test specific queries to show the difference"""
    
    tests = [
        {
            "name": "🎪 TIME-SPECIFIC (should show EVENTS only)",
            "query": "What events are happening this weekend in Salt Lake City?",
            "expected": "events"
        },
        {
            "name": "🤝 GROUP REQUEST (should show JOINS)",
            "query": "I want to find hiking groups in Salt Lake City",
            "expected": "joins"
        },
        {
            "name": "🔄 GENERAL ACTIVITY (might show both)",
            "query": "What activities are available in Salt Lake City?",
            "expected": "both"
        }
    ]
    
    url = "http://localhost:8001/api/ai/lifestring-chat-test"
    
    for test in tests:
        print(f"\n{test['name']}")
        print(f"💬 Query: {test['query']}")
        print(f"🎯 Expected: {test['expected']}")
        print("-" * 50)
        
        chat_data = {
            "message": test['query'],
            "location": "Salt Lake City, UT",
            "interests": ["hiking", "climbing", "outdoor activities"]
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                headers = {'Content-Type': 'application/json'}
                
                async with session.post(url, json=chat_data, headers=headers) as response:
                    if response.status == 200:
                        result = await response.json()
                        response_text = result.get('message', '')
                        
                        # Check for events (bullet points with times)
                        has_events = '•' in response_text and 'at' in response_text
                        event_count = response_text.count('•') if has_events else 0
                        
                        # Check for joins in response
                        has_joins = 'suggested_joins' in result and len(result.get('suggested_joins', [])) > 0
                        join_count = len(result.get('suggested_joins', []))
                        
                        # Check for join-related language
                        join_words = ['join', 'group', 'meetup', 'partners', 'community', 'club']
                        join_language = sum(1 for word in join_words if word in response_text.lower())
                        
                        print(f"✅ Response received ({len(response_text)} chars)")
                        print(f"📅 Events detected: {event_count}")
                        print(f"🤝 Joins in response: {join_count}")
                        print(f"💬 Join-related words: {join_language}")
                        
                        # Show first 200 chars of response
                        preview = response_text[:200] + "..." if len(response_text) > 200 else response_text
                        print(f"📝 Response preview: {preview}")
                        
                    else:
                        print(f"❌ Error: {response.status}")
                        
            except Exception as e:
                print(f"❌ Exception: {e}")
        
        print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_simple())
