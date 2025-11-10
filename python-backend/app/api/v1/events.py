"""
Event API endpoints.
"""
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, and_, or_

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.event import Event
from app.schemas.event import EventResponse, EventCreate, EventUpdate, EventListResponse

router = APIRouter()


@router.get("/events", response_model=EventListResponse)
async def list_events(
    skip: int = Query(0, ge=0),
    limit: int = Query(15, ge=1, le=100),
    location: Optional[str] = Query(None),
    activity_type: Optional[str] = Query(None),
    upcoming_only: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all events with filtering options."""
    query = db.query(Event)

    # Filter upcoming events only
    if upcoming_only:
        query = query.filter(Event.start_time > datetime.utcnow())

    # Filter by location
    if location:
        query = query.filter(
            func.lower(Event.location).contains(location.lower())
        )

    # Filter by activity type
    if activity_type:
        query = query.filter(
            func.lower(func.cast(Event.custom_fields, db.String)).contains(activity_type.lower())
        )

    query = query.order_by(Event.start_time)
    total = query.count()
    events = query.offset(skip).limit(limit).all()

    return {
        "events": events,
        "total": total,
        "page": (skip // limit) + 1,
        "per_page": limit
    }


@router.get("/my/events", response_model=EventListResponse)
async def get_my_events(
    skip: int = Query(0, ge=0),
    limit: int = Query(15, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get events created by current user."""
    query = db.query(Event).filter(
        Event.user_id == current_user.user_id
    ).order_by(desc(Event.created_at))

    total = query.count()
    events = query.offset(skip).limit(limit).all()

    return {
        "events": events,
        "total": total,
        "page": (skip // limit) + 1,
        "per_page": limit
    }


@router.get("/my/recent", response_model=EventListResponse)
async def get_my_recent_events(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's most recent events for the sidebar."""
    query = db.query(Event).filter(Event.user_id == current_user.user_id)
    query = query.order_by(desc(Event.created_at))

    events = query.limit(limit).all()

    return {
        "events": events,
        "total": len(events),
        "page": 1,
        "per_page": limit
    }


@router.get("/discover", response_model=EventListResponse)
async def discover_events(
    interests: Optional[str] = Query(None, description="Comma-separated interests"),
    location: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Discover events based on user interests and location."""
    query = db.query(Event).filter(
        and_(
            Event.user_id != current_user.user_id,  # Exclude own events
            Event.start_time > datetime.utcnow()     # Only upcoming events
        )
    )

    # Filter by interests if provided
    if interests:
        interest_list = [i.strip().lower() for i in interests.split(',')]
        for interest in interest_list:
            query = query.filter(
                or_(
                    func.lower(Event.title).contains(interest),
                    func.lower(Event.description).contains(interest),
                    func.lower(func.cast(Event.custom_fields, db.String)).contains(interest)
                )
            )

    # Filter by location if provided
    if location:
        query = query.filter(
            func.lower(Event.location).contains(location.lower())
        )

    # Order by start time
    events = query.order_by(Event.start_time).limit(limit).all()

    return {
        "events": events,
        "total": len(events),
        "page": 1,
        "per_page": limit
    }


@router.get("/events/{event_id}", response_model=EventResponse)
async def get_event(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get event by ID."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    return event


@router.post("/events", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    event_data: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new event."""
    event = Event(
        **event_data.model_dump(),
        user_id=current_user.user_id
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.put("/events/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: str,
    event_data: EventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update event."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Check authorization
    if event.user_id != current_user.user_id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this event"
        )
    
    # Update fields
    update_data = event_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)
    
    db.commit()
    db.refresh(event)
    return event


@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete event."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Check authorization
    if event.user_id != current_user.user_id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this event"
        )
    
    db.delete(event)
    db.commit()
    return None

