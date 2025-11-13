"""
Joins API endpoints.
"""
import logging
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.event import Event
from app.schemas.join import JoinCreate, JoinUpdate, JoinResponse, JoinListResponse, JoinSearchRequest

logger = logging.getLogger(__name__)

router = APIRouter()


def event_to_join_response(event: Event, current_user_id: str = None) -> JoinResponse:
    """Convert Event model to JoinResponse."""
    # Extract join-specific data from meta_data
    meta_data = event.meta_data or {}
    custom_fields = event.custom_fields or {}
    
    return JoinResponse(
        id=event.id,
        user_id=event.user_id,
        title=event.title,
        description=event.description,
        location=event.location,
        duration=meta_data.get('duration', ''),
        max_participants=meta_data.get('max_participants', 10),
        difficulty=meta_data.get('difficulty', 'beginner'),
        tags=meta_data.get('tags', []),
        current_participants=meta_data.get('current_participants', 1),
        is_joined=str(event.user_id) == str(current_user_id),
        match_score=meta_data.get('match_score', 100.0 if str(event.user_id) == str(current_user_id) else 0.0),
        created_at=event.created_at,
        user=None  # Can be populated if needed
    )


@router.post("/", response_model=JoinResponse)
async def create_join(
    join_data: JoinCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new join."""
    try:
        logger.info(f"Creating join for user {current_user.user_id}: {join_data.title}")
        
        # Use current time as default start time
        start_time = datetime.now(timezone.utc)

        # Create event with simplified join metadata
        meta_data = {
            'duration': join_data.duration or '',
            'max_participants': join_data.max_participants or 10,
            'current_participants': 1,  # Creator is first participant
            'difficulty': join_data.difficulty or 'beginner',
            'tags': join_data.tags or [],
            'match_score': 100.0,  # Perfect match for creator
            'is_join': True  # Flag to identify this as a join
        }
        
        event = Event(
            user_id=current_user.user_id,
            title=join_data.title,
            description=join_data.description,
            start_time=start_time,
            location=join_data.location,
            meta_data=meta_data,
            custom_fields={}
        )
        
        db.add(event)
        db.commit()
        db.refresh(event)
        
        logger.info(f"Successfully created join {event.id}")
        return event_to_join_response(event, str(current_user.user_id))
        
    except Exception as e:
        logger.error(f"Error creating join: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create join: {str(e)}")


@router.get("/", response_model=JoinListResponse)
async def get_joins(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    location: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    search: Optional[str] = Query(None, description="Search in title, description, and tags"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get paginated list of joins."""
    try:
        logger.info(f"Fetching joins for user {current_user.user_id}")
        
        # Base query for joins (events with is_join flag)
        query = db.query(Event).filter(
            Event.meta_data.op('->>')('is_join') == 'true'
        )
        
        # Apply filters
        if location:
            query = query.filter(Event.location.ilike(f"%{location}%"))
        if difficulty:
            query = query.filter(Event.meta_data.op('->>')('difficulty') == difficulty)
        if search:
            # Search in title, description, and tags
            search_term = f"%{search.lower()}%"
            query = query.filter(
                or_(
                    Event.title.ilike(search_term),
                    Event.description.ilike(search_term),
                    Event.meta_data.op('->>')('tags').ilike(search_term)
                )
            )
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        events = query.order_by(Event.created_at.desc()).offset(offset).limit(per_page).all()
        
        # Convert to join responses
        joins = [event_to_join_response(event, str(current_user.user_id)) for event in events]
        
        logger.info(f"Found {len(joins)} joins (page {page}, total {total})")
        
        return JoinListResponse(
            joins=joins,
            total=total,
            page=page,
            per_page=per_page
        )
        
    except Exception as e:
        logger.error(f"Error fetching joins: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch joins: {str(e)}")


@router.get("/my", response_model=JoinListResponse)
async def get_my_joins(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's own joins."""
    try:
        logger.info(f"Fetching joins created by user {current_user.user_id}")
        
        # Query for user's joins
        query = db.query(Event).filter(
            and_(
                Event.user_id == current_user.user_id,
                Event.meta_data.op('->>')('is_join') == 'true'
            )
        )
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        events = query.order_by(Event.created_at.desc()).offset(offset).limit(per_page).all()
        
        # Convert to join responses
        joins = [event_to_join_response(event, str(current_user.user_id)) for event in events]
        
        logger.info(f"Found {len(joins)} joins created by user (page {page}, total {total})")
        
        return JoinListResponse(
            joins=joins,
            total=total,
            page=page,
            per_page=per_page
        )
        
    except Exception as e:
        logger.error(f"Error fetching user's joins: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch user's joins: {str(e)}")


@router.get("/{join_id}", response_model=JoinResponse)
async def get_join(
    join_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific join by ID."""
    try:
        logger.info(f"Fetching join {join_id} for user {current_user.user_id}")
        
        event = db.query(Event).filter(
            and_(
                Event.id == join_id,
                Event.meta_data.op('->>')('is_join') == 'true'
            )
        ).first()
        
        if not event:
            raise HTTPException(status_code=404, detail="Join not found")
        
        return event_to_join_response(event, str(current_user.user_id))
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching join {join_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch join: {str(e)}")


@router.put("/{join_id}", response_model=JoinResponse)
async def update_join(
    join_id: str,
    join_data: JoinUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a join."""
    try:
        logger.info(f"Updating join {join_id} for user {current_user.user_id}")
        
        event = db.query(Event).filter(
            and_(
                Event.id == join_id,
                Event.user_id == current_user.user_id,
                Event.meta_data.op('->>')('is_join') == 'true'
            )
        ).first()
        
        if not event:
            raise HTTPException(status_code=404, detail="Join not found or not owned by user")
        
        # Update basic fields
        if join_data.title is not None:
            event.title = join_data.title
        if join_data.description is not None:
            event.description = join_data.description
        if join_data.location is not None:
            event.location = join_data.location
        
        # Update metadata
        meta_data = event.meta_data or {}
        if join_data.type is not None:
            meta_data['type'] = join_data.type
        if join_data.date is not None:
            meta_data['date'] = join_data.date
        if join_data.time is not None:
            meta_data['time'] = join_data.time
        if join_data.duration is not None:
            meta_data['duration'] = join_data.duration
        if join_data.max_participants is not None:
            meta_data['max_participants'] = join_data.max_participants
        if join_data.cost is not None:
            meta_data['cost'] = join_data.cost
        if join_data.difficulty is not None:
            meta_data['difficulty'] = join_data.difficulty
        if join_data.tags is not None:
            meta_data['tags'] = join_data.tags
        
        event.meta_data = meta_data
        
        db.commit()
        db.refresh(event)
        
        logger.info(f"Successfully updated join {join_id}")
        return event_to_join_response(event, str(current_user.user_id))
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating join {join_id}: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update join: {str(e)}")


@router.delete("/{join_id}")
async def delete_join(
    join_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a join."""
    try:
        logger.info(f"Deleting join {join_id} for user {current_user.user_id}")
        
        event = db.query(Event).filter(
            and_(
                Event.id == join_id,
                Event.user_id == current_user.user_id,
                Event.meta_data.op('->>')('is_join') == 'true'
            )
        ).first()
        
        if not event:
            raise HTTPException(status_code=404, detail="Join not found or not owned by user")
        
        db.delete(event)
        db.commit()
        
        logger.info(f"Successfully deleted join {join_id}")
        return {"message": "Join deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting join {join_id}: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete join: {str(e)}")
