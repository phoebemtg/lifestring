"""
Authentication API endpoints for user management.
"""
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
import httpx
import logging

from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)


class AutoConfirmRequest(BaseModel):
    """Request model for auto-confirming users."""
    email: EmailStr
    user_id: str


@router.post("/auth/auto-confirm")
async def auto_confirm_user(request: AutoConfirmRequest) -> Dict[str, Any]:
    """
    Auto-confirm a user's email using Supabase Admin API.
    
    This endpoint uses the service role key to bypass email confirmation
    requirements for new users.
    """
    try:
        logger.info(f"Auto-confirming user: {request.email} (ID: {request.user_id})")
        
        # Use Supabase Admin API to confirm the user
        admin_headers = {
            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}",
            "Content-Type": "application/json",
            "apikey": settings.SUPABASE_SERVICE_KEY
        }
        
        # Update user to be confirmed
        update_data = {
            "email_confirmed_at": "now()",
            "confirmed_at": "now()"
        }
        
        async with httpx.AsyncClient() as client:
            # Use Supabase Admin API to update user
            response = await client.patch(
                f"{settings.SUPABASE_URL}/auth/v1/admin/users/{request.user_id}",
                headers=admin_headers,
                json=update_data
            )
            
            if response.status_code == 200:
                logger.info(f"Successfully auto-confirmed user: {request.email}")
                return {
                    "success": True,
                    "message": "User email confirmed successfully",
                    "user_id": request.user_id
                }
            else:
                logger.error(f"Failed to auto-confirm user: {response.status_code} - {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to confirm user: {response.text}"
                )
                
    except Exception as e:
        logger.error(f"Error auto-confirming user {request.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to auto-confirm user"
        )


@router.post("/auth/resend-confirmation")
async def resend_confirmation_email(request: AutoConfirmRequest) -> Dict[str, Any]:
    """
    Resend confirmation email for a user.
    """
    try:
        logger.info(f"Resending confirmation email for: {request.email}")
        
        admin_headers = {
            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}",
            "Content-Type": "application/json",
            "apikey": settings.SUPABASE_SERVICE_KEY
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.SUPABASE_URL}/auth/v1/admin/users/{request.user_id}/resend",
                headers=admin_headers,
                json={"type": "signup"}
            )
            
            if response.status_code == 200:
                logger.info(f"Successfully resent confirmation email to: {request.email}")
                return {
                    "success": True,
                    "message": "Confirmation email resent successfully"
                }
            else:
                logger.error(f"Failed to resend confirmation email: {response.status_code} - {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to resend confirmation email"
                )
                
    except Exception as e:
        logger.error(f"Error resending confirmation email for {request.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to resend confirmation email"
        )
