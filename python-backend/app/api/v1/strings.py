"""
String (posts) API endpoints.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.string import String, StringLike, StringEmbedding
from app.schemas.string import (
    StringResponse,
    StringCreate,
    StringUpdate,
    StringListResponse
)
from app.services.openai_service import openai_service

router = APIRouter()


@router.get("/strings", response_model=StringListResponse)
async def list_strings(
    skip: int = Query(0, ge=0),
    limit: int = Query(15, ge=1, le=100),
    sort_by: str = Query("created_at", regex="^(created_at|likes_count|comments_count)$"),
    sort_dir: str = Query("desc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all strings with pagination and sorting."""
    query = db.query(String)
    
    # Apply sorting
    sort_column = getattr(String, sort_by)
    if sort_dir == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(sort_column)
    
    total = query.count()
    strings = query.offset(skip).limit(limit).all()
    
    return {
        "strings": strings,
        "total": total,
        "page": (skip // limit) + 1,
        "per_page": limit
    }


@router.get("/my/strings", response_model=StringListResponse)
async def get_my_strings(
    skip: int = Query(0, ge=0),
    limit: int = Query(15, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's strings."""
    query = db.query(String).filter(String.user_id == current_user.user_id)
    query = query.order_by(desc(String.created_at))

    total = query.count()
    strings = query.offset(skip).limit(limit).all()

    return {
        "strings": strings,
        "total": total,
        "page": (skip // limit) + 1,
        "per_page": limit
    }


@router.get("/my/recent", response_model=StringListResponse)
async def get_my_recent_strings(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's most recent strings for the sidebar."""
    # Add debugging
    print(f"DEBUG: get_my_recent_strings called for user_id: {current_user.user_id}")

    query = db.query(String).filter(String.user_id == current_user.user_id)
    query = query.order_by(desc(String.created_at))

    strings = query.limit(limit).all()

    # Debug output
    print(f"DEBUG: Found {len(strings)} strings for user {current_user.user_id}")
    for string in strings:
        print(f"DEBUG: String {string.id} by user {string.user_id}: {string.content_text[:50]}...")

    return {
        "strings": strings,
        "total": len(strings),
        "page": 1,
        "per_page": limit
    }


@router.get("/my/liked-strings", response_model=StringListResponse)
async def get_liked_strings(
    skip: int = Query(0, ge=0),
    limit: int = Query(15, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get strings liked by current user."""
    query = db.query(String).join(StringLike).filter(
        StringLike.user_id == current_user.user_id
    ).order_by(desc(StringLike.created_at))
    
    total = query.count()
    strings = query.offset(skip).limit(limit).all()
    
    return {
        "strings": strings,
        "total": total,
        "page": (skip // limit) + 1,
        "per_page": limit
    }


@router.get("/strings/{string_id}", response_model=StringResponse)
async def get_string(
    string_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get string by ID."""
    string = db.query(String).filter(String.id == string_id).first()
    if not string:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="String not found"
        )
    return string


@router.post("/strings", response_model=StringResponse, status_code=status.HTTP_201_CREATED)
async def create_string(
    string_data: StringCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new string."""
    string = String(
        **string_data.model_dump(),
        user_id=current_user.user_id
    )
    db.add(string)
    db.commit()
    db.refresh(string)
    
    # Generate embedding asynchronously (in background in production)
    if string.content_text:
        try:
            embedding_vector = await openai_service.create_embedding(string.content_text)
            content_hash = openai_service.generate_content_hash(string.content_text)
            
            string_embedding = StringEmbedding(
                string_id=string.id,
                embedding=embedding_vector,
                content_hash=content_hash
            )
            db.add(string_embedding)
            db.commit()
        except Exception as e:
            # Log error but don't fail the request
            print(f"Error creating embedding: {e}")
    
    return string


@router.put("/strings/{string_id}", response_model=StringResponse)
async def update_string(
    string_id: str,
    string_data: StringUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update string."""
    string = db.query(String).filter(String.id == string_id).first()
    if not string:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="String not found"
        )
    
    # Check authorization
    if string.user_id != current_user.user_id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this string"
        )
    
    # Update fields
    update_data = string_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(string, field, value)
    
    db.commit()
    db.refresh(string)
    return string


@router.delete("/strings/{string_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_string(
    string_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete string."""
    string = db.query(String).filter(String.id == string_id).first()
    if not string:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="String not found"
        )
    
    # Check authorization
    if string.user_id != current_user.user_id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this string"
        )
    
    db.delete(string)
    db.commit()
    return None


@router.post("/strings/{string_id}/like")
async def toggle_like(
    string_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle like on a string."""
    string = db.query(String).filter(String.id == string_id).first()
    if not string:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="String not found"
        )
    
    # Check if already liked
    existing_like = db.query(StringLike).filter(
        StringLike.string_id == string_id,
        StringLike.user_id == current_user.user_id
    ).first()
    
    if existing_like:
        # Unlike
        db.delete(existing_like)
        string.likes_count = max(0, string.likes_count - 1)
        action = "unliked"
    else:
        # Like
        new_like = StringLike(
            string_id=string_id,
            user_id=current_user.user_id
        )
        db.add(new_like)
        string.likes_count += 1
        action = "liked"
    
    db.commit()
    
    return {
        "message": f"String {action} successfully",
        "likes_count": string.likes_count
    }

