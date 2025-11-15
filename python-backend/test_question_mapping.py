#!/usr/bin/env python3

"""
Test script to verify the question key mapping function works correctly.
"""

import sys
import os

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from api.v1.ai_chat import convert_question_key_to_text

def test_question_mapping():
    """Test the convert_question_key_to_text function"""
    
    # Test cases
    test_cases = [
        ('fun-questions-0', "What's your favorite movie of all time?"),
        ('fun-questions-1', "What's your favorite book?"),
        ('friend-preferences-0', "What qualities do you value most in a friend?"),
        ('goals-ideas-0', "What's a goal you're working towards?"),
        ('personal-questions-0', "What's something you're passionate about?"),
        ('invalid-key', 'invalid-key'),  # Should return original key
        ('fun-questions-999', 'fun-questions-999'),  # Out of range, should return original
    ]
    
    print("Testing question key mapping function...")
    print("=" * 50)
    
    all_passed = True
    
    for question_key, expected in test_cases:
        result = convert_question_key_to_text(question_key)
        passed = result == expected
        all_passed = all_passed and passed
        
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} | {question_key} -> {result}")
        if not passed:
            print(f"      Expected: {expected}")
    
    print("=" * 50)
    if all_passed:
        print("🎉 All tests passed!")
    else:
        print("❌ Some tests failed!")
    
    return all_passed

if __name__ == "__main__":
    success = test_question_mapping()
    sys.exit(0 if success else 1)
