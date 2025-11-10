"""
String (post) schemas for request/response validation.
"""
from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, UUID4, Field

from app.schemas.user import UserResponse


# Base schemas
class StringBase(BaseModel):
    """Base string schema."""
    content_text: Optional[str] = None
    content_images: Optional[Dict[str, Any]] = None
    stringable_id: Optional[UUID4] = None
    stringable_type: Optional[str] = None


# Request schemas
class StringCreate(StringBase):
    """Schema for creating a string."""
    pass


class StringUpdate(BaseModel):
    """Schema for updating a string."""
    content_text: Optional[str] = None
    content_images: Optional[Dict[str, Any]] = None


# Response schemas
class StringResponse(StringBase):
    """Schema for string response."""
    id: UUID4
    user_id: UUID4
    likes_count: int
    comments_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Optional includes
    user: Optional[UserResponse] = None
    is_liked: Optional[bool] = None
    
    class Config:
        from_attributes = True


class StringListResponse(BaseModel):
    """Schema for paginated string list response."""
    strings: List[StringResponse]
    total: int
    page: int
    per_page: int


# Comment schemas
class CommentBase(BaseModel):
    """Base comment schema."""
    content: str
    parent_comment_id: Optional[UUID4] = None


class CommentCreate(CommentBase):
    """Schema for creating a comment."""
    pass


class CommentResponse(CommentBase):
    """Schema for comment response."""
    id: UUID4
    string_id: UUID4
    user_id: UUID4
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Optional includes
    user: Optional[UserResponse] = None
    replies: Optional[List['CommentResponse']] = None
    
    class Config:
        from_attributes = True


# Enable forward references
CommentResponse.model_rebuild()

