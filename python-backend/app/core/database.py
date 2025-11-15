"""
Database configuration and session management.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from app.core.config import settings

# Create SQLAlchemy engine
engine = create_engine(
    str(settings.DATABASE_URL),
    echo=settings.DB_ECHO,
    pool_pre_ping=True,  # Verify connections before using
    pool_size=10,
    max_overflow=20,
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Dependency to get database session.

    Usage:
        @app.get("/users")
        def get_users(db: Session = Depends(get_db)):
            users = db.query(User).all()
            return users
    """
    db = SessionLocal()
    try:
        # Test the connection before yielding
        db.execute("SELECT 1")
        yield db
    except Exception as e:
        print(f"Database connection failed: {e}")
        db.close()
        # Yield None to indicate database is not available
        yield None
    finally:
        if db:
            db.close()


def get_db_optional() -> Generator[Session, None, None]:
    """
    Optional database dependency that doesn't fail if database is unavailable.
    Returns None if database connection fails.
    """
    try:
        db = SessionLocal()
        # Test the connection
        db.execute("SELECT 1")
        yield db
    except Exception as e:
        print(f"Database connection failed (optional): {e}")
        yield None
    finally:
        if 'db' in locals() and db:
            db.close()


def init_db() -> None:
    """
    Initialize database tables.
    Note: In production, use Alembic migrations instead.
    """
    Base.metadata.create_all(bind=engine)

