"""
Security utilities for JWT token verification and authentication.
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
import json
import base64
from jwt.exceptions import PyJWTError as JWTError
from fastapi import HTTPException, status

from app.core.config import settings


def verify_supabase_token(token: str) -> Dict[str, Any]:
    """
    Verify Supabase JWT token without signature verification.
    This is a temporary workaround for JWT secret issues.

    Args:
        token: JWT token from Authorization header

    Returns:
        Decoded token payload

    Raises:
        HTTPException: If token is invalid
    """
    try:
        print(f"🔍 DEBUGGING: Starting JWT verification for token: {token[:20]}...")
        print(f"🔍 DEBUGGING: Using manual JWT decoding approach")

        # Manual JWT payload extraction without verification
        # Split the JWT token into its parts
        parts = token.split('.')
        if len(parts) != 3:
            print(f"Invalid JWT format: {len(parts)} parts instead of 3")
            raise JWTError("Invalid JWT format")

        print(f"🔍 DEBUGGING: JWT has {len(parts)} parts, proceeding with manual decode")

        # Decode the payload (second part)
        payload_part = parts[1]
        # Add padding if needed for base64 decoding
        payload_part += '=' * (4 - len(payload_part) % 4)

        # Decode base64 and parse JSON
        payload_bytes = base64.urlsafe_b64decode(payload_part)
        payload = json.loads(payload_bytes.decode('utf-8'))

        # Basic validation - check if token has required fields
        if not payload.get("sub"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Check if token is expired
        import time
        if payload.get("exp") and payload["exp"] < time.time():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return payload

    except JWTError as e:
        print(f"JWT Error: {e}")
        print(f"JWT Error type: {type(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR in verify_supabase_token: {e}")
        print(f"❌ ERROR TYPE: {type(e)}")
        print(f"❌ ERROR MODULE: {type(e).__module__}")
        import traceback
        print(f"❌ FULL TRACEBACK:")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_user_id_from_token(token: str) -> str:
    """
    Extract user_id from JWT token.

    Args:
        token: JWT token

    Returns:
        User ID (UUID string)
    """
    print(f"🔍 DEBUGGING: get_user_id_from_token called with token: {token[:20]}...")
    try:
        payload = verify_supabase_token(token)
        print(f"🔍 DEBUGGING: verify_supabase_token returned payload: {payload}")
        user_id: str = payload.get("sub")
        if user_id is None:
            print(f"🔍 DEBUGGING: No 'sub' field in payload")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )
        print(f"🔍 DEBUGGING: Extracted user_id: {user_id}")
        return user_id
    except Exception as e:
        print(f"❌ ERROR in get_user_id_from_token: {e}")
        print(f"❌ ERROR TYPE: {type(e)}")
        raise


def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a new JWT access token.
    
    Args:
        data: Data to encode in token
        expires_delta: Token expiration time
        
    Returns:
        Encoded JWT token
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt

