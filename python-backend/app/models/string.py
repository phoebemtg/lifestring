"""
String model - maps to strings table (posts/content).
"""
from sqlalchemy import Column, String as SQLString, Integer, DateTime, Text, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
import uuid

from app.core.database import Base


class String(Base):
    """String (post/content) model."""

    __tablename__ = "strings"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign keys
    user_id = Column(UUID(as_uuid=True), ForeignKey("user_profiles.user_id"), nullable=False, index=True)

    # Content
    content_text = Column(Text)
    content_images = Column(JSONB)

    # Polymorphic fields (for linking to events, etc.)
    stringable_id = Column(UUID(as_uuid=True))
    stringable_type = Column(SQLString)

    # Counters
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="strings")
    comments = relationship("StringComment", back_populates="string", cascade="all, delete-orphan")
    embedding = relationship("StringEmbedding", back_populates="string", uselist=False, cascade="all, delete-orphan")

    # Many-to-many for likes
    liked_by = relationship(
        "User",
        secondary="string_likes",
        backref="liked_strings"
    )

    def __repr__(self):
        preview = self.content_text[:50] if self.content_text else "No content"
        return f"<String {self.id}: {preview}...>"

    def is_liked_by(self, user_id: uuid.UUID) -> bool:
        """Check if string is liked by a specific user."""
        return any(user.user_id == user_id for user in self.liked_by)


class StringComment(Base):
    """String comment model."""

    __tablename__ = "string_comments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    string_id = Column(UUID(as_uuid=True), ForeignKey("strings.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    parent_comment_id = Column(UUID(as_uuid=True), ForeignKey("string_comments.id", ondelete="CASCADE"))
    content = Column(Text, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    string = relationship("String", back_populates="comments")
    replies = relationship("StringComment", backref="parent", remote_side=[id])

    def __repr__(self):
        preview = self.content[:50] if self.content else "No content"
        return f"<StringComment {self.id}: {preview}...>"


class StringLike(Base):
    """String like model (many-to-many table)."""

    __tablename__ = "string_likes"

    string_id = Column(UUID(as_uuid=True), ForeignKey("strings.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user_profiles.user_id", ondelete="CASCADE"), primary_key=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True))


class StringEmbedding(Base):
    """String embedding model for AI recommendations."""

    __tablename__ = "string_embeddings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    string_id = Column(UUID(as_uuid=True), ForeignKey("strings.id", ondelete="CASCADE"), unique=True, nullable=False)
    embedding = Column(Vector(1536), nullable=False)
    content_hash = Column(SQLString, nullable=False)
    model_version = Column(SQLString, default="text-embedding-3-small", nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    string = relationship("String", back_populates="embedding")

    def __repr__(self):
        return f"<StringEmbedding string_id={self.string_id}>"

