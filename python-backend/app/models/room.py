"""
Room and Message models for chat functionality.
"""
from sqlalchemy import Column, String, DateTime, Text, func, ForeignKey, Table
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class RoomParticipant(Base):
    """Room participant association table."""
    
    __tablename__ = "room_participants"
    
    room_id = Column(UUID(as_uuid=True), ForeignKey("rooms.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user_profiles.user_id", ondelete="CASCADE"), primary_key=True, index=True)


class Room(Base):
    """Chat room model."""

    __tablename__ = "rooms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(Text)
    room_metadata = Column("metadata", JSONB)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    messages = relationship("Message", back_populates="room", cascade="all, delete-orphan")
    participants = relationship(
        "User",
        secondary="room_participants",
        back_populates="rooms"
    )
    
    def __repr__(self):
        return f"<Room {self.name or self.id}>"
    
    def has_participant(self, user_id: uuid.UUID) -> bool:
        """Check if user is a participant in this room."""
        return any(p.user_id == user_id for p in self.participants)
    
    @property
    def is_ai_chat(self) -> bool:
        """Check if this is an AI chat room."""
        if self.room_metadata and isinstance(self.room_metadata, dict):
            return self.room_metadata.get('type') == 'ai_chat'
        return False


class Message(Base):
    """Chat message model."""
    
    __tablename__ = "messages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    room_id = Column(UUID(as_uuid=True), ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user_profiles.user_id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    room = relationship("Room", back_populates="messages")
    user = relationship("User", back_populates="messages")
    
    def __repr__(self):
        preview = self.content[:50] if self.content else "No content"
        return f"<Message {self.id}: {preview}...>"

