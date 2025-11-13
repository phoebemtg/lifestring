#!/usr/bin/env python3
"""
Simple script to check existing joins in the database via API.
"""

import requests
import json

API_BASE = "https://lifestring-api-6946562411.us-central1.run.app/api"

def check_joins():
    """Check existing joins via API."""
    try:
        print("🔍 Checking existing joins in database...")
        
        # Get joins via API
        response = requests.get(f"{API_BASE}/joins")
        
        if response.status_code == 200:
            joins = response.json()
            print(f"✅ Found {len(joins)} joins in database:")
            
            for i, join in enumerate(joins, 1):
                print(f"\n{i}. {join.get('title', 'No title')}")
                print(f"   📍 {join.get('location', 'No location')}")
                print(f"   📅 {join.get('start_time', 'No date')}")
                if join.get('meta_data'):
                    meta = join['meta_data']
                    if isinstance(meta, str):
                        meta = json.loads(meta)
                    print(f"   🏷️  {meta.get('tags', 'No tags')}")
                    print(f"   💰 {meta.get('cost', 'No cost info')}")
                    print(f"   👥 Max: {meta.get('max_participants', 'No limit')}")
        else:
            print(f"❌ Error getting joins: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Error checking joins: {str(e)}")

def test_join_search():
    """Test join search functionality."""
    try:
        print("\n🔍 Testing join search...")
        
        search_terms = ["hiking", "cooking", "photography", "volleyball"]
        
        for term in search_terms:
            print(f"\n🔎 Searching for '{term}'...")
            response = requests.get(f"{API_BASE}/joins?search={term}")
            
            if response.status_code == 200:
                results = response.json()
                print(f"   ✅ Found {len(results)} results for '{term}'")
                for result in results[:2]:  # Show first 2 results
                    print(f"   - {result.get('title', 'No title')}")
            else:
                print(f"   ❌ Search failed: {response.status_code}")
                
    except Exception as e:
        print(f"❌ Error testing search: {str(e)}")

def test_ai_chat():
    """Test AI chat with join recommendations."""
    try:
        print("\n🤖 Testing AI chat for join recommendations...")
        
        test_messages = [
            "I want to go hiking this weekend",
            "Any cooking classes available?",
            "Looking for photography activities",
            "Beach volleyball games?"
        ]
        
        for message in test_messages:
            print(f"\n💬 Testing: '{message}'")
            response = requests.post(
                f"{API_BASE}/ai/lifestring-chat-public",
                json={"message": message},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                result = response.json()
                ai_response = result.get('message', 'No response')
                print(f"   🤖 AI: {ai_response[:100]}...")
            else:
                print(f"   ❌ AI chat failed: {response.status_code}")
                
    except Exception as e:
        print(f"❌ Error testing AI chat: {str(e)}")

if __name__ == "__main__":
    print("🚀 Lifestring Joins & AI Test")
    print("=" * 50)
    
    check_joins()
    test_join_search()
    test_ai_chat()
    
    print("\n✨ Test completed!")
