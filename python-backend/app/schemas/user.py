"""
User schemas for request/response validation.
"""
from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, UUID4, Field


# Base schemas
class UserBase(BaseModel):
    """Base user schema with common fields."""
    contact_info: Optional[Dict[str, Any]] = Field(default_factory=dict)
    social_links: Optional[Dict[str, Any]] = Field(default_factory=dict)
    attributes: Optional[Dict[str, Any]] = Field(default_factory=dict)
    biography: Optional[Dict[str, Any]] = Field(default_factory=dict)
    meta: Optional[Dict[str, Any]] = Field(default_factory=dict)


# Request schemas
class UserCreate(UserBase):
    """Schema for creating a new user."""
    user_id: UUID4


class UserUpdate(BaseModel):
    """Schema for updating a user."""
    contact_info: Optional[Dict[str, Any]] = None
    social_links: Optional[Dict[str, Any]] = None
    attributes: Optional[Dict[str, Any]] = None
    biography: Optional[Dict[str, Any]] = None
    meta: Optional[Dict[str, Any]] = None


# Response schemas
class UserResponse(UserBase):
    """Schema for user response."""
    id: UUID4
    user_id: UUID4
    is_admin: bool
    is_mod: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Computed fields
    name: Optional[str] = None
    email: Optional[str] = None
    
    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    """Schema for paginated user list response."""
    users: List[UserResponse]
    total: int
    page: int
    per_page: int
    
    
class EnneagramAssign(BaseModel):
    """Schema for assigning enneagrams to user."""
    enneagram_ids: List[int]


class UserEmbeddingResponse(BaseModel):
    """Schema for user embedding response."""
    id: int
    user_id: UUID4
    model_version: str
    created_at: datetime

    model_config = {"from_attributes": True, "protected_namespaces": ()}


class UserRecommendationResponse(BaseModel):
    """Schema for user recommendation response."""
    id: UUID4
    user_id: UUID4
    recommended_user_id: UUID4
    similarity_score: float
    status: str
    context: Optional[Dict[str, Any]] = None
    created_at: datetime
    
    # Include recommended user details
    recommended_user: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True

