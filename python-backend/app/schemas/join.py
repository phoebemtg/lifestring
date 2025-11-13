"""
Join schemas for request/response validation.
"""
from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, UUID4

from app.schemas.user import UserResponse


# Base schemas
class JoinBase(BaseModel):
    """Base join schema - cleaned up design."""
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    duration: Optional[str] = None
    max_participants: Optional[int] = 10
    difficulty: Optional[str] = "beginner"  # 'beginner', 'intermediate', 'advanced'
    tags: Optional[List[str]] = []


# Request schemas
class JoinCreate(JoinBase):
    """Schema for creating a join."""
    pass


class JoinUpdate(BaseModel):
    """Schema for updating a join."""
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    duration: Optional[str] = None
    max_participants: Optional[int] = None
    difficulty: Optional[str] = None
    tags: Optional[List[str]] = None


# Response schemas
class JoinResponse(JoinBase):
    """Schema for join response."""
    id: UUID4
    user_id: UUID4
    created_at: datetime
    
    # Additional computed fields
    current_participants: Optional[int] = 1
    is_joined: Optional[bool] = False
    match_score: Optional[float] = 0.0
    
    # Optional includes
    user: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True


class JoinListResponse(BaseModel):
    """Schema for paginated join list response."""
    joins: List[JoinResponse]
    total: int
    page: int
    per_page: int


class JoinSearchRequest(BaseModel):
    """Schema for join search request."""
    query: Optional[str] = None
    type: Optional[str] = None
    location: Optional[str] = None
    difficulty: Optional[str] = None
    tags: Optional[List[str]] = None
    max_cost: Optional[float] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    page: int = 1
    per_page: int = 20
