"""
AI Chat API endpoints with enhanced Lifestring features.
"""
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.core.config import settings
from app.api.deps import get_current_user
from app.models.user import User
from app.models.room import Room, Message, RoomParticipant
from app.services.openai_service import openai_service
from app.services.lifestring_ai_service import lifestring_ai, AIResponse
from app.services.ai_action_handler import create_action_handler

# Import realtime_service conditionally to avoid import errors
try:
    from app.services.realtime_service import realtime_service
except ImportError:
    realtime_service = None

router = APIRouter()

# Security scheme
security = HTTPBearer()


class ChatRequest(BaseModel):
    """Request schema for AI chat."""
    message: str
    context: Dict[str, Any] = {}


class ChatResponse(BaseModel):
    """Response schema for AI chat."""
    response: str
    tokens: int
    cost: float


class EnhancedChatRequest(BaseModel):
    """Enhanced request schema for Lifestring AI."""
    message: str
    context: Dict[str, Any] = {}
    intent_hint: Optional[str] = None  # User can hint at intent
    profile_data: Optional[Dict[str, Any]] = None  # Profile data for personalization


class EnhancedChatResponse(BaseModel):
    """Enhanced response schema with structured outputs."""
    message: str
    intent: str
    confidence: float
    actions: List[Dict[str, Any]] = []
    suggested_strings: List[Dict[str, Any]] = []
    suggested_connections: List[str] = []
    suggested_joins: List[Dict[str, Any]] = []
    tokens: int
    cost: float


class SimpleChatResponse(BaseModel):
    """Simple chat response for natural conversation."""
    message: str
    intent: str = "general_chat"
    confidence: float = 1.0


@router.post("/ai/chat", response_model=ChatResponse)
async def create_ai_chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new AI chat room and get first response.
    """
    # Create AI chat room
    room = Room(
        name=f"AI Chat - {current_user.name or 'User'}",
        room_metadata={
            "type": "ai_chat",
            "model": settings.CHAT_MODEL,
            "created_by": str(current_user.user_id)
        }
    )
    db.add(room)
    db.flush()
    
    # Add user as participant
    participant = RoomParticipant(
        room_id=room.id,
        user_id=current_user.user_id
    )
    db.add(participant)
    
    
    # Add AI bot as participant
    ai_participant = RoomParticipant(
        room_id=room.id,
        user_id=settings.AI_BOT_USER_ID
    )
    db.add(ai_participant)
    
    # Save user message
    user_message = Message(
        room_id=room.id,
        user_id=current_user.user_id,
        content=request.message
    )
    db.add(user_message)
    db.commit()
    
    # Build context for AI
    system_prompt = build_system_prompt(current_user, request.context)
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": request.message}
    ]
    
    # Get AI response
    ai_response = await openai_service.chat_completion(messages)
    
    # Save AI response
    ai_message = Message(
        room_id=room.id,
        user_id=settings.AI_BOT_USER_ID,
        content=ai_response["content"]
    )
    db.add(ai_message)
    db.commit()
    
    return {
        "response": ai_response["content"],
        "tokens": ai_response["tokens"],
        "cost": ai_response["cost"]
    }


@router.post("/ai/chat/{room_id}/message", response_model=ChatResponse)
async def send_ai_chat_message(
    room_id: str,
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Send a message to an existing AI chat room.
    """
    # Get room
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
    
    # Check if it's an AI chat room
    if not room.is_ai_chat:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This is not an AI chat room"
        )
    
    # Save user message
    user_message = Message(
        room_id=room.id,
        user_id=current_user.user_id,
        content=request.message
    )
    db.add(user_message)
    db.commit()
    
    # Get conversation history
    history = db.query(Message).filter(
        Message.room_id == room_id
    ).order_by(Message.created_at).limit(20).all()
    
    # Build messages for AI
    system_prompt = build_system_prompt(current_user, request.context)
    messages = [{"role": "system", "content": system_prompt}]
    
    for msg in history:
        role = "assistant" if msg.user_id == settings.AI_BOT_USER_ID else "user"
        messages.append({"role": role, "content": msg.content})
    
    # Get AI response
    ai_response = await openai_service.chat_completion(messages)
    
    # Save AI response
    ai_message = Message(
        room_id=room.id,
        user_id=settings.AI_BOT_USER_ID,
        content=ai_response["content"]
    )
    db.add(ai_message)
    db.commit()
    
    return {
        "response": ai_response["content"],
        "tokens": ai_response["tokens"],
        "cost": ai_response["cost"]
    }


