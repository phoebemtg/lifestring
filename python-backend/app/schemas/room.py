"""
Room and Message schemas for request/response validation.
"""
from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, UUID4

from app.schemas.user import UserResponse


# Room schemas
class RoomBase(BaseModel):
    """Base room schema."""
    name: Optional[str] = None
    room_metadata: Optional[Dict[str, Any]] = None


class RoomCreate(RoomBase):
    """Schema for creating a room."""
    participant_ids: Optional[List[UUID4]] = None


class RoomUpdate(BaseModel):
    """Schema for updating a room."""
    name: Optional[str] = None
    room_metadata: Optional[Dict[str, Any]] = None


class RoomResponse(RoomBase):
    """Schema for room response."""
    id: UUID4
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Optional includes
    participants: Optional[List[UserResponse]] = None
    participant_count: Optional[int] = None
    
    class Config:
        from_attributes = True


class RoomListResponse(BaseModel):
    """Schema for paginated room list response."""
    rooms: List[RoomResponse]
    total: int
    page: int
    per_page: int


# Message schemas
class MessageBase(BaseModel):
    """Base message schema."""
    content: str


class MessageCreate(MessageBase):
    """Schema for creating a message."""
    pass


class MessageResponse(MessageBase):
    """Schema for message response."""
    id: UUID4
    room_id: UUID4
    user_id: UUID4
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Optional includes
    user: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True


class MessageListResponse(BaseModel):
    """Schema for paginated message list response."""
    messages: List[MessageResponse]
    total: int
    page: int
    per_page: int


# Participant schemas
class ParticipantAdd(BaseModel):
    """Schema for adding participants to a room."""
    user_ids: List[UUID4]

