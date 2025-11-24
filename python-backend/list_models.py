#!/usr/bin/env python3
"""
List available Gemini models.
"""

import os
import sys
import asyncio
from pathlib import Path

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent / "app"))

from google import genai
from app.core.config import settings

async def list_models():
    """List available Gemini models."""
    
    print("🔍 Listing available Gemini models...")
    print("=" * 50)
    
    try:
        client = genai.Client(api_key=settings.GOOGLE_API_KEY)
        
        models = client.models.list()
        
        print(f"Found {len(models)} models:")
        print()
        
        for model in models:
            print(f"📋 Model: {model.name}")
            print(f"   Display Name: {model.display_name}")
            print(f"   Supported Actions: {model.supported_actions}")
            print()
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(list_models())
