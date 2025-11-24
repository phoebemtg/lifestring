"""
Hybrid AI Service for Lifestring.
Intelligently routes queries between Gemini and GPT based on query type and complexity.
"""
import logging
from typing import List, Dict, Any, Optional
import re
from enum import Enum

from app.services.openai_service import openai_service
from app.services.gemini_service import gemini_service
from app.core.config import settings

logger = logging.getLogger(__name__)


class QueryType(str, Enum):
    """Types of queries for routing decisions."""
    REALTIME_EVENTS = "realtime_events"
    GENERAL_CHAT = "general_chat"
    PROFILE_MATCHING = "profile_matching"
    CREATIVE_WRITING = "creative_writing"
    COMPLEX_REASONING = "complex_reasoning"
    SIMPLE_QUESTION = "simple_question"


class ModelChoice(str, Enum):
    """Available AI models."""
    GEMINI = "gemini"
    GPT = "gpt"
    AUTO = "auto"


class HybridAIService:
    """Hybrid AI service that routes queries to the best model."""
    
    def __init__(self):
        """Initialize hybrid service."""
        # Import services
        from app.services.gemini_service import gemini_service
        from app.services.openai_service import openai_service

        self.gemini_service = gemini_service
        self.openai_service = openai_service
        self.gemini_enabled = gemini_service.enabled
        self.gpt_enabled = bool(settings.OPENAI_API_KEY)

        logger.info(f"Hybrid AI Service initialized - Gemini: {self.gemini_enabled}, GPT: {self.gpt_enabled}")
    
    def _classify_query(self, messages: List[Dict[str, str]], context: Dict[str, Any] = None) -> QueryType:
        """Classify the query type to determine best model."""
        if not messages:
            return QueryType.GENERAL_CHAT
        
        # Get the latest user message
        user_message = ""
        for msg in reversed(messages):
            if msg.get("role") == "user":
                user_message = msg.get("content", "").lower()
                break
        
        # Real-time/Events queries (Gemini excels with built-in search)
        realtime_keywords = [
            "events", "happening", "today", "tomorrow", "weekend", "this week",
            "weather", "news", "current", "latest", "now", "recent",
            "what's going on", "activities", "concerts", "shows", "live music",
            "playing", "performing", "tickets", "tix", "venue", "theater", "theatre"
        ]
        
        if any(keyword in user_message for keyword in realtime_keywords):
            return QueryType.REALTIME_EVENTS
        
        # Profile matching and connections (GPT excels at reasoning)
        profile_keywords = [
            "find people", "connections", "match", "similar interests",
            "profile", "compatibility", "recommend users", "meet people"
        ]
        
        if any(keyword in user_message for keyword in profile_keywords):
            return QueryType.PROFILE_MATCHING
        
        # Creative writing (GPT excels at creativity)
        creative_keywords = [
            "write", "create", "compose", "draft", "story", "poem",
            "creative", "imagine", "describe", "elaborate"
        ]
        
        if any(keyword in user_message for keyword in creative_keywords):
            return QueryType.CREATIVE_WRITING
        
        # Complex reasoning (GPT excels at logic)
        complex_keywords = [
            "analyze", "compare", "explain why", "reasoning", "logic",
            "complex", "detailed analysis", "pros and cons", "evaluate"
        ]
        
        if any(keyword in user_message for keyword in complex_keywords):
            return QueryType.COMPLEX_REASONING
        
        # Simple questions (Gemini is faster and cheaper)
        if len(user_message.split()) <= 10 and ("?" in user_message or user_message.startswith(("what", "how", "when", "where", "who"))):
            return QueryType.SIMPLE_QUESTION
        
        # Default to general chat
        return QueryType.GENERAL_CHAT
    
    def _choose_model(self, query_type: QueryType, force_model: Optional[ModelChoice] = None) -> ModelChoice:
        """Choose the best model based on query type and availability."""
        
        # Honor force_model if specified
        if force_model and force_model != ModelChoice.AUTO:
            if force_model == ModelChoice.GEMINI and self.gemini_enabled:
                return ModelChoice.GEMINI
            elif force_model == ModelChoice.GPT and self.gpt_enabled:
                return ModelChoice.GPT
        
        # If only one model is available, use it
        if self.gemini_enabled and not self.gpt_enabled:
            return ModelChoice.GEMINI
        elif self.gpt_enabled and not self.gemini_enabled:
            return ModelChoice.GPT
        elif not self.gemini_enabled and not self.gpt_enabled:
            raise Exception("No AI models available")
        
        # Both models available - choose based on query type
        gemini_preferred = {
            QueryType.REALTIME_EVENTS,  # Built-in web search
            QueryType.SIMPLE_QUESTION,  # Faster and cheaper
            QueryType.GENERAL_CHAT      # Cost effective
        }
        
        gpt_preferred = {
            QueryType.PROFILE_MATCHING,  # Better reasoning
            QueryType.CREATIVE_WRITING,  # Better creativity
            QueryType.COMPLEX_REASONING  # Superior logic
        }
        
        if query_type in gemini_preferred and settings.USE_GEMINI_FOR_REALTIME:
            return ModelChoice.GEMINI
        elif query_type in gpt_preferred:
            return ModelChoice.GPT
        else:
            # Default to Gemini for cost savings
            return ModelChoice.GEMINI if settings.USE_GEMINI_FOR_REALTIME else ModelChoice.GPT
    
    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 500,
        tools: Optional[List[Dict[str, Any]]] = None,
        context: Dict[str, Any] = None,
        force_model: Optional[ModelChoice] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Create chat completion using the best model for the query.
        
        Args:
            messages: List of message dicts
            model: Specific model to use (overrides auto-selection)
            temperature: Sampling temperature
            max_tokens: Maximum tokens
            tools: Available tools/functions
            context: Additional context for routing decisions
            force_model: Force use of specific AI provider
            **kwargs: Additional parameters
            
        Returns:
            Dict with response, model info, and routing decision
        """
        try:
            # Classify query and choose model
            query_type = self._classify_query(messages, context)
            chosen_model = self._choose_model(query_type, force_model)
            
            logger.info(f"Query classified as {query_type.value}, routing to {chosen_model.value}")
            
            # Route to appropriate service
            if chosen_model == ModelChoice.GEMINI:
                # Use Gemini with built-in search for real-time queries
                use_search = query_type == QueryType.REALTIME_EVENTS
                
                response = await self.gemini_service.chat_completion(
                    messages=messages,
                    model=model or settings.GEMINI_MODEL,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    tools=tools,
                    use_search=use_search,
                    **kwargs
                )
                
                response["provider"] = "gemini"
                response["query_type"] = query_type.value
                response["routing_reason"] = f"Gemini chosen for {query_type.value}"
                
            else:  # GPT
                response = await self.openai_service.chat_completion(
                    messages=messages,
                    model=model or settings.CHAT_MODEL,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    tools=tools,
                    **kwargs
                )
                
                response["provider"] = "openai"
                response["query_type"] = query_type.value
                response["routing_reason"] = f"GPT chosen for {query_type.value}"
            
            return response
            
        except Exception as e:
            logger.error(f"Hybrid AI service error: {e}")
            
            # Fallback to available model
            if self.gpt_enabled and chosen_model != ModelChoice.GPT:
                logger.info("Falling back to GPT")
                response = await self.openai_service.chat_completion(
                    messages=messages,
                    model=model or settings.CHAT_MODEL_FALLBACK,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    tools=tools,
                    **kwargs
                )
                response["provider"] = "openai_fallback"
                response["routing_reason"] = "Fallback to GPT after error"
                return response
            
            raise e


# Global instance
hybrid_ai_service = HybridAIService()
