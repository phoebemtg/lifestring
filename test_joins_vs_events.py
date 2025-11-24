#!/usr/bin/env python3
"""
Test when the AI shows JOINS vs EVENTS
"""
import asyncio
import aiohttp
import json

async def test_joins_vs_events():
    """Test different query types to see when joins vs events are shown"""
    
    # Test queries that should show EVENTS ONLY (time-specific)
    event_queries = [
        "What events are happening today in Salt Lake City?",
        "What can I do this weekend in Salt Lake City?",
        "What's happening tomorrow in Salt Lake City?",
        "Show me events tonight in Salt Lake City"
    ]
    
    # Test queries that should show JOINS (group activities)
    join_queries = [
        "I want to find hiking groups in Salt Lake City",
        "Looking for climbing partners in Salt Lake City", 
        "I'm interested in joining cooking classes",
        "Help me find group activities in Salt Lake City",
        "I want to join a meetup in Salt Lake City"
    ]
    
    # Test queries that might show BOTH
    mixed_queries = [
        "What activities are available in Salt Lake City?",
        "I'm looking for things to do in Salt Lake City",
        "Help me find activities in Salt Lake City"
    ]
    
    url = "http://localhost:8001/api/ai/lifestring-chat-test"
    
    all_tests = [
        ("🎪 EVENT QUERIES (should show events)", event_queries),
        ("🤝 JOIN QUERIES (should show joins)", join_queries), 
        ("🔄 MIXED QUERIES (might show both)", mixed_queries)
    ]
    
    for category, queries in all_tests:
        print(f"\n{category}")
        print("="*60)
        
        for query in queries:
            print(f"\n💬 Query: {query}")
            
            chat_data = {
                "message": query,
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
                            
                            # Check for joins (structured join data)
                            has_joins = 'suggested_joins' in result and len(result.get('suggested_joins', [])) > 0
                            join_count = len(result.get('suggested_joins', []))
                            
                            # Check response content for join-like language
                            join_language = any(word in response_text.lower() for word in [
                                'join', 'group', 'meetup', 'partners', 'community', 'club'
                            ])
                            
                            print(f"  📅 Events: {'✅' if has_events else '❌'} ({event_count} found)")
                            print(f"  🤝 Joins: {'✅' if has_joins else '❌'} ({join_count} found)")
                            print(f"  💬 Join Language: {'✅' if join_language else '❌'}")
                            print(f"  📝 Response Length: {len(response_text)} chars")
                            
                        else:
                            print(f"  ❌ Error: {response.status}")
                            
                except Exception as e:
                    print(f"  ❌ Exception: {e}")
            
            print("-" * 40)

if __name__ == "__main__":
    asyncio.run(test_joins_vs_events())
