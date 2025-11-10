"""
Connection schemas for API requests and responses.
"""
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, UUID4

from app.models.user import ConnectionStatus, RecommendationStatus
from app.schemas.user import UserResponse


class ConnectionBase(BaseModel):
    """Base connection schema."""
    pass


class ConnectionCreate(BaseModel):
    """Schema for creating a connection request."""
    receiver_id: UUID4


class ConnectionResponse(BaseModel):
    """Schema for connection response."""
    requester_id: UUID4
    receiver_id: UUID4
    status: ConnectionStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ConnectionListResponse(BaseModel):
    """Schema for paginated connection list response."""
    connections: List[ConnectionResponse]
    total: int
    page: int
    per_page: int


class UserRecommendationResponse(BaseModel):
    """Schema for user recommendation response."""
    id: UUID4
    user_id: UUID4
    recommended_user_id: UUID4
    score: float
    status: RecommendationStatus
    created_at: datetime
    
    # Include recommended user details
    recommended_user: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True


class RecommendationListResponse(BaseModel):
    """Schema for paginated recommendation list response."""
    recommendations: List[UserRecommendationResponse]
    total: int
    page: int
    per_page: int


class DiscoverFilters(BaseModel):
    """Schema for user discovery filters."""
    interests: Optional[List[str]] = None
    location: Optional[str] = None
    age_min: Optional[int] = None
    age_max: Optional[int] = None
    max_distance: Optional[int] = None  # in kilometers


class DiscoverResponse(BaseModel):
    """Schema for user discovery response."""
    users: List[UserResponse]
    total_found: int
    filters_applied: DiscoverFilters
