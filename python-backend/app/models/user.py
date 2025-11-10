"""
User model - maps to user_profiles table.
"""
from sqlalchemy import Column, String as SQLString, Boolean, DateTime, func, Integer, ForeignKey, Numeric, Enum as SQLEnum, Date, ARRAY, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
import uuid
import enum

from app.core.database import Base


class ConnectionStatus(str, enum.Enum):
    """User connection status enum."""
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    BLOCKED = "blocked"


class RecommendationStatus(str, enum.Enum):
    """User recommendation status enum."""
    GENERATED = "generated"
    VIEWED = "viewed"
    ACCEPTED = "accepted"
    DISMISSED = "dismissed"


class User(Base):
    """User profile model."""

    __tablename__ = "user_profiles"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), unique=True, nullable=False, index=True)

    # JSONB fields (same as Laravel)
    contact_info = Column(JSONB, default=dict)
    social_links = Column(JSONB, default=dict)
    attributes = Column(JSONB, default=dict)
    biography = Column(JSONB, default=dict)
    meta = Column(JSONB, default=dict)

    # Flags
    is_admin = Column(Boolean, default=False)
    is_mod = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    strings = relationship("String", back_populates="user", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="user", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="user", cascade="all, delete-orphan")
    embeddings = relationship("UserEmbedding", back_populates="user", cascade="all, delete-orphan")

    # Many-to-many relationships
    rooms = relationship(
        "Room",
        secondary="room_participants",
        back_populates="participants"
    )

    enneagrams = relationship(
        "Enneagram",
        secondary="user_enneagrams",
        back_populates="users"
    )

    def __repr__(self):
        name = self.contact_info.get('name', 'Unknown') if self.contact_info else 'Unknown'
        return f"<User {name} ({self.user_id})>"

    @property
    def name(self) -> str:
        """Get user's name from contact_info."""
        if self.contact_info and isinstance(self.contact_info, dict):
            return self.contact_info.get('name', '')
        return ''

    @property
    def email(self) -> str:
        """Get user's email from contact_info."""
        if self.contact_info and isinstance(self.contact_info, dict):
            return self.contact_info.get('email', '')
        return ''

    @property
    def interests(self) -> list:
        """Get user's interests from attributes."""
        if self.attributes and isinstance(self.attributes, dict):
            return self.attributes.get('interests', [])
        return []

    @property
    def passions(self) -> list:
        """Get user's passions from attributes."""
        if self.attributes and isinstance(self.attributes, dict):
            return self.attributes.get('passions', [])
        return []


class UserEmbedding(Base):
    """User embedding model for AI recommendations."""

    __tablename__ = "user_embeddings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user_profiles.user_id"), unique=True, nullable=False)
    embedding = Column(Vector(1536), nullable=False)
    content_hash = Column(SQLString, nullable=False)
    model_version = Column(SQLString, default="text-embedding-3-small", nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="embeddings")

    def __repr__(self):
        return f"<UserEmbedding user_id={self.user_id}>"


class UserEnneagram(Base):
    """User-Enneagram association table."""

    __tablename__ = "user_enneagrams"

    user_id = Column(UUID(as_uuid=True), ForeignKey("user_profiles.user_id"), primary_key=True)
    enneagram_id = Column(Integer, ForeignKey("enneagrams.id"), primary_key=True)


class UserConnection(Base):
    """User connection/friendship model."""

    __tablename__ = "user_connections"

    requester_id = Column(UUID(as_uuid=True), ForeignKey("user_profiles.user_id"), primary_key=True)
    receiver_id = Column(UUID(as_uuid=True), ForeignKey("user_profiles.user_id"), primary_key=True)
    status = Column(SQLEnum(ConnectionStatus), default=ConnectionStatus.PENDING, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<UserConnection {self.requester_id} -> {self.receiver_id} ({self.status})>"


class UserRecommendation(Base):
    """User recommendation model for AI-powered suggestions."""

    __tablename__ = "user_recommendations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user_profiles.user_id"), nullable=False, index=True)
    recommended_user_id = Column(UUID(as_uuid=True), ForeignKey("user_profiles.user_id"), nullable=False, index=True)
    similarity_score = Column(Numeric(5, 4), nullable=False)
    status = Column(SQLEnum(RecommendationStatus), default=RecommendationStatus.GENERATED, nullable=False)
    context = Column(JSONB)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<UserRecommendation {self.user_id} -> {self.recommended_user_id} (score={self.similarity_score})>"


class DetailedProfile(Base):
    """Detailed user profile model - maps to detailed_profiles table used by frontend."""

    __tablename__ = "detailed_profiles"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), unique=True, nullable=False, index=True)

    # Profile fields
    bio = Column(Text)
    location = Column(Text)
    birthday = Column(Date)
    email = Column(Text)
    phone = Column(Text)
    website = Column(Text)
    instagram = Column(Text)
    twitter = Column(Text)
    linkedin = Column(Text)

    # Arrays for interests and skills
    passions = Column(ARRAY(Text))
    hobbies = Column(ARRAY(Text))
    interests = Column(ARRAY(Text))
    skills = Column(ARRAY(Text))
    questions = Column(ARRAY(Text))

    # Profile questions answers (JSONB)
    profile_questions = Column(JSONB)

    # Text fields
    ambitions = Column(Text)
    dreams = Column(Text)
    goals = Column(Text)
    education = Column(Text)
    work = Column(Text)
    relationship_status = Column(Text)
    looking_for = Column(Text)

    # Photo fields
    profile_photo = Column(Text)  # URL to main profile photo
    photos = Column(ARRAY(Text))  # Array of additional photo URLs
    name = Column(Text)  # User's full name

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<DetailedProfile user_id={self.user_id}>"

