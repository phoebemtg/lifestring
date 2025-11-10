"""
Connections API endpoints for user discovery and matching.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, UserConnection, ConnectionStatus, UserRecommendation, DetailedProfile
from app.schemas.user import UserResponse
from app.schemas.connection import (
    ConnectionResponse,
    ConnectionCreate,
    ConnectionListResponse,
    UserRecommendationResponse
)

router = APIRouter()


@router.get("/connections", response_model=ConnectionListResponse)
async def list_connections(
    status_filter: Optional[ConnectionStatus] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List user's connections with optional status filtering."""
    query = db.query(UserConnection).filter(
        or_(
            UserConnection.requester_id == current_user.user_id,
            UserConnection.receiver_id == current_user.user_id
        )
    )
    
    if status_filter:
        query = query.filter(UserConnection.status == status_filter)
    
    query = query.order_by(desc(UserConnection.created_at))
    
    total = query.count()
    connections = query.offset(skip).limit(limit).all()
    
    return {
        "connections": connections,
        "total": total,
        "page": (skip // limit) + 1,
        "per_page": limit
    }


@router.get("/connections/accepted", response_model=List[UserResponse])
async def get_accepted_connections(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all accepted connections (friends) for current user."""
    # Get connections where current user is either requester or receiver
    connections = db.query(UserConnection).filter(
        and_(
            UserConnection.status == ConnectionStatus.ACCEPTED,
            or_(
                UserConnection.requester_id == current_user.user_id,
                UserConnection.receiver_id == current_user.user_id
            )
        )
    ).all()
    
    # Extract the other user's ID from each connection
    friend_ids = []
    for conn in connections:
        if conn.requester_id == current_user.user_id:
            friend_ids.append(conn.receiver_id)
        else:
            friend_ids.append(conn.requester_id)
    
    # Get user profiles for friends
    friends = db.query(User).filter(User.user_id.in_(friend_ids)).all()
    
    return friends


@router.get("/connections/pending", response_model=List[ConnectionResponse])
async def get_pending_connections(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get pending connection requests (both sent and received)."""
    pending_connections = db.query(UserConnection).filter(
        and_(
            UserConnection.status == ConnectionStatus.PENDING,
            or_(
                UserConnection.requester_id == current_user.user_id,
                UserConnection.receiver_id == current_user.user_id
            )
        )
    ).order_by(desc(UserConnection.created_at)).all()
    
    return pending_connections


@router.get("/discover")
async def discover_users(
    interests: Optional[str] = Query(None, description="Comma-separated interests to match"),
    location: Optional[str] = Query(None, description="Location to filter by"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Discover new users based on interests and location."""
    # Start with all users except current user, join with detailed_profiles for photo data
    query = db.query(User, DetailedProfile).outerjoin(
        DetailedProfile, User.user_id == DetailedProfile.user_id
    ).filter(User.user_id != current_user.user_id)
    
    # Exclude users already connected to
    existing_connections = db.query(UserConnection.requester_id, UserConnection.receiver_id).filter(
        or_(
            UserConnection.requester_id == current_user.user_id,
            UserConnection.receiver_id == current_user.user_id
        )
    ).all()
    
    excluded_user_ids = set()
    for conn in existing_connections:
        if conn.requester_id == current_user.user_id:
            excluded_user_ids.add(conn.receiver_id)
        else:
            excluded_user_ids.add(conn.requester_id)
    
    if excluded_user_ids:
        query = query.filter(~User.user_id.in_(excluded_user_ids))
    
    # Filter by interests if provided
    if interests:
        interest_list = [i.strip().lower() for i in interests.split(',')]
        # This is a simplified interest matching - in production you'd use vector similarity
        for interest in interest_list:
            query = query.filter(
                func.lower(func.cast(User.attributes, db.String)).contains(interest)
            )
    
    # Filter by location if provided
    if location:
        query = query.filter(
            func.lower(func.cast(User.contact_info, db.String)).contains(location.lower())
        )
    
    # Order by creation date (newest first) and limit
    results = query.order_by(desc(User.created_at)).limit(limit).all()

    # Transform results to include profile photo data
    users_with_photos = []
    for user, detailed_profile in results:
        # Create a user dict with profile photo data
        user_dict = {
            "id": user.id,
            "user_id": user.user_id,
            "contact_info": user.contact_info,
            "social_links": user.social_links,
            "attributes": user.attributes,
            "biography": user.biography,
            "meta": user.meta,
            "is_admin": user.is_admin,
            "is_mod": user.is_mod,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
            "name": user.contact_info.get('name') if user.contact_info else None,
            "email": user.contact_info.get('email') if user.contact_info else None,
            # Add profile photo data from detailed_profile
            "profile_photo": detailed_profile.profile_photo if detailed_profile else None,
            "photos": detailed_profile.photos if detailed_profile else None,
        }
        users_with_photos.append(user_dict)

    return users_with_photos


@router.post("/connections", response_model=ConnectionResponse, status_code=status.HTTP_201_CREATED)
async def create_connection_request(
    connection_data: ConnectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a connection request to another user."""
    # Check if connection already exists
    existing = db.query(UserConnection).filter(
        or_(
            and_(
                UserConnection.requester_id == current_user.user_id,
                UserConnection.receiver_id == connection_data.receiver_id
            ),
            and_(
                UserConnection.requester_id == connection_data.receiver_id,
                UserConnection.receiver_id == current_user.user_id
            )
        )
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Connection already exists"
        )
    
    # Check if target user exists
    target_user = db.query(User).filter(User.user_id == connection_data.receiver_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Create connection request
    connection = UserConnection(
        requester_id=current_user.user_id,
        receiver_id=connection_data.receiver_id,
        status=ConnectionStatus.PENDING
    )
    
    db.add(connection)
    db.commit()
    db.refresh(connection)
    
    return connection


@router.put("/connections/{requester_id}/respond", response_model=ConnectionResponse)
async def respond_to_connection(
    requester_id: str,
    accept: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Accept or decline a connection request."""
    connection = db.query(UserConnection).filter(
        and_(
            UserConnection.requester_id == requester_id,
            UserConnection.receiver_id == current_user.user_id,
            UserConnection.status == ConnectionStatus.PENDING
        )
    ).first()
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection request not found"
        )
    
    # Update status
    connection.status = ConnectionStatus.ACCEPTED if accept else ConnectionStatus.DECLINED
    db.commit()
    db.refresh(connection)
    
    return connection


@router.delete("/connections/{user_id}")
async def remove_connection(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove/block a connection."""
    connection = db.query(UserConnection).filter(
        or_(
            and_(
                UserConnection.requester_id == current_user.user_id,
                UserConnection.receiver_id == user_id
            ),
            and_(
                UserConnection.requester_id == user_id,
                UserConnection.receiver_id == current_user.user_id
            )
        )
    ).first()
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found"
        )
    
    # Mark as blocked instead of deleting
    connection.status = ConnectionStatus.BLOCKED
    db.commit()
    
    return {"message": "Connection removed"}
