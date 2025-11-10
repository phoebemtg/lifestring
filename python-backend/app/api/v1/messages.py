"""
Message API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.room import Room, Message
from app.schemas.room import MessageResponse, MessageCreate, MessageListResponse

router = APIRouter()


@router.get("/rooms/{room_id}/messages", response_model=MessageListResponse)
async def get_room_messages(
    room_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get messages in a room."""
    # Check if room exists and user is participant
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    if not room.has_participant(current_user.user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this room"
        )
    
    # Get messages
    query = db.query(Message).filter(
        Message.room_id == room_id
    ).order_by(desc(Message.created_at))
    
    total = query.count()
    messages = query.offset(skip).limit(limit).all()
    
    # Reverse to show oldest first
    messages.reverse()
    
    return {
        "messages": messages,
        "total": total,
        "page": (skip // limit) + 1,
        "per_page": limit
    }


@router.post("/rooms/{room_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_message(
    room_id: str,
    message_data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new message in a room."""
    # Check if room exists and user is participant
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    if not room.has_participant(current_user.user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this room"
        )
    
    # Create message
    message = Message(
        room_id=room_id,
        user_id=current_user.user_id,
        content=message_data.content
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    
    return message


@router.delete("/messages/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message(
    message_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a message."""
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Check authorization
    if message.user_id != current_user.user_id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this message"
        )
    
    db.delete(message)
    db.commit()
    return None

