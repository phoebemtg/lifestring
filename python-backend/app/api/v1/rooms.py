"""
Room API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.room import Room, RoomParticipant
from app.schemas.room import RoomResponse, RoomCreate, RoomUpdate, RoomListResponse

router = APIRouter()


@router.get("/rooms", response_model=RoomListResponse)
async def list_rooms(
    skip: int = Query(0, ge=0),
    limit: int = Query(15, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all rooms."""
    query = db.query(Room).order_by(desc(Room.updated_at))
    total = query.count()
    rooms = query.offset(skip).limit(limit).all()
    
    return {
        "rooms": rooms,
        "total": total,
        "page": (skip // limit) + 1,
        "per_page": limit
    }


@router.get("/my/rooms", response_model=RoomListResponse)
async def get_my_rooms(
    skip: int = Query(0, ge=0),
    limit: int = Query(15, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get rooms where current user is a participant."""
    query = db.query(Room).join(RoomParticipant).filter(
        RoomParticipant.user_id == current_user.user_id
    ).order_by(desc(Room.updated_at))
    
    total = query.count()
    rooms = query.offset(skip).limit(limit).all()
    
    return {
        "rooms": rooms,
        "total": total,
        "page": (skip // limit) + 1,
        "per_page": limit
    }


@router.get("/rooms/{room_id}", response_model=RoomResponse)
async def get_room(
    room_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get room by ID."""
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    # Check if user is participant
    if not room.has_participant(current_user.user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this room"
        )
    
    return room


@router.post("/rooms", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
async def create_room(
    room_data: RoomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new room."""
    room = Room(
        name=room_data.name,
        room_metadata=room_data.room_metadata
    )
    db.add(room)
    db.flush()
    
    # Add creator as participant
    participant = RoomParticipant(
        room_id=room.id,
        user_id=current_user.user_id
    )
    db.add(participant)
    
    # Add additional participants if provided
    if room_data.participant_ids:
        for user_id in room_data.participant_ids:
            if user_id != current_user.user_id:
                participant = RoomParticipant(
                    room_id=room.id,
                    user_id=user_id
                )
                db.add(participant)
    
    db.commit()
    db.refresh(room)
    return room


@router.put("/rooms/{room_id}", response_model=RoomResponse)
async def update_room(
    room_id: str,
    room_data: RoomUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update room."""
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    # Check if user is participant
    if not room.has_participant(current_user.user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this room"
        )
    
    # Update fields
    update_data = room_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(room, field, value)
    
    db.commit()
    db.refresh(room)
    return room


@router.delete("/rooms/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_room(
    room_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete room."""
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    # Only allow deletion if user is participant (or admin)
    if not room.has_participant(current_user.user_id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this room"
        )
    
    db.delete(room)
    db.commit()
    return None

