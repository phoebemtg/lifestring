#!/usr/bin/env python3
"""
Script to clear all profile data from the database.
This will give you a fresh start on all devices.
"""
import sys
import os
sys.path.append('python-backend')

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import uuid

# Database URL (synchronous version)
DATABASE_URL = "postgresql://postgres.bkaiuwzwepdxdwhznwbt:9X+DwteUPtQ/zb7564GDDW/2ckm1rULgqxW0Cy6AaUUFhISQvVWFsqwUxls/XwzmkoZcGJRUd58vzFdqt+pIiw==@aws-0-us-west-1.pooler.supabase.com:6543/postgres"

def clear_profile_data():
    """Clear all profile data for Phoebe."""

    # Create synchronous engine
    engine = create_engine(DATABASE_URL)

    # Create session
    SessionLocal = sessionmaker(bind=engine)

    with SessionLocal() as session:
        try:
            user_id = "a90f0ea5-ba98-44f5-a3a7-a922db9e1523"

            print(f"🗑️  Clearing all profile data for user: {user_id}")

            # Clear detailed_profiles
            result1 = session.execute(
                text("DELETE FROM detailed_profiles WHERE user_id = :user_id"),
                {"user_id": user_id}
            )

            # Clear user_profiles
            result2 = session.execute(
                text("DELETE FROM user_profiles WHERE user_id = :user_id"),
                {"user_id": user_id}
            )

            # Clear any conversation/string data
            result3 = session.execute(
                text("DELETE FROM strings WHERE user_id = :user_id"),
                {"user_id": user_id}
            )

            session.commit()

            print("✅ Successfully cleared:")
            print(f"   - Detailed profiles: {result1.rowcount} rows")
            print(f"   - User profiles: {result2.rowcount} rows")
            print(f"   - Strings/conversations: {result3.rowcount} rows")
            print("\n🎯 Fresh start! All profile data cleared from database.")
            print("   This affects all devices - your boss's computer will also see a clean slate.")

        except Exception as e:
            print(f"❌ Error clearing profile data: {e}")
            session.rollback()
        finally:
            engine.dispose()

if __name__ == "__main__":
    clear_profile_data()