@router.post("/ai/chat/{room_id}/stream")
async def stream_ai_chat_message(
    room_id: str,
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Send a message to AI chat and stream the response.
    """
    # Get room
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
    
    # Save user message
    user_message = Message(
        room_id=room.id,
        user_id=current_user.user_id,
        content=request.message
    )
    db.add(user_message)
    db.commit()
    
    # Get conversation history
    history = db.query(Message).filter(
        Message.room_id == room_id
    ).order_by(Message.created_at).limit(20).all()
    
    # Build messages for AI
    system_prompt = build_system_prompt(current_user, request.context)
    messages = [{"role": "system", "content": system_prompt}]
    
    for msg in history:
        role = "assistant" if msg.user_id == settings.AI_BOT_USER_ID else "user"
        messages.append({"role": role, "content": msg.content})
    
    # Stream response
    async def generate():
        full_response = ""
        async for chunk in openai_service.chat_completion_stream(messages):
            full_response += chunk
            yield chunk
        
        # Save complete response
        ai_message = Message(
            room_id=room.id,
            user_id=settings.AI_BOT_USER_ID,
            content=full_response
        )
        db.add(ai_message)
        db.commit()
    
    return StreamingResponse(generate(), media_type="text/event-stream")


@router.post("/ai/lifestring-chat-public", response_model=SimpleChatResponse)
async def lifestring_ai_chat_public(
    request: EnhancedChatRequest
):
    """
    Public AI chat endpoint for natural conversation (no auth required).
    """
    import logging
    logger = logging.getLogger(__name__)

    try:
        logger.info(f"Received message: {request.message}")
        logger.info(f"Request context: {request.context}")
        logger.info(f"realtime_service available: {realtime_service is not None}")

        # Check if profile data was provided (either directly or in context)
        profile_data = request.profile_data
        if not profile_data and request.context and 'profile_data' in request.context:
            profile_data = request.context.get('profile_data')
            logger.info(f"Profile data extracted from context: {profile_data}")

        if profile_data:
            logger.info(f"Using profile data: {profile_data}")

            # Handle profile-specific queries directly
            message_lower = request.message.lower()
            if "passions" in message_lower or "interests" in message_lower or "hobbies" in message_lower:
                interests = profile_data.get('interests', []) or []
                passions = profile_data.get('passions', []) or []
                hobbies = profile_data.get('hobbies', []) or []
                bio = profile_data.get('bio', '') or ''

                # If asking specifically about passions
                if "passions" in message_lower:
                    if passions:
                        passions_text = ", ".join(passions)
                        message = f"Based on your profile, your passions include: {passions_text}!"
                        if bio:
                            message += f" Your bio says: '{bio}'"
                        message += " Would you like to explore these passions further or connect with others who share them?"
                    else:
                        message = "I don't see any passions listed in your profile yet. You can add them in your profile settings to help me provide more personalized suggestions!"

                    return SimpleChatResponse(
                        message=message,
                        intent="profile_inquiry",
                        confidence=0.95
                    )

                # If asking specifically about hobbies
                elif "hobbies" in message_lower:
                    if hobbies:
                        hobbies_text = ", ".join(hobbies)
                        message = f"Based on your profile, your hobbies include: {hobbies_text}."
                    else:
                        message = "I don't see any hobbies listed in your profile yet. You can add them in your profile settings to help me provide more personalized suggestions!"

                    return SimpleChatResponse(
                        message=message,
                        intent="profile_inquiry",
                        confidence=0.95
                    )

                # For interests query
                else:
                    all_interests = list(set(interests + passions))
                    if all_interests:
                        interests_text = ", ".join(all_interests)
                        message = f"Based on your profile, I can see you're interested in: {interests_text}!"
                        if bio:
                            message += f" Your bio says: '{bio}'"
                        message += " Would you like to explore these interests further or connect with others who share them?"
                    else:
                        message = "I don't see any specific interests listed in your profile yet. You can add them in your profile settings to help me provide more personalized suggestions!"

                    return SimpleChatResponse(
                        message=message,
                        intent="profile_inquiry",
                        confidence=0.95
                    )

            # For other messages with profile data, use enhanced OpenAI with real-time capabilities
            import json

            # Build comprehensive personalized system prompt with current time/date
            import datetime
            now = datetime.datetime.now()
            current_time = now.strftime("%I:%M %p")
            current_date = now.strftime("%A, %B %d, %Y")

            system_prompt = f"""You are Strings, Lifestring's AI assistant. You can answer any questions the user has naturally and conversationally.

Current time: {current_time} on {current_date}.

You are having a conversation with a user on Lifestring. Here's how Lifestring works:

**YOU ARE STRINGS**: You are the AI that users chat with about what they want to do and who they want to meet.

**JOINS**: These are specific events/activities with set times and locations that users can join. When users tell you what they want to do, look for relevant Joins and recommend them.

**CONNECTIONS**: This is how users find friends - they get recommended people based on interests, location, and age. When users want to meet people, direct them to check their Connections.

**YOUR APPROACH**:
1. Answer general questions naturally (weather, time, jokes, etc.) - but ONLY respond with time when specifically asked "what time is it"
2. When users tell you what they want to do or activities they're interested in, recommend relevant Joins they can participate in
3. When users want to meet people or make friends, direct them to their Connections where they'll find recommended people
4. Have natural conversations about their interests and goals
5. NEVER mention external platforms like Meetup, Facebook, etc.
6. Focus on Lifestring's features: Joins for activities, Connections for meeting people

**REMEMBER**: You are Strings - the conversational AI. Users chat with you, and you help them discover Joins and Connections on Lifestring."""

            interests = profile_data.get('interests', []) or []
            hobbies = profile_data.get('hobbies', []) or []
            bio = profile_data.get('bio', '') or ''
            profile_questions = profile_data.get('profile_questions', {}) or {}
            name = profile_data.get('contact_info', {}).get('name', 'User') if 'contact_info' in profile_data else 'User'

            # Add age, location, birthday context
            age = profile_data.get('age')
            location = profile_data.get('location')
            birthday = profile_data.get('birthday')

            # Build comprehensive profile context
            profile_context = []
            if bio:
                profile_context.append(f"Bio: '{bio}'")

            if interests:
                profile_context.append(f"Interests: {', '.join(interests)}")

            if hobbies:
                profile_context.append(f"Hobbies: {', '.join(hobbies)}")

            if age:
                profile_context.append(f"Age: {age}")

            if location:
                profile_context.append(f"Location: {location}")

            if birthday:
                profile_context.append(f"Birthday: {birthday}")

            # Add profile questions to context
            if profile_questions:
                profile_context.append("Profile Questions & Answers:")
                for question, answer in profile_questions.items():
                    if answer and str(answer).strip():  # Only include non-empty answers
                        profile_context.append(f"  Q: {question}")
                        profile_context.append(f"  A: {answer}")

            # Always include the user's name in the system prompt
            system_prompt += f"\n\nYou're talking to {name}."

            if profile_context:
                system_prompt += f" Here's their profile:\n" + "\n".join(profile_context)
                system_prompt += "\n\nUse this information to provide personalized, relevant responses and recommendations based on their location, age, interests, and the current time."

            # Prepare messages for OpenAI
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.message}
            ]

            # Get available real-time functions
            tools = realtime_service.get_available_functions() if realtime_service else None
            logger.info(f"Using enhanced OpenAI service with tools: {tools is not None}")

            # Get AI response with function calling capability
            response = await openai_service.chat_completion(
                messages=messages,
                model="gpt-4o-mini",
                temperature=0.7,
                max_tokens=500,
                tools=tools if tools else None
            )

            # Handle function calls if present
            if response.get("tool_calls"):
                # Execute function calls
                for tool_call in response["tool_calls"]:
                    function_name = tool_call["function"]["name"]
                    arguments = json.loads(tool_call["function"]["arguments"])

                    # Execute the function
                    function_result = await realtime_service.execute_function(function_name, arguments) if realtime_service else {"error": "Real-time service not available"}

                    # Add function result to messages
                    messages.append({
                        "role": "assistant",
                        "content": response["content"],
                        "tool_calls": [
                            {
                                "id": tc["id"],
                                "type": "function",
                                "function": tc["function"]
                            }
                            for tc in response["tool_calls"]
                        ]
                    })
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call["id"],
                        "content": json.dumps(function_result)
                    })

                # Get final response with function results
                final_response = await openai_service.chat_completion(
                    messages=messages,
                    model="gpt-4o-mini",
                    temperature=0.7,
                    max_tokens=500
                )

                return SimpleChatResponse(
                    message=final_response["content"],
                    intent="general_chat",
                    confidence=0.9
                )

            return SimpleChatResponse(
                message=response["content"],
                intent="general_chat",
                confidence=0.9
            )

        # If no profile data, use enhanced OpenAI with real-time capabilities
        import json
        import datetime

        # Add current time/date to system prompt
        now = datetime.datetime.now()
        current_time = now.strftime("%I:%M %p")
        current_date = now.strftime("%A, %B %d, %Y")

        system_prompt = f"""You are Strings, Lifestring's AI assistant. You can answer any questions the user has naturally and conversationally.

Current time: {current_time} on {current_date}.

You are having a conversation with a user on Lifestring. Here's how Lifestring works:

**YOU ARE STRINGS**: You are the AI that users chat with about what they want to do and who they want to meet.

**JOINS**: These are specific events/activities with set times and locations that users can join. When users tell you what they want to do, look for relevant Joins and recommend them.

**CONNECTIONS**: This is how users find friends - they get recommended people based on interests, location, and age. When users want to meet people, direct them to check their Connections.

**YOUR APPROACH**:
1. Answer general questions naturally (weather, time, jokes, etc.) - but ONLY respond with time when specifically asked "what time is it"
2. When users tell you what they want to do or activities they're interested in, recommend relevant Joins they can participate in
3. When users want to meet people or make friends, direct them to their Connections where they'll find recommended people
4. Have natural conversations about their interests and goals
5. NEVER mention external platforms like Meetup, Facebook, etc.
6. Focus on Lifestring's features: Joins for activities, Connections for meeting people

**REMEMBER**: You are Strings - the conversational AI. Users chat with you, and you help them discover Joins and Connections on Lifestring."""

        # Prepare messages for OpenAI
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": request.message}
        ]

        # Get available real-time functions
        tools = realtime_service.get_available_functions() if realtime_service else None
        logger.info(f"No profile data - using enhanced OpenAI service with tools: {tools is not None}")

        # Get AI response with function calling capability
        response = await openai_service.chat_completion(
            messages=messages,
            model="gpt-4o-mini",
            temperature=0.7,
            max_tokens=500,
            tools=tools if tools else None
        )

        # Handle function calls if present
        if response.get("tool_calls"):
            # Execute function calls
            for tool_call in response["tool_calls"]:
                function_name = tool_call["function"]["name"]
                arguments = json.loads(tool_call["function"]["arguments"])

                # Execute the function
                function_result = await realtime_service.execute_function(function_name, arguments) if realtime_service else {"error": "Real-time service not available"}

                # Add function result to messages
                messages.append({
                    "role": "assistant",
                    "content": response["content"],
                    "tool_calls": [
                        {
                            "id": tc["id"],
                            "type": "function",
                            "function": tc["function"]
                        }
                        for tc in response["tool_calls"]
                    ]
                })
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call["id"],
                    "content": json.dumps(function_result)
                })

            # Get final response with function results
            final_response = await openai_service.chat_completion(
                messages=messages,
                model="gpt-4o-mini",
                temperature=0.7,
                max_tokens=500
            )

            logger.info(f"AI response (with functions): {final_response['content']}")

            return SimpleChatResponse(
                message=final_response["content"],
                intent="general_chat",
                confidence=0.9
            )

        logger.info(f"AI response: {response['content']}")

        return SimpleChatResponse(
            message=response["content"],
            intent="general_chat",
            confidence=0.9
        )
    except Exception as e:
        logger.error(f"Error in AI chat: {str(e)}", exc_info=True)
        # Fallback response for any errors
        return SimpleChatResponse(
            message="I'm having trouble connecting right now. Please try again in a moment.",
            intent="general_chat",
            confidence=1.0
        )



@router.post("/ai/test-auth")
async def test_auth(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Test JWT authentication without database access."""
    try:
        from app.core.security import get_user_id_from_token
        token = credentials.credentials
        user_id = get_user_id_from_token(token)
        return {"success": True, "user_id": user_id, "message": "JWT authentication successful"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"JWT validation failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.get("/ai/debug-config")
async def debug_config():
    """Debug endpoint to check configuration."""
    from app.core.config import settings
    return {
        "jwt_secret_length": len(settings.SUPABASE_JWT_SECRET),
        "jwt_secret_start": settings.SUPABASE_JWT_SECRET[:20] + "...",
        "supabase_url": settings.SUPABASE_URL,
        "algorithm": settings.ALGORITHM
    }


@router.post("/ai/public-chat", response_model=EnhancedChatResponse)
async def public_ai_chat(
    request: EnhancedChatRequest,
    db: Session = Depends(get_db)
):
    """
    Public AI chat endpoint for testing (no authentication required).
    Uses the enhanced Lifestring AI service with Connected Strings search.
    """
    try:
        # Create a mock user for public endpoint (required by process_user_message)
        from app.models.user import User
        import uuid
        mock_user = User(
            user_id=uuid.uuid4(),
            contact_info={
                "email": "public@example.com",
                "name": "Public User"
            },
            attributes={},
            biography={},
            meta={}
        )

        # Use the enhanced Lifestring AI service with database access
        response = await lifestring_ai.process_user_message(
            message=request.message,
            user=mock_user,
            conversation_history=None,
            context=request.context,
            db_session=db  # Pass database session for Connected Strings search
        )

        # Convert AIResponse to EnhancedChatResponse format
        # Convert AIAction objects to dictionaries
        actions_dict = []
        for action in response.actions:
            actions_dict.append({
                "type": action.type.value if hasattr(action.type, 'value') else str(action.type),
                "data": action.data,
                "description": action.description
            })

        return EnhancedChatResponse(
            message=response.message,
            intent=response.intent.value if hasattr(response.intent, 'value') else str(response.intent),
            confidence=response.confidence,
            actions=actions_dict,
            suggested_strings=response.suggested_strings,
            suggested_connections=response.suggested_connections,
            suggested_joins=response.suggested_joins,
            tokens=0,  # AIResponse doesn't track tokens
            cost=0.0   # AIResponse doesn't track cost
        )

    except Exception as e:
        print(f"Error in public_ai_chat: {e}")
        return EnhancedChatResponse(
            message="I'm having trouble connecting right now. Please try again in a moment.",
            intent="error",
            confidence=1.0,
            actions=[],
            suggested_strings=[],
            suggested_connections=[],
            suggested_joins=[],
            tokens=0,
            cost=0.0
        )


@router.post("/ai/lifestring-chat-test", response_model=EnhancedChatResponse)
async def lifestring_ai_chat_test(request: EnhancedChatRequest):
    """
    TEST ENDPOINT: Enhanced AI chat with Lifestring-specific features (no auth required).
    Returns structured responses with actions for Strings, Connections, and Joins.
    """
    try:
        # Use a test user ID for testing
        user_id = "6d259f2e-189c-4d31-a6bd-139ccd986b30"  # Phoebe's user ID for testing

        # Use profile data from request if provided (either directly or in context), otherwise fetch from database
        profile_data = None
        if hasattr(request, 'profile_data') and request.profile_data:
            profile_data = request.profile_data
            print(f"Using profile data from request.profile_data: {profile_data}")
        elif request.context and 'profile_data' in request.context:
            profile_data = request.context.get('profile_data')
            print(f"Using profile data from request.context: {profile_data}")

        if not profile_data:
            # Fetch user profile data from Supabase REST API
            import httpx
            try:
                async with httpx.AsyncClient() as client:
                    # Try detailed_profiles first (where the frontend actually saves data)
                    headers = {
                        "apikey": settings.SUPABASE_ANON_KEY,
                        "Content-Type": "application/json"
                    }

                    response = await client.get(
                        f"{settings.SUPABASE_URL}/rest/v1/detailed_profiles?user_id=eq.{user_id}",
                        headers=headers
                    )
                    if response.status_code == 200:
                        detailed_profiles = response.json()
                        if detailed_profiles:
                            detailed_profile = detailed_profiles[0]
                            profile_data = {
                                "bio": detailed_profile.get('bio', ''),
                                "interests": detailed_profile.get('interests', []) or [],
                                "passions": detailed_profile.get('passions', []) or [],
                                "hobbies": detailed_profile.get('hobbies', []) or [],
                                "skills": detailed_profile.get('skills', []) or [],
                                "contact_info": {"name": detailed_profile.get('name', detailed_profile.get('full_name', 'Phoebe'))}
                            }
                            print(f"Loaded profile from detailed_profiles: {profile_data}")
            except Exception as e:
                print(f"Error fetching profile: {e}")
                # Fallback to test data
                profile_data = {
                    "bio": "I love climbing",
                    "interests": ["climbing"],
                    "passions": ["climbing", "hiking", "photography"],
                    "hobbies": ["camping", "hiking", "rock climbing", "photography"],
                    "skills": [],
                    "contact_info": {"name": "Phoebe"}
                }

        # Handle profile-specific queries
        message_lower = request.message.lower()
        if "passions" in message_lower or "interests" in message_lower or "hobbies" in message_lower:
            if profile_data:
                interests = profile_data.get('interests', []) or []
                passions = profile_data.get('passions', []) or []
                hobbies = profile_data.get('hobbies', []) or []
                bio = profile_data.get('bio', '') or ''

                # If asking specifically about passions
                if "passions" in message_lower:
                    if passions:
                        passions_text = ", ".join(passions)
                        message = f"Based on your profile, your passions include: {passions_text}!"
                        if bio:
                            message += f" Your bio says: '{bio}'"
                        message += " Would you like to explore these passions further or connect with others who share them?"
                    else:
                        message = "I don't see any passions listed in your profile yet. You can add them in your profile settings to help me provide more personalized suggestions!"

                    return EnhancedChatResponse(
                        message=message,
                        intent="profile_inquiry",
                        confidence=0.95,
                        actions=[],
                        suggested_strings=[],
                        suggested_connections=[],
                        suggested_joins=[],
                        tokens=50,
                        cost=0.0001
                    )

                # If asking specifically about hobbies
                elif "hobbies" in message_lower:
                    if hobbies:
                        hobbies_text = ", ".join(hobbies)
                        message = f"Based on your profile, your hobbies include: {hobbies_text}."
                    else:
                        message = "I don't see any hobbies listed in your profile yet. You can add them in your profile settings to help me provide more personalized suggestions!"

                    return EnhancedChatResponse(
                        message=message,
                        intent="profile_inquiry",
                        confidence=0.95,
                        actions=[],
                        suggested_strings=[],
                        suggested_connections=[],
                        suggested_joins=[],
                        tokens=50,
                        cost=0.0001
                    )

                # For interests query
                else:
                    all_interests = list(set(interests + passions))
                    if all_interests:
                        interests_text = ", ".join(all_interests)
                        message = f"Based on your profile, I can see you're interested in: {interests_text}!"
                        if bio:
                            message += f" Your bio says: '{bio}'"
                        message += " Would you like to explore these interests further or connect with others who share them?"
                    else:
                        message = "I don't see any specific interests listed in your profile yet. You can add them in your profile settings to help me provide more personalized suggestions!"

                    return EnhancedChatResponse(
                        message=message,
                        intent="profile_inquiry",
                        confidence=0.95,
                        actions=[],
                        suggested_strings=[],
                        suggested_connections=[],
                        suggested_joins=[],
                        tokens=100,
                        cost=0.0002
                    )

        # For other messages, use OpenAI with personalized context
        from openai import OpenAI

        # Build comprehensive personalized system prompt
        system_prompt = """You are a helpful AI assistant for Lifestring, a platform that helps people connect based on shared interests and experiences. You help users create "strings" - posts that help them find activities, connections, and communities.

IMPORTANT: Never mention external platforms like Meetup, Facebook, Instagram, or other social networks. Always focus on Lifestring's features and community."""

        if profile_data:
            interests = profile_data.get('interests', []) or []
            passions = profile_data.get('passions', []) or []
            hobbies = profile_data.get('hobbies', []) or []
            bio = profile_data.get('bio', '') or ''
            skills = profile_data.get('skills', []) or []
            name = profile_data.get('contact_info', {}).get('name', 'User') if 'contact_info' in profile_data else 'Phoebe'

            # Build comprehensive profile context
            profile_context = []
            if bio:
                profile_context.append(f"Bio: '{bio}'")

            all_interests = list(set(interests + passions))
            if all_interests:
                profile_context.append(f"Interests/Passions: {', '.join(all_interests)}")

            if hobbies:
                profile_context.append(f"Hobbies: {', '.join(hobbies)}")

            if skills:
                profile_context.append(f"Skills: {', '.join(skills)}")

            # Always include the user's name in the system prompt
            system_prompt += f"\n\nYou're talking to {name}."

            if profile_context:
                system_prompt += f" Here's their profile:\n" + "\n".join(profile_context)
                system_prompt += "\n\nUse this information to provide personalized suggestions for activities, connections, and communities. When they ask about creating strings or finding people, reference their interests and suggest specific activities or groups they might enjoy."

        # Call OpenAI API
        client = OpenAI(api_key=settings.OPENAI_API_KEY)

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.message}
            ],
            max_tokens=500,
            temperature=0.7
        )

        ai_response = response.choices[0].message.content

        return EnhancedChatResponse(
            message=ai_response,
            intent="general_chat",
            confidence=0.9,
            actions=[],
            suggested_strings=[],
            suggested_connections=[],
            suggested_joins=[],
            tokens=response.usage.total_tokens if response.usage else 500,
            cost=0.001
        )

    except Exception as e:
        print(f"Error in lifestring_ai_chat_test: {e}")
        return EnhancedChatResponse(
            message="I'm having trouble connecting right now. Please try again in a moment.",
            intent="error",
            confidence=1.0,
            actions=[],
            suggested_strings=[],
            suggested_connections=[],
            suggested_joins=[],
            tokens=0,
            cost=0.0
        )

