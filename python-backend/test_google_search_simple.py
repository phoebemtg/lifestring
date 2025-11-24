#!/usr/bin/env python3

import os
import google.generativeai as genai
from app.core.config import settings

# Configure the API key
genai.configure(api_key=settings.GOOGLE_API_KEY)

def test_google_search():
    """Test Google Search grounding with different configurations."""

    print("Testing Google Search grounding...")

    # First, list available models
    try:
        print("\n=== Available Models ===")
        models = genai.list_models()
        for model in models:
            if 'gemini' in model.name.lower():
                print(f"- {model.name}")
    except Exception as e:
        print(f"Failed to list models: {e}")

    # Test 1: Try with code_execution tool (known to work)
    try:
        print("\n=== Test 1: Code execution tool (baseline) ===")
        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash-exp",
            tools=["code_execution"]
        )

        response = model.generate_content("Calculate 2+2")
        print("SUCCESS: Code execution tool works!")
        print(f"Response: {response.text[:200]}...")

    except Exception as e:
        print(f"FAILED: Code execution tool - {e}")

    # Test 2: Try google_search_retrieval with gemini-2.5-flash
    try:
        print("\n=== Test 2: google_search_retrieval with gemini-2.5-flash ===")
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            tools=[{"google_search_retrieval": {}}]
        )

        response = model.generate_content("What events are happening this weekend in San Francisco?")
        print("SUCCESS: google_search_retrieval works!")
        print(f"Response: {response.text[:200]}...")
        return True

    except Exception as e:
        print(f"FAILED: google_search_retrieval - {e}")

    # Test 3: Try different syntax
    try:
        print("\n=== Test 3: Different syntax ===")
        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash-exp"
        )

        # Try passing tools in generate_content
        response = model.generate_content(
            "What events are happening this weekend in San Francisco?",
            tools=[{"google_search_retrieval": {}}]
        )
        print("SUCCESS: Different syntax works!")
        print(f"Response: {response.text[:200]}...")
        return True

    except Exception as e:
        print(f"FAILED: Different syntax - {e}")

    return False

if __name__ == "__main__":
    test_google_search()
