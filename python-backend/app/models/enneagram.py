"""
Enneagram model.
"""
from sqlalchemy import Column, Integer, SmallInteger, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.core.database import Base


class Enneagram(Base):
    """Enneagram personality type model."""
    
    __tablename__ = "enneagrams"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    type_number = Column(SmallInteger, unique=True, nullable=False)
    name = Column(Text, nullable=False)
    description = Column(Text)
    attributes = Column(JSONB)
    
    # Relationships
    users = relationship(
        "User",
        secondary="user_enneagrams",
        back_populates="enneagrams"
    )
    
    def __repr__(self):
        return f"<Enneagram Type {self.type_number}: {self.name}>"