@router.post("/ai/lifestring-chat", response_model=EnhancedChatResponse)
async def lifestring_ai_chat(
    request: EnhancedChatRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Enhanced AI chat with Lifestring-specific features.
    Returns structured responses with actions for Strings, Connections, and Joins.
    """
    try:
        # Verify JWT token
        from app.core.security import get_user_id_from_token
        token = credentials.credentials
        user_id = get_user_id_from_token(token)

        # Use profile data from request if provided (either directly or in context), otherwise fetch from database
        profile_data = None
        if hasattr(request, 'profile_data') and request.profile_data:
            profile_data = request.profile_data
            print(f"Using profile data from request.profile_data: {profile_data}")
        elif request.context and 'profile_data' in request.context:
            profile_data = request.context.get('profile_data')
            print(f"Using profile data from request.context: {profile_data}")

        if not profile_data:
            # Fetch user profile data from Supabase REST API
            import httpx
        try:
            async with httpx.AsyncClient() as client:
                # Try detailed_profiles first (where the frontend actually saves data)
                # Use both anon key and user JWT token for RLS policies
                headers = {
                    "apikey": settings.SUPABASE_ANON_KEY,
                    "Content-Type": "application/json"
                }
                # Add user JWT token if available for RLS policies
                if token:
                    headers["Authorization"] = f"Bearer {token}"

                response = await client.get(
                    f"{settings.SUPABASE_URL}/rest/v1/detailed_profiles?user_id=eq.{user_id}",
                    headers=headers
                )
                if response.status_code == 200:
                    detailed_profiles = response.json()
                    if detailed_profiles:
                        detailed_profile = detailed_profiles[0]
                        profile_data = {
                            "bio": detailed_profile.get('bio', ''),
                            "interests": detailed_profile.get('interests', []) or [],
                            "passions": detailed_profile.get('passions', []) or [],
                            "hobbies": detailed_profile.get('hobbies', []) or [],
                            "contact_info": {"name": detailed_profile.get('name', detailed_profile.get('full_name', 'User'))}
                        }
                        print(f"Loaded profile from detailed_profiles: {profile_data}")

                # If no detailed_profiles data, try user_profiles as fallback
                if not profile_data:
                    response = await client.get(
                        f"{settings.SUPABASE_URL}/rest/v1/user_profiles?user_id=eq.{user_id}",
                        headers=headers
                    )
                    if response.status_code == 200:
                        user_profiles = response.json()
                        if user_profiles:
                            user_profile = user_profiles[0]
                            # Map user_profiles structure to our expected format
                            profile_data = {
                                "bio": user_profile.get('biography', {}).get('bio', ''),
                                "interests": user_profile.get('attributes', {}).get('interests', []),
                                "passions": user_profile.get('attributes', {}).get('passions', []),
                                "hobbies": user_profile.get('attributes', {}).get('hobbies', []),
                                "contact_info": user_profile.get('contact_info', {})
                            }
                            print(f"Loaded profile from user_profiles: {profile_data}")
        except Exception as e:
            print(f"Error fetching profile: {e}")
            # Fallback to known data for this user
            if user_id == "a90f0ea5-ba98-44f5-a3a7-a922db9e1523":
                profile_data = {
                    "bio": "I love climbing",
                    "interests": ["climbing"],
                    "passions": ["climbing"],
                    "hobbies": ["camping", "hiking", "rock climbing", "photography"],
                    "contact_info": {"name": "Phoebe Troup-Galligan"}
                }

        # Handle simple utility queries first
        message_lower = request.message.lower()

        # Handle time requests
        if any(keyword in message_lower for keyword in ['time', 'clock', 'what time', 'current time']):
            from datetime import datetime
            import pytz

            # Default to UTC, but could be enhanced with user timezone
            current_time = datetime.now(pytz.UTC)
            time_str = current_time.strftime("%I:%M %p UTC on %B %d, %Y")

            return EnhancedChatResponse(
                message=f"The current time is {time_str}.",
                intent="time_inquiry",
                confidence=0.95,
                actions=[],
                suggested_strings=[],
                suggested_connections=[],
                suggested_joins=[],
                tokens=len(f"The current time is {time_str}.".split()),
                cost=0.0001
            )

        # Handle profile-specific queries
        if "passions" in message_lower or "interests" in message_lower or "hobbies" in message_lower:
            if profile_data:
                interests = profile_data.get('interests', []) or []
                passions = profile_data.get('passions', []) or []
                hobbies = profile_data.get('hobbies', []) or []
                bio = profile_data.get('bio', '') or ''

                # If asking specifically about passions
                if "passions" in message_lower:
                    if passions:
                        passions_text = ", ".join(passions)
                        message = f"Based on your profile, your passions include: {passions_text}!"
                        if bio:
                            message += f" Your bio says: '{bio}'"
                        message += " Would you like to explore these passions further or connect with others who share them?"
                    else:
                        message = "I don't see any passions listed in your profile yet. You can add them in your profile settings to help me provide more personalized suggestions!"

                    return EnhancedChatResponse(
                        message=message,
                        intent="profile_inquiry",
                        confidence=0.95,
                        actions=[],
                        suggested_strings=[],
                        suggested_connections=[],
                        suggested_joins=[],
                        tokens=50,
                        cost=0.0001
                    )

                # If asking specifically about hobbies
                if "hobbies" in message_lower:
                    if hobbies:
                        hobbies_text = ", ".join(hobbies)
                        message = f"Based on your profile, your hobbies include: {hobbies_text}."
                    else:
                        message = "I don't see any hobbies listed in your profile yet. You can add them in your profile settings to help me provide more personalized suggestions!"

                    return EnhancedChatResponse(
                        message=message,
                        intent="profile_inquiry",
                        confidence=0.95,
                        actions=[],
                        suggested_strings=[],
                        suggested_connections=[],
                        suggested_joins=[],
                        tokens=50,
                        cost=0.0001
                    )

                # For interests query
                all_interests = list(set(interests + passions))
                if all_interests:
                    interests_text = ", ".join(all_interests)
                    message = f"Based on your profile, I can see you're interested in: {interests_text}!"
                    if bio:
                        message += f" Your bio says: '{bio}'"
                    message += " Would you like to explore these interests further or connect with others who share them?"
                else:
                    message = "I don't see any specific interests listed in your profile yet. You can add them in your profile settings to help me provide more personalized suggestions!"

                return EnhancedChatResponse(
                    message=message,
                    intent="profile_inquiry",
                    confidence=0.95,
                    actions=[],
                    suggested_strings=[],
                    suggested_connections=[],
                    suggested_joins=[],
                    tokens=100,
                    cost=0.0002
                )
            else:
                return EnhancedChatResponse(
                    message="I'm having trouble accessing your profile right now. You can add interests and hobbies in your profile settings to help me provide personalized suggestions!",
                    intent="profile_inquiry",
                    confidence=0.8,
                    actions=[],
                    suggested_strings=[],
                    suggested_connections=[],
                    suggested_joins=[],
                    tokens=50,
                    cost=0.0001
                )

        # For other messages, use enhanced OpenAI with real-time capabilities and personalized context
        from datetime import datetime
        import json

        # Build comprehensive personalized system prompt with current time
        current_time = datetime.now()
        system_prompt = f"""You are Strings, Lifestring's AI assistant. The current time is {current_time.strftime('%H:%M UTC, %I:%M %p %Z')} on {current_time.strftime('%A, %B %d, %Y')}.

You are having a conversation with a user on Lifestring. Here's how Lifestring works:

**YOU ARE STRINGS**: You are the AI that users chat with about what they want to do and who they want to meet.

**JOINS**: These are specific events/activities with set times and locations that users can join. When users tell you what they want to do, look for relevant Joins and recommend them.

**CONNECTIONS**: This is how users find friends - they get recommended people based on interests, location, and age. When users want to meet people, direct them to check their Connections.

**YOUR APPROACH**:
1. Answer general questions naturally (weather, time, jokes, etc.) using real-time data - but ONLY respond with time when specifically asked "what time is it"
2. When users tell you what they want to do or activities they're interested in, recommend relevant Joins they can participate in
3. When users want to meet people or make friends, direct them to their Connections where they'll find recommended people
4. Have natural conversations about their interests and goals
5. NEVER mention external platforms like Meetup, Facebook, etc.
6. Focus on Lifestring's features: Joins for activities, Connections for meeting people

**REMEMBER**: You are Strings - the conversational AI. Users chat with you, and you help them discover Joins and Connections on Lifestring."""

        if profile_data:
            interests = profile_data.get('interests', []) or []
            hobbies = profile_data.get('hobbies', []) or []
            bio = profile_data.get('bio', '') or ''
            location = profile_data.get('location', '') or ''
            age = profile_data.get('age', '') or ''
            birthday = profile_data.get('birthday', '') or ''
            work = profile_data.get('work', '') or ''
            goals = profile_data.get('goals', '') or ''
            dreams = profile_data.get('dreams', '') or ''
            profile_questions = profile_data.get('profile_questions', {}) or {}
            name = profile_data.get('contact_info', {}).get('name', 'User') if profile_data and 'contact_info' in profile_data else 'User'
            print(f"DEBUG: Extracted name for authenticated endpoint: '{name}' from profile_data: {profile_data}")
            print(f"DEBUG: Profile questions found: {len(profile_questions)} answers")

            # Build comprehensive profile context
            profile_context = []
            if bio:
                profile_context.append(f"Bio: '{bio}'")

            if interests:
                profile_context.append(f"Interests: {', '.join(interests)}")

            if hobbies:
                profile_context.append(f"Hobbies: {', '.join(hobbies)}")

            if location:
                profile_context.append(f"Location: {location}")

            if age:
                profile_context.append(f"Age: {age}")

            if birthday:
                profile_context.append(f"Birthday: {birthday}")

            if work:
                profile_context.append(f"Work: {work}")

            if goals:
                profile_context.append(f"Goals: {goals}")

            if dreams:
                profile_context.append(f"Dreams: {dreams}")

            # Add profile questions to context
            if profile_questions:
                profile_context.append("Profile Questions & Answers:")
                for question, answer in profile_questions.items():
                    if answer and str(answer).strip():  # Only include non-empty answers
                        profile_context.append(f"  Q: {question}")
                        profile_context.append(f"  A: {answer}")

            # Always include the user's name in the system prompt
            system_prompt += f"\n\nYou're talking to {name}."

            if profile_context:
                system_prompt += f" Here's their profile:\n" + "\n".join(profile_context)
                system_prompt += "\n\nUse this profile information to provide personalized recommendations, especially when they ask about activities, weather-related suggestions, or local events. Consider their location, age, interests, and hobbies when making suggestions."
        else:
            system_prompt += "\n\nBe friendly and helpful. If the user mentions interests, encourage them to add them to their profile for more personalized suggestions."

        # Use enhanced OpenAI service with real-time capabilities
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": request.message}
        ]

        # Get available real-time functions
        tools = realtime_service.get_available_functions() if realtime_service else None
        logger.info(f"Authenticated endpoint using enhanced OpenAI service with tools: {tools is not None}")

        # Get AI response with function calling capability
        response = await openai_service.chat_completion(
            messages=messages,
            tools=tools,
            model="gpt-4o-mini",
            max_tokens=500,
            temperature=0.7
        )

        # Handle function calls if present
        if response.get("tool_calls"):
            logger.info(f"Processing {len(response['tool_calls'])} function calls")

            for tool_call in response["tool_calls"]:
                function_name = tool_call["function"]["name"]
                arguments = json.loads(tool_call["function"]["arguments"])

                # Execute the function
                function_result = await realtime_service.execute_function(function_name, arguments) if realtime_service else {"error": "Real-time service not available"}

                # Add function result to messages
                messages.append({
                    "role": "assistant",
                    "content": response["content"],
                    "tool_calls": [
                        {
                            "id": tc["id"],
                            "type": "function",
                            "function": tc["function"]
                        }
                        for tc in response["tool_calls"]
                    ]
                })

                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call["id"],
                    "content": json.dumps(function_result)
                })

            # Get final response with function results
            final_response = await openai_service.chat_completion(
                messages=messages,
                model="gpt-4o-mini",
                max_tokens=500,
                temperature=0.7
            )

            ai_response = final_response["content"]
        else:
            ai_response = response["content"]

        return EnhancedChatResponse(
            message=ai_response,
            intent="general_chat",
            confidence=0.9,
            actions=[],
            suggested_strings=[],
            suggested_connections=[],
            suggested_joins=[],
            tokens=response.get("tokens", 500),
            cost=response.get("cost", 0.001)
        )

    except HTTPException:
        # Re-raise HTTP exceptions (like 401 Unauthorized) so they return proper status codes
        raise
    except Exception as e:
        print(f"Error in lifestring_ai_chat: {e}")
        # Fallback to public endpoint
        return EnhancedChatResponse(
            message="I'm having trouble connecting right now. Please try again in a moment.",
            intent="error",
            confidence=1.0,
            actions=[],
            suggested_strings=[],
            suggested_connections=[],
            suggested_joins=[],
            tokens=0,
            cost=0.0
        )


@router.post("/ai/summarize-to-string")
async def summarize_conversation_to_string(
    room_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Summarize a conversation into a potential string/post.
    """
    # Get room and verify access
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room or not room.has_participant(current_user.user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found or access denied"
        )

    # Get conversation history
    messages = db.query(Message).filter(
        Message.room_id == room_id
    ).order_by(Message.created_at).all()

    # Convert to format for AI service
    conversation = []
    for msg in messages:
        role = "assistant" if msg.user_id == settings.AI_BOT_USER_ID else "user"
        conversation.append({"role": role, "content": msg.content})

    # Generate string suggestion
    string_suggestion = await lifestring_ai.summarize_conversation_to_string(
        conversation=conversation,
        user=current_user
    )

    return {
        "string_suggestion": string_suggestion,
        "room_id": room_id
    }


@router.post("/ai/execute-action")
async def execute_ai_action(
    action_type: str,
    action_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Execute an AI-suggested action.
    """
    action_handler = create_action_handler(db)

    result = await action_handler.execute_action(
        action_type=action_type,
        action_data=action_data,
        current_user=current_user
    )

    return result


def build_system_prompt(user: User, context: Dict[str, Any]) -> str:
    """Build system prompt with user context and detailed profile data."""
    import datetime

    # Get current time information
    now = datetime.datetime.now()
    current_time = now.strftime("%I:%M %p")
    current_date = now.strftime("%A, %B %d, %Y")

    prompt_parts = [
        "You are a helpful AI assistant for Lifestring, a social networking platform.",
        f"You are chatting with {user.name or 'a user'}.",
        f"Current time: {current_time} on {current_date}."
    ]

    # Check for detailed profile data in context
    detailed_profile = context.get('detailed_profile') if context else None
    profile_data = context.get('profile_data') if context else None

    # Use profile_data if available (from frontend), otherwise detailed_profile
    profile = profile_data or detailed_profile

    if profile:
        # Add location-based context
        if profile.get('location'):
            prompt_parts.append(f"Their location: {profile['location']}.")

        # Add age context
        if profile.get('age'):
            prompt_parts.append(f"Their age: {profile['age']}.")

        # Add birthday context
        if profile.get('birthday'):
            prompt_parts.append(f"Their birthday: {profile['birthday']}.")

        # Use detailed profile data for richer context
        if profile.get('bio'):
            prompt_parts.append(f"About them: {profile['bio']}")

        if profile.get('interests'):
            interests = profile['interests']
            if isinstance(interests, list) and interests:
                prompt_parts.append(f"Their interests include: {', '.join(interests)}.")

        if profile.get('hobbies'):
            hobbies = profile['hobbies']
            if isinstance(hobbies, list) and hobbies:
                prompt_parts.append(f"Their hobbies include: {', '.join(hobbies)}.")

        if profile.get('passions'):
            passions = profile['passions']
            if isinstance(passions, list) and passions:
                prompt_parts.append(f"Their passions include: {', '.join(passions)}.")

        if profile.get('skills'):
            skills = profile['skills']
            if isinstance(skills, list) and skills:
                prompt_parts.append(f"Their skills include: {', '.join(skills)}.")

        if profile.get('goals'):
            prompt_parts.append(f"Their goals: {profile['goals']}")

        if profile.get('dreams'):
            prompt_parts.append(f"Their dreams: {profile['dreams']}")
    else:
        # Fallback to basic user data
        if hasattr(user, 'interests') and user.interests:
            prompt_parts.append(f"Their interests include: {', '.join(user.interests)}.")

        if hasattr(user, 'passions') and user.passions:
            prompt_parts.append(f"Their passions include: {', '.join(user.passions)}.")

    prompt_parts.append("Use this information to provide personalized, relevant responses and recommendations based on their location, age, interests, and the current time.")
    prompt_parts.append("When asked about time, provide the current time. When making recommendations, consider their location and age.")
    prompt_parts.append("Be friendly, helpful, and concise.")

    return " ".join(prompt_parts)

