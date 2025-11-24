#!/usr/bin/env python3
"""
Test web browsing capability like ChatGPT Online
"""
import asyncio
import aiohttp
from bs4 import BeautifulSoup
import re
from datetime import datetime, timedelta

async def scrape_real_events():
    """Scrape real events like ChatGPT Online does"""
    
    print("🌐 Testing Web Browsing Like ChatGPT Online")
    print("="*50)
    
    events = []
    
    async with aiohttp.ClientSession() as session:
        # Try multiple event websites
        sites = [
            {
                'url': 'https://www.eventbrite.com/d/ut--salt-lake-city/events/',
                'name': 'Eventbrite'
            },
            {
                'url': 'https://www.timeout.com/salt-lake-city/things-to-do/events-this-weekend',
                'name': 'TimeOut'
            }
        ]
        
        for site in sites:
            try:
                print(f"🔍 Browsing {site['name']}: {site['url']}")
                
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                }
                
                async with session.get(site['url'], headers=headers, timeout=10) as response:
                    if response.status == 200:
                        html = await response.text()
                        print(f"✅ Successfully loaded {site['name']} ({len(html)} chars)")
                        
                        # Parse HTML like ChatGPT would
                        soup = BeautifulSoup(html, 'html.parser')
                        
                        if 'eventbrite' in site['url']:
                            # Look for event titles and dates
                            event_cards = soup.find_all(['div', 'article'], class_=re.compile(r'event|card'))
                            print(f"📅 Found {len(event_cards)} potential event elements")
                            
                            for card in event_cards[:3]:  # Limit to first 3
                                title_elem = card.find(['h1', 'h2', 'h3', 'h4'], string=re.compile(r'.+'))
                                if title_elem and len(title_elem.get_text().strip()) > 5:
                                    events.append({
                                        'title': title_elem.get_text().strip()[:100],
                                        'source': site['name'],
                                        'url': site['url']
                                    })
                        
                        elif 'timeout' in site['url']:
                            # Look for TimeOut event structure
                            event_links = soup.find_all('a', href=re.compile(r'/events/'))
                            print(f"🎯 Found {len(event_links)} event links")
                            
                            for link in event_links[:3]:
                                title = link.get_text().strip()
                                if title and len(title) > 5:
                                    events.append({
                                        'title': title[:100],
                                        'source': site['name'],
                                        'url': site['url']
                                    })
                    
                    else:
                        print(f"❌ {site['name']} returned status {response.status}")
                        
            except Exception as e:
                print(f"❌ Error browsing {site['name']}: {e}")
    
    print(f"\n🎉 Web Browsing Results:")
    print(f"📊 Found {len(events)} real events")
    
    for i, event in enumerate(events, 1):
        print(f"{i}. {event['title']} (from {event['source']})")
    
    return events

if __name__ == "__main__":
    asyncio.run(scrape_real_events())
