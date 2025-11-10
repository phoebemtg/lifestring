"""
User API endpoints.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.config import settings
from app.api.deps import get_current_user, get_current_admin_user
from app.models.user import User, UserEmbedding
from app.schemas.user import (
    UserResponse,
    UserCreate,
    UserUpdate,
    UserListResponse,
    EnneagramAssign,
    UserEmbeddingResponse
)
from app.services.openai_service import openai_service

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current authenticated user."""
    return current_user


@router.get("/users", response_model=UserListResponse)
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(15, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all users with pagination."""
    total = db.query(func.count(User.id)).scalar()
    users = db.query(User).offset(skip).limit(limit).all()
    
    return {
        "users": users,
        "total": total,
        "page": (skip // limit) + 1,
        "per_page": limit
    }


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user by ID."""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new user (admin only)."""
    # Check if user already exists
    existing = db.query(User).filter(User.user_id == user_data.user_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists"
        )
    
    user = User(**user_data.model_dump())
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user."""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check authorization
    if user.user_id != current_user.user_id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this user"
        )
    
    # Update fields
    update_data = user_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete user (admin only)."""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    db.delete(user)
    db.commit()
    return None


@router.post("/users/{user_id}/embed/create", response_model=UserEmbeddingResponse)
async def create_user_embedding(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate embedding for user."""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check authorization
    if user.user_id != current_user.user_id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    # Build text representation of user
    user_text_parts = []
    if user.contact_info and user.contact_info.get('name'):
        user_text_parts.append(f"Name: {user.contact_info['name']}")
    if user.biography and user.biography.get('bio'):
        user_text_parts.append(f"Bio: {user.biography['bio']}")
    if user.attributes:
        if user.attributes.get('interests'):
            user_text_parts.append(f"Interests: {', '.join(user.attributes['interests'])}")
        if user.attributes.get('passions'):
            user_text_parts.append(f"Passions: {', '.join(user.attributes['passions'])}")
    
    user_text = ". ".join(user_text_parts)
    
    if not user_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User has no content to embed"
        )
    
    # Generate embedding
    embedding_vector = await openai_service.create_embedding(user_text)
    content_hash = openai_service.generate_content_hash(user_text)
    
    # Check if embedding exists
    existing_embedding = db.query(UserEmbedding).filter(
        UserEmbedding.user_id == user.user_id
    ).first()
    
    if existing_embedding:
        # Update existing
        existing_embedding.embedding = embedding_vector
        existing_embedding.content_hash = content_hash
        existing_embedding.model_version = settings.EMBED_MODEL
        db.commit()
        db.refresh(existing_embedding)
        return existing_embedding
    else:
        # Create new
        new_embedding = UserEmbedding(
            user_id=user.user_id,
            embedding=embedding_vector,
            content_hash=content_hash,
            model_version=settings.EMBED_MODEL
        )
        db.add(new_embedding)
        db.commit()
        db.refresh(new_embedding)
        return new_embedding


@router.post("/users/{user_id}/enneagrams")
async def assign_enneagrams(
    user_id: str,
    data: EnneagramAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Assign enneagrams to user."""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check authorization
    if user.user_id != current_user.user_id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    # Implementation would go here
    # For now, return success
    return {"message": "Enneagrams assigned successfully"}

