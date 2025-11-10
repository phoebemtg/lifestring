"""
API dependencies for authentication and database access.
"""
from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_user_id_from_token
from app.models.user import User

# Security scheme for Swagger UI
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token.

    Usage:
        @app.get("/me")
        def get_me(current_user: User = Depends(get_current_user)):
            return current_user

    Args:
        credentials: HTTP Bearer token
        db: Database session

    Returns:
        Current user object

    Raises:
        HTTPException: If user not found or token invalid
    """
    try:
        token = credentials.credentials
        user_id = get_user_id_from_token(token)

        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            # Auto-create user profile if it doesn't exist
            print(f"Creating missing user profile for user_id: {user_id}")
            user = User(
                user_id=user_id,
                contact_info={
                    "name": "User",
                    "email": ""
                },
                social_links={},
                attributes={
                    "interests": [],
                    "passions": []
                },
                biography={},
                meta={}
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Created user profile: {user}")

        return user
    except Exception as e:
        # Log the authentication error for debugging
        print(f"Authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current active user (can add additional checks here).
    
    Args:
        current_user: Current user from get_current_user
        
    Returns:
        Current user if active
        
    Raises:
        HTTPException: If user is inactive
    """
    # Add any additional checks here (e.g., is_active, is_banned, etc.)
    return current_user


def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current user and verify they are an admin.
    
    Args:
        current_user: Current user from get_current_user
        
    Returns:
        Current user if admin
        
    Raises:
        HTTPException: If user is not admin
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

