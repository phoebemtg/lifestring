"""
Google Gemini AI Service for Lifestring.
Provides chat completion, function calling, and built-in web search capabilities.
"""
import logging
from typing import List, Dict, Any, Optional, AsyncGenerator
import json
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold, Tool
# Import new SDK for Google Search grounding
from google import genai as new_genai
from google.genai import types as new_types
import asyncio
from concurrent.futures import ThreadPoolExecutor

from app.core.config import settings

logger = logging.getLogger(__name__)


class GeminiService:
    """Service for interacting with Google Gemini API."""
    
    def __init__(self):
        """Initialize Gemini service with API key and configuration."""
        if settings.GOOGLE_API_KEY:
            genai.configure(api_key=settings.GOOGLE_API_KEY)
            self.enabled = True
            logger.info("Gemini service initialized successfully")
        else:
            self.enabled = False
            logger.warning("Gemini service disabled - no API key provided")

        # Thread pool for async operations
        self.executor = ThreadPoolExecutor(max_workers=4)
    
    def _get_safety_settings(self) -> Dict[HarmCategory, HarmBlockThreshold]:
        """Get safety settings for Gemini API."""
        return {
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        }
    
    def _format_messages_for_gemini(self, messages: List[Dict[str, str]]) -> str:
        """Convert OpenAI-style messages to Gemini prompt format."""
        formatted_parts = []
        
        for message in messages:
            role = message.get("role", "user")
            content = message.get("content", "")
            
            if role == "system":
                formatted_parts.append(f"System Instructions: {content}")
            elif role == "user":
                formatted_parts.append(f"User: {content}")
            elif role == "assistant":
                formatted_parts.append(f"Assistant: {content}")
        
        return "\n\n".join(formatted_parts)
    
    def _calculate_cost(self, input_tokens: int, output_tokens: int, model: str) -> float:
        """Calculate cost based on Gemini pricing."""
        if "flash" in model.lower():
            # Gemini 1.5 Flash: $0.075/1M input, $0.30/1M output
            input_cost = (input_tokens / 1_000_000) * 0.075
            output_cost = (output_tokens / 1_000_000) * 0.30
        else:
            # Gemini 1.5 Pro: $1.25/1M input, $5.00/1M output
            input_cost = (input_tokens / 1_000_000) * 1.25
            output_cost = (output_tokens / 1_000_000) * 5.00
        
        return input_cost + output_cost
    
    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 500,
        tools: Optional[List[Dict[str, Any]]] = None,
        use_search: bool = True,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Create chat completion with Gemini.
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Model to use (default from settings)
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            tools: List of available tools/functions (for compatibility)
            use_search: Whether to enable built-in web search
            **kwargs: Additional parameters
            
        Returns:
            Dict with 'content', 'tokens', 'cost', and 'model'
        """
        if not self.enabled:
            raise Exception("Gemini service not enabled - missing API key")
        
        if not model:
            model = settings.GEMINI_MODEL
        
        try:
            # Format messages for Gemini
            prompt = self._format_messages_for_gemini(messages)

            # Configure generation parameters
            generation_config = genai.types.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
                candidate_count=1,
            )

            # Create model instance (tools will be passed to generate_content)
            gemini_model = genai.GenerativeModel(
                model_name=model,
                generation_config=generation_config,
                safety_settings=self._get_safety_settings()
            )

            # Generate response (run in thread pool for async)
            loop = asyncio.get_event_loop()
            if use_search:
                # Enable Google Search grounding using new SDK
                logger.info("Using Google Search grounding for real-time information")
                try:
                    # Use new SDK completely for Google Search grounding
                    new_client = new_genai.Client(api_key=settings.GOOGLE_API_KEY)
                    grounding_tool = new_types.Tool(google_search=new_types.GoogleSearch())
                    config = new_types.GenerateContentConfig(
                        tools=[grounding_tool],
                        temperature=temperature,
                        max_output_tokens=max_tokens
                    )

                    response = await loop.run_in_executor(
                        self.executor,
                        lambda: new_client.models.generate_content(
                            model=model,
                            contents=prompt,
                            config=config
                        )
                    )

                    # Extract content from new SDK response with detailed debugging
                    content = ""
                    logger.info(f"🔍 RESPONSE DEBUG: Response type: {type(response)}")
                    logger.info(f"🔍 RESPONSE DEBUG: Response attributes: {[attr for attr in dir(response) if not attr.startswith('_')]}")

                    # Try multiple extraction methods
                    if hasattr(response, 'text'):
                        logger.info(f"🔍 RESPONSE DEBUG: response.text exists: {response.text}")
                        if response.text:
                            content = response.text
                            logger.info(f"🔍 RESPONSE DEBUG: Extracted content from response.text: {len(content)} chars")

                    if not content and hasattr(response, 'candidates') and response.candidates:
                        logger.info(f"🔍 RESPONSE DEBUG: Found {len(response.candidates)} candidates")
                        for i, candidate in enumerate(response.candidates):
                            logger.info(f"🔍 RESPONSE DEBUG: Candidate {i} type: {type(candidate)}")
                            logger.info(f"🔍 RESPONSE DEBUG: Candidate {i} attributes: {[attr for attr in dir(candidate) if not attr.startswith('_')]}")

                            if hasattr(candidate, 'content') and candidate.content:
                                logger.info(f"🔍 RESPONSE DEBUG: Candidate {i} content type: {type(candidate.content)}")
                                logger.info(f"🔍 RESPONSE DEBUG: Candidate {i} content attributes: {[attr for attr in dir(candidate.content) if not attr.startswith('_')]}")

                                if hasattr(candidate.content, 'parts'):
                                    logger.info(f"🔍 RESPONSE DEBUG: Candidate {i} parts: {candidate.content.parts}")
                                    if candidate.content.parts:
                                        logger.info(f"🔍 RESPONSE DEBUG: Candidate {i} has {len(candidate.content.parts)} parts")
                                        for j, part in enumerate(candidate.content.parts):
                                            logger.info(f"🔍 RESPONSE DEBUG: Part {j} type: {type(part)}")
                                            logger.info(f"🔍 RESPONSE DEBUG: Part {j} attributes: {[attr for attr in dir(part) if not attr.startswith('_')]}")
                                            logger.info(f"🔍 RESPONSE DEBUG: Part {j} content: {part}")
                                            if hasattr(part, 'text') and part.text:
                                                content += part.text
                                                logger.info(f"🔍 RESPONSE DEBUG: Extracted {len(part.text)} chars from part {j}")
                                    else:
                                        logger.info(f"🔍 RESPONSE DEBUG: Candidate {i} has empty parts list")
                                else:
                                    logger.info(f"🔍 RESPONSE DEBUG: Candidate {i} has no parts attribute")

                    if not content:
                        logger.warning("🔍 RESPONSE DEBUG: No content extracted, trying alternative methods")

                        # Check grounding metadata since this is a Google Search response
                        for i, candidate in enumerate(response.candidates):
                            if hasattr(candidate, 'grounding_metadata') and candidate.grounding_metadata:
                                logger.info(f"🔍 RESPONSE DEBUG: Candidate {i} has grounding_metadata: {type(candidate.grounding_metadata)}")
                                logger.info(f"🔍 RESPONSE DEBUG: Grounding metadata attributes: {[attr for attr in dir(candidate.grounding_metadata) if not attr.startswith('_')]}")

                                # Try to access grounding chunks or search results
                                if hasattr(candidate.grounding_metadata, 'grounding_chunks'):
                                    logger.info(f"🔍 RESPONSE DEBUG: Found {len(candidate.grounding_metadata.grounding_chunks)} grounding chunks")
                                    for j, chunk in enumerate(candidate.grounding_metadata.grounding_chunks):
                                        logger.info(f"🔍 RESPONSE DEBUG: Chunk {j}: {type(chunk)}")
                                        if hasattr(chunk, 'web') and chunk.web:
                                            logger.info(f"🔍 RESPONSE DEBUG: Chunk {j} web: {chunk.web}")

                                if hasattr(candidate.grounding_metadata, 'search_entry_point'):
                                    logger.info(f"🔍 RESPONSE DEBUG: Search entry point: {candidate.grounding_metadata.search_entry_point}")

                        # Try to access function_calls or automatic_function_calling_history
                        if hasattr(response, 'function_calls') and response.function_calls:
                            logger.info(f"🔍 RESPONSE DEBUG: Found function_calls: {response.function_calls}")

                        if hasattr(response, 'automatic_function_calling_history') and response.automatic_function_calling_history:
                            logger.info(f"🔍 RESPONSE DEBUG: Found AFC history: {response.automatic_function_calling_history}")

                        # Try to access raw response data using model_dump instead of to_dict
                        try:
                            response_dict = response.model_dump()
                            logger.info(f"🔍 RESPONSE DEBUG: Response dict keys: {list(response_dict.keys())}")
                            # Look for content in the dict
                            if 'candidates' in response_dict:
                                for i, candidate in enumerate(response_dict['candidates']):
                                    if 'content' in candidate and 'parts' in candidate['content']:
                                        for j, part in enumerate(candidate['content']['parts']):
                                            if 'text' in part:
                                                content += part['text']
                                                logger.info(f"🔍 RESPONSE DEBUG: Extracted {len(part['text'])} chars from dict candidate {i} part {j}")
                        except Exception as e:
                            logger.info(f"🔍 RESPONSE DEBUG: Could not convert to dict: {e}")

                    logger.info(f"🔍 RESPONSE DEBUG: Final content length: {len(content)}")

                    # Get token usage if available, with proper None handling
                    input_tokens = 0
                    output_tokens = 0
                    if hasattr(response, 'usage_metadata') and response.usage_metadata:
                        input_tokens = getattr(response.usage_metadata, 'prompt_token_count', 0) or 0
                        output_tokens = getattr(response.usage_metadata, 'candidates_token_count', 0) or 0
                    total_tokens = int(input_tokens + output_tokens)

                    # Calculate cost
                    cost = self._calculate_cost(int(input_tokens), int(output_tokens), model)

                    logger.info(f"Gemini completion with Google Search successful: {total_tokens} tokens, ${cost:.4f}")

                    return {
                        "content": content,
                        "tokens": total_tokens,
                        "cost": cost,
                        "model": model,
                        "search_used": True
                    }

                except Exception as e:
                    logger.warning(f"New Google Search grounding failed: {e}, falling back to regular generation")
                    # Fall through to regular generation without search
                    use_search = False

            if not use_search:
                # Regular generation without tools using old SDK
                response = await loop.run_in_executor(
                    self.executor,
                    lambda: gemini_model.generate_content(prompt)
                )

            # Extract response content
            content = response.text if response.text else ""

            # Get actual token usage if available
            if hasattr(response, 'usage_metadata') and response.usage_metadata:
                input_tokens = response.usage_metadata.prompt_token_count or 0
                output_tokens = response.usage_metadata.candidates_token_count or 0
                total_tokens = response.usage_metadata.total_token_count or (input_tokens + output_tokens)
            else:
                # Fallback to estimation
                input_tokens = len(prompt.split()) * 1.3  # Rough estimate
                output_tokens = len(content.split()) * 1.3  # Rough estimate
                total_tokens = int(input_tokens + output_tokens)

            # Calculate cost
            cost = self._calculate_cost(int(input_tokens), int(output_tokens), model)

            logger.info(f"Gemini completion successful: {total_tokens} tokens, ${cost:.4f}")

            return {
                "content": content,
                "tokens": total_tokens,
                "cost": cost,
                "model": model,
                "search_used": False  # This is the fallback path without search
            }
            
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            raise Exception(f"Gemini API error: {str(e)}")


# Global instance
gemini_service = GeminiService()
