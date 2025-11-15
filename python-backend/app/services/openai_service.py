"""
OpenAI service for AI chat and embeddings.
"""
from typing import List, Dict, Any, Optional, AsyncGenerator
from openai import AsyncOpenAI
import hashlib
import json

from app.core.config import settings


class OpenAIService:
    """Service for interacting with OpenAI API."""
    
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY,
            organization=settings.OPENAI_ORG_ID if settings.OPENAI_ORG_ID else None
        )
    
    async def create_embedding(self, text: str, model: Optional[str] = None) -> List[float]:
        """
        Create embedding for text.
        
        Args:
            text: Text to embed
            model: Model to use (default from settings)
            
        Returns:
            List of floats representing the embedding
        """
        if not model:
            model = settings.EMBED_MODEL
        
        response = await self.client.embeddings.create(
            model=model,
            input=text
        )
        
        return response.data[0].embedding
    
    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 500,
        tools: Optional[List[Dict[str, Any]]] = None,
        use_fallback: bool = True,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Create chat completion with optional function calling and model fallback.

        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Model to use (default from settings)
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            tools: List of available tools/functions
            use_fallback: Whether to use fallback model on error
            **kwargs: Additional parameters

        Returns:
            Dict with 'content', 'tokens', 'cost', and optional 'tool_calls'
        """
        if not model:
            model = settings.CHAT_MODEL

        # Prepare request parameters
        request_params = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            **kwargs
        }

        # Add tools if provided
        if tools:
            request_params["tools"] = tools
            request_params["tool_choice"] = "auto"

        try:
            response = await self.client.chat.completions.create(**request_params)
        except Exception as e:
            # Try fallback model if enabled and not already using fallback
            if use_fallback and model != settings.CHAT_MODEL_FALLBACK:
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Primary model {model} failed, trying fallback: {e}")

                request_params["model"] = settings.CHAT_MODEL_FALLBACK
                model = settings.CHAT_MODEL_FALLBACK
                response = await self.client.chat.completions.create(**request_params)
            else:
                raise e

        content = response.choices[0].message.content
        tokens = response.usage.total_tokens

        # Calculate cost based on model
        if model == "gpt-4o":
            # GPT-4o pricing: Input: $2.50/1M, Output: $10.00/1M, Average: ~$6.25/1M
            cost = (tokens / 1_000_000) * 6.25
        elif model == "gpt-4o-mini":
            # GPT-4o-mini pricing: Input: $0.150/1M, Output: $0.600/1M, Average: $0.375/1M
            cost = (tokens / 1_000_000) * 0.375
        else:
            # Default fallback pricing (assume GPT-4o pricing)
            cost = (tokens / 1_000_000) * 6.25

        result = {
            "content": content,
            "tokens": tokens,
            "cost": cost,
            "model": model
        }

        # Add tool calls if present
        if response.choices[0].message.tool_calls:
            result["tool_calls"] = [
                {
                    "id": tool_call.id,
                    "type": "function",  # Add the missing type parameter
                    "function": {
                        "name": tool_call.function.name,
                        "arguments": tool_call.function.arguments
                    }
                }
                for tool_call in response.choices[0].message.tool_calls
            ]

        return result
    
    async def chat_completion_stream(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 500,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """
        Create streaming chat completion.
        
        Args:
            messages: List of message dicts
            model: Model to use
            temperature: Sampling temperature
            max_tokens: Maximum tokens
            **kwargs: Additional parameters
            
        Yields:
            Content chunks as they arrive
        """
        if not model:
            model = settings.CHAT_MODEL
        
        stream = await self.client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True,
            **kwargs
        )
        
        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
    
    @staticmethod
    def generate_content_hash(content: str) -> str:
        """
        Generate hash for content to detect changes.
        
        Args:
            content: Content to hash
            
        Returns:
            SHA256 hash of content
        """
        return hashlib.sha256(content.encode()).hexdigest()
    
    @staticmethod
    def serialize_for_embedding(data: Dict[str, Any]) -> str:
        """
        Serialize data for embedding generation.
        
        Args:
            data: Data to serialize
            
        Returns:
            String representation of data
        """
        return json.dumps(data, sort_keys=True, ensure_ascii=False)


# Create global instance
openai_service = OpenAIService()

