#!/usr/bin/env python3
"""
Test Google Grounding API functionality.
Run this after enabling billing on Google Cloud.
"""

import os
import sys
import asyncio
from pathlib import Path

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent / "app"))

from app.services.gemini_service import gemini_service

async def test_google_grounding():
    """Test Google Grounding with a real-time query."""
    
    print("🧪 Testing Google Grounding API...")
    print("=" * 50)
    
    if not gemini_service.enabled:
        print("❌ Gemini service not enabled - check your API key")
        return
    
    # Test queries that require real-time web search
    test_queries = [
        "What is the current weather in San Francisco?",
        "What events are happening this weekend in San Francisco?", 
        "What is the latest news about AI today?",
        "What time is it right now in New York?"
    ]
    
    for i, query in enumerate(test_queries, 1):
        print(f"\n🔍 Test {i}: {query}")
        print("-" * 40)
        
        try:
            # Test with grounding enabled
            messages = [
                {"role": "user", "content": query}
            ]
            
            response = await gemini_service.chat_completion(
                messages=messages,
                model="gemini-2.0-flash",
                temperature=0.7,
                max_tokens=300,
                use_search=True  # Enable Google Grounding
            )
            
            print(f"✅ Response: {response['content'][:200]}...")
            print(f"💰 Cost: ${response.get('cost', 0):.4f}")
            print(f"🔧 Model: {response.get('model', 'unknown')}")
            
        except Exception as e:
            print(f"❌ Error: {e}")
            if "billing" in str(e).lower() or "quota" in str(e).lower():
                print("💳 This likely means billing is not enabled on your Google Cloud account")
                print("🔗 Enable billing at: https://console.cloud.google.com/billing")
                break
    
    print("\n" + "=" * 50)
    print("🎯 If you see successful responses above, Google Grounding is working!")
    print("💡 If you see billing errors, enable billing in Google Cloud Console")

if __name__ == "__main__":
    asyncio.run(test_google_grounding())
