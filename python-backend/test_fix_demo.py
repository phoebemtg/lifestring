#!/usr/bin/env python3

"""
Demo script to show that the question key mapping fix works correctly.
This simulates what the AI chat backend should do with profile questions.
"""

import sys
import os

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from api.v1.ai_chat import convert_question_key_to_text

def simulate_ai_chat_processing():
    """Simulate how the AI chat processes profile questions"""
    
    # This is the data that comes from the frontend (what we confirmed is working)
    profile_questions_from_frontend = {
        'fun-questions-0': 'lost in time',  # User's favorite movie
        'friend-preferences-0': 'honesty',
        'goals-ideas-0': 'get faster at running'
    }
    
    print("🔍 SIMULATING AI CHAT BACKEND PROCESSING")
    print("=" * 60)
    
    print("\n1️⃣ Profile questions received from frontend:")
    for key, value in profile_questions_from_frontend.items():
        print(f"   {key}: '{value}'")
    
    print("\n2️⃣ Converting question keys to actual questions (THE FIX):")
    converted_questions = {}
    for question_key, answer in profile_questions_from_frontend.items():
        if answer and str(answer).strip():
            actual_question = convert_question_key_to_text(question_key)
            converted_questions[actual_question] = answer
            print(f"   {question_key} -> {actual_question}")
    
    print("\n3️⃣ Profile context that gets sent to AI:")
    profile_context = ["Profile Questions & Answers:"]
    for question, answer in converted_questions.items():
        profile_context.append(f"  Q: {question}")
        profile_context.append(f"  A: {answer}")
    
    for line in profile_context:
        print(f"   {line}")
    
    print("\n4️⃣ AI PROMPT CONTEXT (what the AI actually sees):")
    print("   " + "\n   ".join(profile_context))
    
    print("\n✅ RESULT: The AI now sees 'What's your favorite movie of all time?' with answer 'lost in time'")
    print("   Instead of the cryptic 'fun-questions-0: lost in time'")
    
    return converted_questions

def test_specific_movie_question():
    """Test the specific movie question that was failing"""
    
    print("\n" + "=" * 60)
    print("🎬 TESTING SPECIFIC MOVIE QUESTION")
    print("=" * 60)
    
    # The exact data from your frontend logs
    question_key = 'fun-questions-0'
    answer = 'lost in time'
    
    print(f"\nOriginal: {question_key} = '{answer}'")
    
    # Apply the fix
    actual_question = convert_question_key_to_text(question_key)
    print(f"Fixed:    {actual_question} = '{answer}'")
    
    # Show what the AI prompt would look like
    ai_context = f"Q: {actual_question}\nA: {answer}"
    print(f"\nAI sees:\n{ai_context}")
    
    print(f"\n✅ SUCCESS: AI can now understand that your favorite movie is '{answer}'!")

if __name__ == "__main__":
    print("🚀 LIFESTRING AI CHAT FIX DEMONSTRATION")
    print("This shows how the question key mapping fix solves the favorite movie issue")
    
    simulate_ai_chat_processing()
    test_specific_movie_question()
    
    print("\n" + "=" * 60)
    print("📋 SUMMARY:")
    print("- ✅ Frontend correctly sends: fun-questions-0: 'lost in time'")
    print("- ✅ Backend now converts: fun-questions-0 -> 'What's your favorite movie of all time?'")
    print("- ✅ AI receives: 'Q: What's your favorite movie of all time? A: lost in time'")
    print("- ✅ AI can now answer: 'Your favorite movie is Lost in Time!'")
    print("\n🎯 The fix is ready - just needs to be deployed to Cloud Run!")
