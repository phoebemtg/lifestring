#!/usr/bin/env python3
"""
Script to add user profile data to the database.
"""
import asyncio
import sys
import os
sys.path.append('python-backend')

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.models.user import DetailedProfile
import uuid

# Database URL
DATABASE_URL = "postgresql+asyncpg://postgres.bkaiuwzwepdxdwhznwbt:9X+DwteUPtQ/zb7564GDDW/2ckm1rULgqxW0Cy6AaUUFhISQvVWFsqwUxls/XwzmkoZcGJRUd58vzFdqt+pIiw==@aws-0-us-west-1.pooler.supabase.com:6543/postgres"

async def add_profile():
    """Add profile data for Phoebe."""
    
    # Create async engine
    engine = create_async_engine(DATABASE_URL)
    
    # Create session
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        try:
            # Check if profile already exists
            user_id = uuid.UUID("a90f0ea5-ba98-44f5-a3a7-a922db9e1523")
            
            # Create or update profile
            profile = DetailedProfile(
                user_id=user_id,
                bio="I love climbing",
                email="ptroupgalligan@gmail.com",
                interests=["climbing"],
                passions=["climbing"],
                hobbies=["climbing"]
            )
            
            # Add to session
            session.add(profile)
            await session.commit()
            
            print("✅ Profile added successfully!")
            print(f"User ID: {user_id}")
            print(f"Interests: {profile.interests}")
            print(f"Passions: {profile.passions}")
            print(f"Bio: {profile.bio}")
            
        except Exception as e:
            print(f"❌ Error adding profile: {e}")
            await session.rollback()
        finally:
            await engine.dispose()

if __name__ == "__main__":
    asyncio.run(add_profile())
