#!/usr/bin/env python3
"""
Quick test to verify both endpoints are working with events
"""
import asyncio
import aiohttp
import json

async def test_quick_events():
    """Quick test of both endpoints"""
    
    message = "What events are happening this weekend in Salt Lake City?"
    
    endpoints = [
        ("Test Endpoint", "http://localhost:8001/api/ai/lifestring-chat-test"),
        ("Public Endpoint", "http://localhost:8001/api/ai/lifestring-chat-public")
    ]
    
    chat_data = {
        "message": message,
        "location": "Salt Lake City, UT",
        "interests": ["technology", "outdoor activities", "arts"]
    }
    
    for endpoint_name, url in endpoints:
        print(f"\n🔗 Testing {endpoint_name}")
        print(f"💬 Message: {message}")
        
        async with aiohttp.ClientSession() as session:
            try:
                headers = {
                    'Content-Type': 'application/json',
                }
                
                async with session.post(url, json=chat_data, headers=headers) as response:
                    if response.status == 200:
                        result = await response.json()
                        response_text = result.get('message', 'No response')
                        
                        print(f"✅ Status: {response.status}")
                        print(f"📝 Response length: {len(response_text)} characters")
                        
                        # Check if events are included
                        if '•' in response_text and 'at' in response_text:
                            event_count = response_text.count('•')
                            print(f"📅 Events found: {event_count} events detected")
                        else:
                            print(f"❌ No events found in response")
                            
                    else:
                        print(f"❌ Status: {response.status}")
                        error_text = await response.text()
                        print(f"Error: {error_text}")
                        
            except Exception as e:
                print(f"❌ Error: {e}")
        
        print("="*50)

if __name__ == "__main__":
    asyncio.run(test_quick_events())
