"""
Event schemas for request/response validation.
"""
from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, UUID4

from app.schemas.user import UserResponse


# Base schemas
class EventBase(BaseModel):
    """Base event schema."""
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    location: Optional[str] = None
    meta_data: Optional[Dict[str, Any]] = None
    custom_fields: Optional[Dict[str, Any]] = None


# Request schemas
class EventCreate(EventBase):
    """Schema for creating an event."""
    pass


class EventUpdate(BaseModel):
    """Schema for updating an event."""
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    location: Optional[str] = None
    meta_data: Optional[Dict[str, Any]] = None
    custom_fields: Optional[Dict[str, Any]] = None


# Response schemas
class EventResponse(EventBase):
    """Schema for event response."""
    id: UUID4
    user_id: UUID4
    created_at: datetime
    
    # Optional includes
    user: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True


class EventListResponse(BaseModel):
    """Schema for paginated event list response."""
    events: List[EventResponse]
    total: int
    page: int
    per_page: int

