#!/usr/bin/env python3
"""
Script to clear ALL user data from the database.
This will reset the entire application for all users.
"""
import sys
import os
sys.path.append('python-backend')

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import uuid

# Database URL (synchronous version)
DATABASE_URL = "postgresql://postgres.bkaiuwzwepdxdwhznwbt:9X+DwteUPtQ/zb7564GDDW/2ckm1rULgqxW0Cy6AaUUFhISQvVWFsqwUxls/XwzmkoZcGJRUd58vzFdqt+pIiw==@aws-0-us-west-1.pooler.supabase.com:6543/postgres"

def clear_all_database_data():
    """Clear ALL user data from the database - complete reset."""
    
    # Create synchronous engine
    engine = create_engine(DATABASE_URL)
    
    # Create session
    SessionLocal = sessionmaker(bind=engine)
    
    with SessionLocal() as session:
        try:
            print("🗑️  CLEARING ALL DATABASE DATA - COMPLETE RESET")
            print("=" * 60)
            
            # Clear all user-generated content tables
            tables_to_clear = [
                'strings',
                'detailed_profiles', 
                'user_profiles',
                'conversations',
                'messages',
                'connections',
                'user_enneagrams',
                'house_events',
                'house_competitions'
            ]
            
            total_cleared = 0
            
            for table in tables_to_clear:
                try:
                    # Get count before deletion
                    count_result = session.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    count = count_result.scalar()
                    
                    if count > 0:
                        # Clear the table
                        result = session.execute(text(f"DELETE FROM {table}"))
                        cleared = result.rowcount
                        total_cleared += cleared
                        print(f"✅ {table}: {cleared} rows cleared")
                    else:
                        print(f"⚪ {table}: already empty")
                        
                except Exception as e:
                    print(f"⚠️  {table}: {str(e)}")
            
            # Reset sequences/auto-increment counters if needed
            try:
                # Reset any sequences that might exist
                session.execute(text("SELECT setval(pg_get_serial_sequence('user_profiles', 'id'), 1, false) WHERE pg_get_serial_sequence('user_profiles', 'id') IS NOT NULL"))
                print("✅ Reset sequences")
            except Exception as e:
                print(f"⚠️  Sequence reset: {str(e)}")
            
            session.commit()
            
            print("=" * 60)
            print(f"🎯 COMPLETE DATABASE RESET SUCCESSFUL!")
            print(f"   Total rows cleared: {total_cleared}")
            print("   All user accounts and data have been removed.")
            print("   The application is now in a fresh state.")
            print("   Users will need to sign up again.")
            
        except Exception as e:
            print(f"❌ Error clearing database: {e}")
            session.rollback()
        finally:
            engine.dispose()

def confirm_reset():
    """Ask for confirmation before proceeding with the reset."""
    print("⚠️  WARNING: COMPLETE DATABASE RESET")
    print("=" * 50)
    print("This will permanently delete:")
    print("• All user accounts and profiles")
    print("• All strings/posts")
    print("• All conversations and messages") 
    print("• All connections between users")
    print("• All events and competitions")
    print("• ALL user-generated content")
    print("=" * 50)
    print("This action CANNOT be undone!")
    print()
    
    response = input("Type 'RESET ALL DATA' to confirm: ")
    
    if response == "RESET ALL DATA":
        return True
    else:
        print("❌ Reset cancelled. Database unchanged.")
        return False

if __name__ == "__main__":
    if confirm_reset():
        clear_all_database_data()
    else:
        print("Exiting without changes.")
