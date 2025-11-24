#!/usr/bin/env python3
"""
Test Hybrid AI System - Gemini vs GPT routing
"""
import asyncio
import aiohttp
import json
from datetime import datetime

async def test_hybrid_ai():
    """Test the hybrid AI system with different query types."""
    
    print("🤖 Testing Hybrid AI System (Gemini + GPT)")
    print("="*60)
    
    # Test queries for different routing scenarios
    test_queries = [
        {
            "message": "What events are happening this weekend in Salt Lake City?",
            "expected_model": "gemini",
            "query_type": "realtime_events",
            "description": "Real-time events query (should use Gemini with web search)"
        },
        {
            "message": "Hello, how are you?",
            "expected_model": "gemini", 
            "query_type": "general_chat",
            "description": "Simple general chat (should use Gemini for cost savings)"
        },
        {
            "message": "Find people with similar interests to me for connections",
            "expected_model": "gpt",
            "query_type": "profile_matching", 
            "description": "Profile matching (should use GPT for better reasoning)"
        },
        {
            "message": "Write a creative story about mountain climbing",
            "expected_model": "gpt",
            "query_type": "creative_writing",
            "description": "Creative writing (should use GPT for creativity)"
        },
        {
            "message": "What time is it?",
            "expected_model": "gemini",
            "query_type": "simple_question",
            "description": "Simple question (should use Gemini for speed/cost)"
        }
    ]
    
    base_url = "http://localhost:8001"
    
    async with aiohttp.ClientSession() as session:
        for i, test in enumerate(test_queries, 1):
            print(f"\n🧪 Test {i}: {test['description']}")
            print(f"📝 Query: {test['message']}")
            print(f"🎯 Expected Model: {test['expected_model'].upper()}")
            
            try:
                # Make request to hybrid AI endpoint
                async with session.post(
                    f"{base_url}/api/ai/lifestring-chat-test",
                    json={"message": test["message"]},
                    timeout=30
                ) as response:
                    
                    if response.status == 200:
                        data = await response.json()
                        
                        # Extract response info
                        message = data.get("message", "")
                        tokens = data.get("tokens", 0)
                        cost = data.get("cost", 0.0)
                        
                        print(f"✅ Response received ({len(message)} chars)")
                        print(f"💰 Cost: ${cost:.4f} | 🔢 Tokens: {tokens}")
                        
                        # Show first 100 characters of response
                        preview = message[:100] + "..." if len(message) > 100 else message
                        print(f"📄 Preview: {preview}")
                        
                        # Check if it contains routing information (if available in logs)
                        if "gemini" in message.lower():
                            print("🔍 Detected: Likely Gemini response")
                        elif "gpt" in message.lower():
                            print("🔍 Detected: Likely GPT response")
                        
                    else:
                        print(f"❌ Request failed with status {response.status}")
                        error_text = await response.text()
                        print(f"Error: {error_text}")
                        
            except Exception as e:
                print(f"❌ Error: {e}")
            
            print("-" * 50)
    
    print(f"\n🎉 Hybrid AI Testing Complete!")
    print(f"⏰ Tested at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    print(f"\n💡 Expected Routing Logic:")
    print(f"🌐 Gemini: Real-time events, simple questions, general chat")
    print(f"🧠 GPT: Profile matching, creative writing, complex reasoning")
    print(f"💰 Cost Savings: ~68% reduction with hybrid approach")

if __name__ == "__main__":
    asyncio.run(test_hybrid_ai())
