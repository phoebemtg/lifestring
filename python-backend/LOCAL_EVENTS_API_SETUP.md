# Enhanced Local Events API Setup

The Lifestring AI now supports comprehensive local events from multiple sources! Here's how to set up API keys for maximum functionality.

## 🎯 Current Status

✅ **Working Now (No API Keys Required):**
- Real-time sports events (NBA, NFL, NHL, MLB) via ESPN API
- Curated local events for Salt Lake City and San Francisco
- Location-aware event recommendations
- Time zone-aware responses

## 🔑 Optional API Keys for Enhanced Functionality

Add these environment variables to your `.env` file for expanded event coverage:

### 1. Eventbrite API (Free Tier Available)
```bash
EVENTBRITE_API_KEY=your_eventbrite_token_here
```
- **What it provides:** Community events, workshops, meetups, concerts
- **How to get:** https://www.eventbrite.com/platform/api
- **Free tier:** 1,000 requests/day

### 2. Ticketmaster Discovery API (Free Tier Available)
```bash
TICKETMASTER_API_KEY=your_ticketmaster_api_key_here
```
- **What it provides:** Concerts, theater shows, major events
- **How to get:** https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
- **Free tier:** 5,000 requests/day

### 3. Google Places API (Optional)
```bash
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
```
- **What it provides:** Local business events, venue information
- **How to get:** https://developers.google.com/maps/documentation/places/web-service
- **Pricing:** Pay-per-use with free monthly credits

## 🧪 Testing the Enhanced Functionality

### Test Queries to Try:

**Sports Events:**
- "What NBA games are happening today?"
- "Are there any football games tonight?"
- "Show me current sports events"

**Local Events:**
- "What events are happening in Salt Lake City today?"
- "Are there any concerts in San Francisco this week?"
- "What's happening in my area?"
- "Show me local festivals and activities"

**Location-Specific:**
- "What can I do in Salt Lake City this weekend?"
- "Events near me in Utah"
- "Things to do in the Bay Area"

## 🏗️ Architecture

The system uses a multi-source approach:

1. **ESPN API** → Real-time sports data
2. **Eventbrite API** → Community events and workshops  
3. **Ticketmaster API** → Major concerts and shows
4. **Curated Events** → Location-specific recurring events
5. **Fallback System** → Graceful degradation when APIs are unavailable

## 📍 Supported Locations

**Full Support (Curated Events):**
- Salt Lake City, Utah
- San Francisco, California
- Berkeley, California

**API Support (with API keys):**
- Any major US city
- International cities (varies by API)

**Fallback Support:**
- All locations with helpful guidance

## 🔄 How It Works

1. User asks about events
2. System detects location from message or user profile
3. Queries multiple APIs in parallel
4. Deduplicates and sorts results
5. Returns comprehensive event list
6. Gracefully handles API failures

The system is designed to work great even without API keys, and gets better with each API you add!
