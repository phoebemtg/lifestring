#!/usr/bin/env python3
"""
Test script to check if the application can start without errors.
"""
import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def test_imports():
    """Test if all imports work correctly."""
    try:
        print("Testing imports...")
        
        # Test core imports
        from app.core.config import settings
        print(f"✅ Config loaded: {settings.APP_NAME}")
        
        # Test database
        from app.core.database import engine, Base
        print("✅ Database imports successful")
        
        # Test API imports
        from app.api.v1 import users, strings, rooms, messages, events, ai_chat, connections, auth, joins
        print("✅ API imports successful")
        
        # Test main app
        from app.main import app
        print("✅ Main app import successful")
        
        print("\n🎉 All imports successful!")
        return True
        
    except Exception as e:
        print(f"❌ Import error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_app_creation():
    """Test if the FastAPI app can be created."""
    try:
        print("\nTesting app creation...")
        from app.main import app
        
        # Check if app has routes
        routes = [route.path for route in app.routes]
        print(f"✅ App created with {len(routes)} routes")
        print(f"Sample routes: {routes[:5]}")
        
        return True
        
    except Exception as e:
        print(f"❌ App creation error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🔍 Testing Lifestring API startup...")
    
    success = True
    success &= test_imports()
    success &= test_app_creation()
    
    if success:
        print("\n✅ All tests passed! App should start successfully.")
        sys.exit(0)
    else:
        print("\n❌ Tests failed! Check errors above.")
        sys.exit(1)
