"""
Event model.
"""
from sqlalchemy import Column, String, DateTime, Text, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class Event(Base):
    """Event model."""
    
    __tablename__ = "events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user_profiles.user_id"), nullable=False, index=True)
    
    title = Column(Text, nullable=False)
    description = Column(Text)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True))
    location = Column(Text)
    
    meta_data = Column(JSONB, default=dict, nullable=False)
    custom_fields = Column(JSONB, default=dict, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="events")
    
    def __repr__(self):
        return f"<Event {self.title} ({self.start_time})>"

