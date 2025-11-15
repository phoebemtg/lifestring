#!/usr/bin/env python3
"""
Test script for web search functionality
"""
import asyncio
import sys
import os

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

# Import the service directly without config dependencies
from app.services.web_search_service import WebSearchService

async def test_web_search():
    """Test the web search service."""
    print("🔍 Testing Web Search Service...")

    # Create service instance
    web_search_service = WebSearchService()

    # Test NFL games search
    print("\n1. Testing NFL games search...")
    nfl_results = await web_search_service.search_events("NFL games today")
    print(f"Found {len(nfl_results)} NFL results:")
    for result in nfl_results:
        print(f"  - {result.get('title', 'No title')}")
        print(f"    {result.get('description', 'No description')[:100]}...")
        print(f"    Date: {result.get('date', 'No date')}")
        print(f"    URL: {result.get('url', 'No URL')}")
        print()
    
    # Test NBA games search
    print("\n2. Testing NBA games search...")
    nba_results = await web_search_service.search_events("NBA games tonight")
    print(f"Found {len(nba_results)} NBA results:")
    for result in nba_results:
        print(f"  - {result.get('title', 'No title')}")
        print(f"    {result.get('description', 'No description')[:100]}...")
        print()
    
    # Test general search
    print("\n3. Testing general search...")
    general_results = await web_search_service.search_events("what time is it")
    print(f"Found {len(general_results)} general results:")
    for result in general_results:
        print(f"  - {result.get('title', 'No title')}")
        print(f"    {result.get('description', 'No description')[:100]}...")
        print()
    
    # Close the service
    await web_search_service.close()
    print("✅ Web search test completed!")

if __name__ == "__main__":
    asyncio.run(test_web_search())
