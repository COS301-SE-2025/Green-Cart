"""
OpenAI Integration Service for Sustainability Q&A
Handles 4 specific sustainability reasoning endpoints using GPT-5 Nano via OpenAI SDK
"""
import asyncio
import logging
from typing import Dict, Any, Optional
from datetime import datetime

from app.services.mcp_structures import MCPLogger
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)


class OpenAISustainabilityService:
    """
    OpenAI integration for sustainability reasoning and Q&A
    Optimized for fast, contextual responses about product sustainability
    """
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        # Using OpenAI SDK (Async) with GPT-5 Nano
        self.model = "gpt-5-nano"
        self.max_tokens = 256  # Keep responses concise and nano-friendly
        # Note: gpt-5-nano may ignore temperature settings; we won't pass it explicitly
        self.mcp_logger = MCPLogger()
        # Initialize async OpenAI client with a sensible timeout
        self.client = AsyncOpenAI(api_key=self.api_key, timeout=15.0)
        # Telemetry for last model actually used (primary or fallback)
        self.last_model_used: Optional[str] = None
    
    async def _make_openai_request(self, messages: list, max_retries: int = 3) -> Optional[str]:
        """
        Make async request to OpenAI API with retry logic using OpenAI SDK
        """
        # Reset telemetry for this request
        self.last_model_used = None
        primary_model = self.model
        fallback_model: Optional[str] = "gpt-4o-mini"  # Use if primary model unavailable

        for attempt in range(max_retries):
            try:
                # Call OpenAI Chat Completions API via SDK
                kwargs = {"model": primary_model, "messages": messages}
                # gpt-5-nano expects 'max_completion_tokens' not 'max_tokens'
                if str(primary_model).lower().startswith("gpt-5"):
                    kwargs["extra_body"] = {"max_completion_tokens": self.max_tokens}
                else:
                    kwargs["max_tokens"] = self.max_tokens

                resp = await self.client.chat.completions.create(**kwargs)
                # Parse response content
                content = (resp.choices[0].message.content or "").strip()
                if content:
                    logger.info(f"OpenAI API success via {primary_model}: {content[:100]}...")
                    self.last_model_used = primary_model
                    return content
                else:
                    logger.warning(f"OpenAI returned empty content via {primary_model}; attempting fallback model if available.")
                    if fallback_model:
                        try:
                            alt_kwargs = {"model": fallback_model, "messages": messages, "max_tokens": self.max_tokens}
                            alt_resp = await self.client.chat.completions.create(**alt_kwargs)
                            alt_content = (alt_resp.choices[0].message.content or "").strip()
                            if alt_content:
                                logger.info(f"OpenAI API success via {fallback_model}: {alt_content[:100]}...")
                                self.last_model_used = fallback_model
                                return alt_content
                            else:
                                logger.error(f"Fallback model {fallback_model} also returned empty content.")
                        except Exception as e2:
                            logger.error(f"Fallback model {fallback_model} failed after empty primary content: {e2}")
                            fallback_model = None
                    # If still no content, raise to trigger retry loop
                    raise RuntimeError("Empty content from OpenAI response")
                        
            except Exception as e:
                err = str(e)
                logger.error(f"OpenAI request attempt {attempt + 1} with {primary_model} failed: {err}")
                # If model access issues occur, try a single-shot fallback model
                if ("model" in err.lower() or "not found" in err.lower() or "access" in err.lower()) and fallback_model:
                    try:
                        alt_kwargs = {"model": fallback_model, "messages": messages, "max_tokens": self.max_tokens}
                        alt_resp = await self.client.chat.completions.create(**alt_kwargs)
                        alt_content = (alt_resp.choices[0].message.content or "").strip()
                        logger.info(f"OpenAI API success via {fallback_model}: {alt_content[:100]}...")
                        return alt_content
                    except Exception as e2:
                        logger.error(f"Fallback model {fallback_model} failed: {e2}")
                        fallback_model = None
                if attempt < max_retries - 1:
                    await asyncio.sleep(1)  # Brief delay before retry
        
        return None
    
    def _build_product_context(self, product_data: Dict[str, Any]) -> str:
        """
        Build concise product context for OpenAI prompts
        """
        context_parts = [
            f"Product: {product_data.get('name', 'Unknown')}",
            f"Brand: {product_data.get('brand', 'Unknown')}",
            f"Category: {product_data.get('category_name', 'Unknown')}",
            f"Price: ${product_data.get('price', 0):.2f}",
            f"Retailer: {product_data.get('retailer_name', 'Unknown')}",
            f"Sustainability Rating: {product_data.get('sustainability_rating', 0):.1f}/100"
        ]
        
        if product_data.get('description'):
            context_parts.append(f"Description: {product_data['description'][:200]}...")

        return "\n".join(context_parts)
    
    async def why_recommended(self, user_id: str, product_data: Dict[str, Any], 
                            recommendation_reasoning: Dict[str, Any]) -> str:
        """
        Q1: Why was this product recommended?
        Explain the algorithmic reasoning in user-friendly terms
        """
        product_context = self._build_product_context(product_data)
        
        messages = [
            {
                "role": "system",
                "content": """You are a sustainability expert explaining product recommendations. 
                Be concise, friendly, and focus on the key factors that led to this recommendation.
                Limit response to 3-4 sentences maximum."""
            },
            {
                "role": "user", 
                "content": f"""Explain why this product was recommended based on these factors:

{product_context}

Recommendation Scores:
- Purchase History Match: {recommendation_reasoning.get('purchase_history_score', 0):.1f}/10
- Sustainability Score: {recommendation_reasoning.get('sustainability_score', 0):.1f}/10  
- Popularity Score: {recommendation_reasoning.get('popularity_score', 0):.1f}/10
- Category Preference: {recommendation_reasoning.get('category_preference_score', 0):.1f}/10
- Final Score: {recommendation_reasoning.get('final_recommendation_score', 0):.1f}/10

Key Factors: {', '.join(recommendation_reasoning.get('reasoning_factors', []))}

Explain in simple terms why this product is a good match for the user."""
            }
        ]
        
        response = await self._make_openai_request(messages)
        
        # Log the interaction
        question = "Why was this product recommended?"
        self.mcp_logger.log_openai_interaction(
            user_id, product_data.get('id'), question, response or "No response"
        )
        
        return response or "This product was recommended based on your preferences and its strong sustainability profile."
    
    async def sustainability_analysis(self, user_id: str, product_data: Dict[str, Any]) -> str:
        """
        Q2: How sustainable is this product given its score?
        Provide detailed sustainability analysis
        """
        product_context = self._build_product_context(product_data)
        sustainability_score = product_data.get('sustainability_rating', 0)
        
        messages = [
            {
                "role": "system",
                "content": """You are a sustainability expert analyzing product environmental impact.
                IMPORTANT: Treat all sustainability ratings as out of 100.
                Do NOT mention the EcoMeter, cart averages, or checkout adjustments.
                Respond concisely (2-3 sentences) and include the numeric score in the form: 'Sustainability score: X.X/100'.
                Provide a brief heads-up of the sustainability level (High/Moderate/Low) based on the score and one short tip if helpful."""
            },
            {
                "role": "user",
                "content": f"""Analyze the sustainability of this product:

{product_context}

The product has a sustainability rating of {sustainability_score:.1f}/100.

Please provide:
1. A short statement including 'Sustainability score: {sustainability_score:.1f}/100'.
2. A brief heads-up indicating overall level (High/Moderate/Low) based on the score.
3. One concise tip to improve or consider (optional).

Do not mention EcoMeter, cart averages, or checkout adjustments."""
            }
        ]
        
        response = await self._make_openai_request(messages)
        
        # Log the interaction
        question = "How sustainable is this product?"
        self.mcp_logger.log_openai_interaction(
            user_id, product_data.get('id'), question, response or "No response"
        )
        
        return response or f"This product has a sustainability rating of {sustainability_score:.1f}/10, indicating {'excellent' if sustainability_score >= 8 else 'good' if sustainability_score >= 6 else 'moderate'} environmental performance."
    
    async def suggest_alternatives(self, user_id: str, product_data: Dict[str, Any], 
                                 alternative_products: list = None) -> str:
        """
        Q3: Suggest 3 alternatives and explain why this product is better
        Compare with alternatives and justify the recommendation
        """
        product_context = self._build_product_context(product_data)
        
        alternatives_context = ""
        if alternative_products:
            for i, alt in enumerate(alternative_products[:3], 1):
                alternatives_context += f"\\nAlternative {i}: {alt.get('name', 'Unknown')} - ${alt.get('price', 0):.2f} (Sustainability: {alt.get('sustainability_rating', 0):.1f}/10)"
        
        messages = [
            {
                "role": "system", 
                "content": """You are a product comparison expert focusing on sustainability and value.
                Suggest 3 specific alternatives and explain why the recommended product stands out.
                Be specific about advantages - 4-5 sentences maximum."""
            },
            {
                "role": "user",
                "content": f"""Compare this recommended product with alternatives:

Recommended Product:
{product_context}
{alternatives_context if alternatives_context else ""}

Suggest 3 alternative products in the same category and explain:
1. Why the recommended product is better than these alternatives
2. What specific advantages it has (price, sustainability, quality, etc.)
3. When someone might prefer an alternative instead

Focus on sustainability and value proposition."""
            }
        ]
        
        response = await self._make_openai_request(messages)
        
        # Log the interaction
        question = "What are alternatives and why is this product better?"
        self.mcp_logger.log_openai_interaction(
            user_id, product_data.get('id'), question, response or "No response"
        )
        
        return response or "This product offers an excellent balance of sustainability, quality, and value compared to similar alternatives in its category."
    
    async def ecometer_impact(self, user_id: str, product_data: Dict[str, Any], 
                            current_cart_sustainability: float = 0.0) -> str:
        """
        Q4: How does this product affect the EcoMeter score?
        Explain impact on average sustainability rating at checkout
        """
        product_context = self._build_product_context(product_data)
        product_sustainability = product_data.get('sustainability_rating', 0)
        
        messages = [
            {
                "role": "system",
                "content": """You are an EcoMeter expert explaining environmental impact scores.
                IMPORTANT: Treat all sustainability ratings as out of 100.
                Do NOT mention cart averages or any specific EcoMeter value.
                Classify impact based ONLY on the product's sustainability rating using these thresholds:
                - Positive: score >= 60
                - Neutral: 40 <= score < 60
                - Negative: score < 40
                Respond with 2–3 concise sentences that include: (1) Positive/Neutral/Negative classification, (2) a brief rationale tied to the score, and (3) one actionable tip. Include only the product score in the form 'product X.X/100'."""
            },
            {
                "role": "user",
                "content": f"""Analyze EcoMeter impact:

{product_context}

This Product's Sustainability: {product_sustainability:.1f}/100

Provide:
1. Positive/Neutral/Negative impact classification based only on the product score (see thresholds).
2. A brief rationale linked to the score.
3. One practical tip to maintain or improve sustainable choices.
Include only the product score in your answer (e.g., 'product {product_sustainability:.1f}/100'). Do not mention cart averages or checkout adjustments."""
            }
        ]
        
        response = await self._make_openai_request(messages)
        
        # Log the interaction
        question = "How does this product affect the EcoMeter score?"
        self.mcp_logger.log_openai_interaction(
            user_id, product_data.get('id'), question, response or "No response"
        )
        
        return response or f"Adding this product (sustainability: {product_sustainability:.1f}/10) will {'improve' if product_sustainability > current_cart_sustainability else 'slightly reduce' if product_sustainability < current_cart_sustainability else 'maintain'} your cart's EcoMeter score."
    
    async def get_comprehensive_explanation(self, user_id: str, product_data: Dict[str, Any],
                                          recommendation_reasoning: Dict[str, Any],
                                          current_cart_sustainability: float = 0.0,
                                          alternative_products: list = None) -> Dict[str, str]:
        """
        Get all 4 sustainability explanations in parallel for the /explain endpoint
        """
        try:
            # Execute all 4 questions concurrently for speed
            tasks = [
                self.why_recommended(user_id, product_data, recommendation_reasoning),
                self.sustainability_analysis(user_id, product_data),
                self.suggest_alternatives(user_id, product_data, alternative_products),
                self.ecometer_impact(user_id, product_data, current_cart_sustainability)
            ]
            
            responses = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Handle any exceptions in responses
            results = {
                "why_recommended": responses[0] if not isinstance(responses[0], Exception) else "Unable to generate explanation",
                "sustainability_analysis": responses[1] if not isinstance(responses[1], Exception) else "Unable to analyze sustainability", 
                "alternatives_comparison": responses[2] if not isinstance(responses[2], Exception) else "Unable to suggest alternatives",
                "ecometer_impact": responses[3] if not isinstance(responses[3], Exception) else "Unable to calculate EcoMeter impact"
            }
            
            return results
            
        except Exception as e:
            logger.error(f"Error getting comprehensive explanation: {e}")
            return {
                "why_recommended": "Unable to generate explanation",
                "sustainability_analysis": "Unable to analyze sustainability",
                "alternatives_comparison": "Unable to suggest alternatives", 
                "ecometer_impact": "Unable to calculate EcoMeter impact"
            }


def get_openai_service(api_key: str) -> OpenAISustainabilityService:
    """Factory function to create OpenAI service instance"""
    return OpenAISustainabilityService(api_key)