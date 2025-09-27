"""
FastAPI Routes for Smart-Compliant Recommendation Engine
Provides fast algorithmic recommendations with OpenAI-powered sustainability Q&A
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
import asyncio
import logging
import os
from datetime import datetime

from app.db.session import get_db
from app.services.recommendation_engine import get_recommendation_engine
from app.services.openai_service import get_openai_service
from app.services.product_service import fetchProduct
from app.services.smart_structures import SmartLogger
from app.models.product import Product
from app.models.product_images import ProductImage

logger = logging.getLogger(__name__)

# Initialize router
recommendation_router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])

# OpenAI API Key - Load from environment variables for security
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', 'your-openai-api-key-here')

# Validate API key is properly configured
if OPENAI_API_KEY == 'your-openai-api-key-here' or not OPENAI_API_KEY:
    logger.warning("OpenAI API key not properly configured. Please set OPENAI_API_KEY environment variable.")
    logger.warning("OpenAI-powered Q&A features will not work without a valid API key.")
else:
    logger.info("OpenAI API key loaded successfully from environment variables")

# Initialize services
smart_logger = SmartLogger()


@recommendation_router.get("/recommend/{user_id}", operation_id="get_user_recommendations")
async def get_recommendations(
    user_id: str,
    limit: int = 6,
    db: Session = Depends(get_db)
):
    """
    Main recommendation endpoint - Fast algorithmic recommendations (no LLM)
    Returns exactly 6 Smart-compliant product recommendations as fast as possible
    
    Args:
        user_id: User identifier for personalized recommendations
        limit: Number of recommendations (fixed at 6)
        
    Returns:
        JSON array of exactly 6 Smart-compliant recommendation contexts
    """
    start_time = datetime.utcnow()
    
    try:
        # Force limit to 6 for consistency
        limit = 6
            
        logger.info(f"Generating exactly {limit} recommendations for user {user_id}")
        
        # Get recommendation engine
        engine = get_recommendation_engine(db)
        
        # Generate fast algorithmic recommendations
        recommendations = engine.get_fast_recommendations(user_id, limit)
        
        # Ensure we ALWAYS have exactly 6 recommendations
        while len(recommendations) < 6:
            additional_needed = 6 - len(recommendations)
            exclude_ids = []
            for rec in recommendations:
                # Handle both string and int product IDs
                if hasattr(rec, 'product_id'):
                    exclude_ids.append(str(rec.product_id))
                elif hasattr(rec, 'product_data') and rec.product_data.get('id'):
                    exclude_ids.append(str(rec.product_data['id']))
            
            # Try additional real products first
            additional_recommendations = engine.get_additional_real_products(additional_needed, exclude_ids)
            recommendations.extend(additional_recommendations)
            
            # If still not enough, use fallback to guarantee 6
            if len(recommendations) < 6:
                remaining_needed = 6 - len(recommendations)
                fallback_recommendations = engine.get_fallback_recommendations(remaining_needed)
                recommendations.extend(fallback_recommendations)
                break  # Prevent infinite loop
        
        # Trim to exactly 6 recommendations
        recommendations = recommendations[:6]
        
        # Final guarantee - if somehow we still don't have 6, create minimal ones
        if len(recommendations) < 6:
            logger.warning("Creating minimal recommendations to reach 6")
            while len(recommendations) < 6:
                minimal_rec = engine.create_minimal_recommendation(f"product_{len(recommendations) + 1}")
                recommendations.append(minimal_rec)
        
        # Log final count
        logger.info(f"Final recommendation count: {len(recommendations)} products (guaranteed 6)")
        
        # Convert to response format
        response_data = []
        for rec in recommendations:
            rec_dict = rec.to_dict()
            response_data.append(rec_dict)
        
        execution_time = (datetime.utcnow() - start_time).total_seconds()
        logger.info(f"Generated {len(recommendations)} recommendations in {execution_time:.2f}s")
        
        return {
            "status": 200,
            "message": "Recommendations generated successfully",
            "data": response_data,
            "metadata": {
                "user_id": user_id,
                "count": len(recommendations),
                "execution_time_seconds": execution_time,
                "Smart_compliant": True,
                "algorithm_only": True  # No LLM used for recommendations
            }
        }
        
    except Exception as e:
        logger.error(f"Error generating recommendations for user {user_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate recommendations: {str(e)}"
        )


@recommendation_router.get("/explain/{user_id}/{product_id}", operation_id="explain_recommendation")
async def explain_recommendation(
    user_id: str,
    product_id: int,
    db: Session = Depends(get_db)
):
    """
    Comprehensive explanation endpoint - Combines algorithmic scores with OpenAI reasoning
    Merges numeric scores with answers from all 4 sustainability Q&A endpoints
    
    Args:
        user_id: User identifier for personalized explanations
        product_id: Product to explain
        
    Returns:
        Combined algorithmic reasoning and OpenAI-powered explanations
    """
    try:
        logger.info(f"Generating explanation for user {user_id}, product {product_id}")
        
        # Get product details
        product_request = {"product_id": product_id}
        product_response = fetchProduct(product_request, db)
        
        if not product_response or product_response.get("status") != 200:
            raise HTTPException(status_code=404, detail="Product not found")
        
        product_data = {
            "id": product_id,
            "name": product_response["data"].name,
            "description": product_response["data"].description,
            "price": float(product_response["data"].price),
            "brand": product_response["data"].brand,
            "sustainability_rating": product_response.get("sustainability", {}).get("rating", 0.0),
            "image_urls": product_response.get("images", []),
            "category_name": product_response.get("category_name", "Unknown"),
            "retailer_name": product_response.get("retailer_name", "Unknown")
        }
        
        # Generate algorithmic recommendation reasoning
        engine = get_recommendation_engine(db)
        user_history = engine.get_user_purchase_history(user_id)
        popularity_scores = engine.get_product_popularity_scores()
        sustainability_scores = engine.get_sustainability_scores([product_id])
        
        # Calculate recommendation reasoning for this specific product
        reasoning = engine.calculate_recommendation_score(
            product_response["data"], user_history, popularity_scores, sustainability_scores
        )
        
        # Get OpenAI service for deep reasoning
        openai_service = get_openai_service(OPENAI_API_KEY)
        
        # Get comprehensive OpenAI explanations (parallel execution)
        openai_explanations = await openai_service.get_comprehensive_explanation(
            user_id=user_id,
            product_data=product_data,
            recommendation_reasoning=reasoning.to_dict(),
            current_cart_sustainability=5.0,  # TODO: Get actual cart sustainability
            alternative_products=[]  # TODO: Get actual alternatives
        )
        
        # Combine algorithmic and AI reasoning
        combined_explanation = {
            "product_id": product_id,
            "product_data": product_data,
            "algorithmic_reasoning": reasoning.to_dict(),
            "ai_explanations": openai_explanations,
            "combined_insights": {
                "overall_score": reasoning.final_recommendation_score,
                "tier": "PREMIUM" if reasoning.final_recommendation_score >= 8.0 
                       else "GOOD" if reasoning.final_recommendation_score >= 6.0 
                       else "BASIC",
                "confidence_level": reasoning.confidence_level,
                "key_strengths": reasoning.reasoning_factors
            },
            "Smart_metadata": {
                "version": "1.0",
                "timestamp": datetime.utcnow().isoformat(),
                "explanation_type": "comprehensive_recommendation_analysis"
            }
        }
        
        return {
            "status": 200,
            "message": "Recommendation explanation generated successfully",
            "data": combined_explanation
        }
        
    except Exception as e:
        logger.error(f"Error explaining recommendation: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate explanation: {str(e)}"
        )


@recommendation_router.get("/q1/{user_id}/{product_id}", operation_id="why_recommended")
async def why_recommended(
    user_id: str,
    product_id: int,
    db: Session = Depends(get_db)
):
    """
    Q1: Why was this product recommended?
    OpenAI-powered explanation of algorithmic reasoning
    """
    try:
        # Get product and reasoning data
        product_request = {"product_id": product_id}
        product_response = fetchProduct(product_request, db)
        
        if not product_response or product_response.get("status") != 200:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Generate algorithmic reasoning
        engine = get_recommendation_engine(db)
        user_history = engine.get_user_purchase_history(user_id)
        popularity_scores = engine.get_product_popularity_scores()
        sustainability_scores = engine.get_sustainability_scores([product_id])
        
        reasoning = engine.calculate_recommendation_score(
            product_response["data"], user_history, popularity_scores, sustainability_scores
        )
        
        # Get OpenAI explanation
        openai_service = get_openai_service(OPENAI_API_KEY)
        product_data = {
            "id": product_id,
            "name": product_response["data"].name,
            "description": product_response["data"].description,
            "price": float(product_response["data"].price),
            "brand": product_response["data"].brand,
            "sustainability_rating": product_response.get("sustainability", {}).get("rating", 0.0),
            "category_name": product_response.get("category_name", "Unknown"),
            "retailer_name": product_response.get("retailer_name", "Unknown")
        }
        
        explanation = await openai_service.why_recommended(
            user_id, product_data, reasoning.to_dict()
        )
        
        return {
            "status": 200,
            "question": "Why was this product recommended?",
            "answer": explanation,
            "algorithmic_scores": reasoning.to_dict()
        }
        
    except Exception as e:
        logger.error(f"Error in Q1 endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@recommendation_router.get("/q2/{user_id}/{product_id}", operation_id="sustainability_analysis")
async def sustainability_analysis(
    user_id: str,
    product_id: int,
    db: Session = Depends(get_db)
):
    """
    Q2: How sustainable is this product given its score?
    OpenAI-powered sustainability analysis
    """
    try:
        # Get product data
        product_request = {"product_id": product_id}
        product_response = fetchProduct(product_request, db)
        
        if not product_response or product_response.get("status") != 200:
            raise HTTPException(status_code=404, detail="Product not found")
        
        product_data = {
            "id": product_id,
            "name": product_response["data"].name,
            "description": product_response["data"].description,
            "price": float(product_response["data"].price),
            "brand": product_response["data"].brand,
            "sustainability_rating": product_response.get("sustainability", {}).get("rating", 0.0),
            "category_name": product_response.get("category_name", "Unknown"),
            "retailer_name": product_response.get("retailer_name", "Unknown")
        }
        
        # LLM analysis, constrained to /100 scale and concise output
        openai_service = get_openai_service(OPENAI_API_KEY)
        analysis = await openai_service.sustainability_analysis(user_id, product_data)
        
        return {
            "status": 200,
            "question": "How sustainable is this product given its score?",
            "answer": analysis,
            "sustainability_rating": product_data["sustainability_rating"]
        }
        
    except Exception as e:
        logger.error(f"Error in Q2 endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@recommendation_router.get("/q3/{user_id}/{product_id}", operation_id="suggest_alternatives")
async def suggest_alternatives(
    user_id: str,
    product_id: int,
    db: Session = Depends(get_db)
):
    """
    Q3: Suggest 3 alternatives and explain why this product is better
    Now returns 3 algorithmic alternatives (no LLM)
    """
    try:
        # Get product data
        product_request = {"product_id": product_id}
        product_response = fetchProduct(product_request, db)
        
        if not product_response or product_response.get("status") != 200:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Base product details
        product_data = {
            "id": product_id,
            "name": product_response["data"].name,
            "description": product_response["data"].description,
            "price": float(product_response["data"].price),
            "brand": product_response["data"].brand,
            "sustainability_rating": product_response.get("sustainability", {}).get("rating", 0.0),
            "category_name": product_response.get("category_name", "Unknown"),
            "retailer_name": product_response.get("retailer_name", "Unknown")
        }

        # Algorithmically select alternatives: same category, in stock, closest price, top sustainability
        current_category_id = product_response["data"].category_id
        current_price = float(product_response["data"].price or 0.0)

        # Fetch candidate products (price-similar first), exclude the current product
        candidates = (
            db.query(Product)
            .filter(
                Product.category_id == current_category_id,
                Product.id != product_id,
                Product.in_stock == True,
            )
            .order_by(func.abs(Product.price - current_price))
            .limit(30)
            .all()
        )

        # Map first image per candidate
        candidate_ids = [p.id for p in candidates]
        images = []
        if candidate_ids:
            images = (
                db.query(ProductImage)
                .filter(ProductImage.product_id.in_(candidate_ids))
                .order_by(ProductImage.product_id, ProductImage.id)
                .all()
            )
        image_map = {}
        for img in images:
            if img.product_id not in image_map:
                image_map[img.product_id] = img.image_url or "https://via.placeholder.com/300x300/7BB540/FFFFFF?text=Product"

        # Compute sustainability ratings using existing service (weighted)
        from app.services.sustainabilityRatings_service import fetchSustainabilityRatings
        alt_items = []
        for p in candidates:
            try:
                sust = fetchSustainabilityRatings({"product_id": p.id}, db)
                rating = float(sust.get("rating", 0.0))
            except Exception:
                rating = 0.0
            price_val = float(p.price or 0.0)
            alt_items.append({
                "id": p.id,
                "name": p.name,
                "price": price_val,
                "brand": getattr(p, "brand", None),
                "sustainability_rating": rating,
                "image_url": image_map.get(p.id, "https://via.placeholder.com/300x300/7BB540/FFFFFF?text=Product"),
                "price_diff": abs(price_val - current_price),
            })

        # Pick top 3: highest sustainability, then closest price
        alt_items.sort(key=lambda x: (-x["sustainability_rating"], x["price_diff"]))
        alternatives = alt_items[:3]

        return {
            "status": 200,
            "alternatives": alternatives,
            "product_data": product_data,
            "count": len(alternatives)
        }
        
    except Exception as e:
        logger.error(f"Error in Q3 endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@recommendation_router.get("/q4/{user_id}/{product_id}", operation_id="ecometer_impact_analysis")
async def ecometer_impact(
    user_id: str,
    product_id: int,
    db: Session = Depends(get_db)
):
    """
    Q4: How does this product affect the EcoMeter score?
    OpenAI-powered EcoMeter impact analysis
    """
    try:
        # Get product data
        product_request = {"product_id": product_id}
        product_response = fetchProduct(product_request, db)
        
        if not product_response or product_response.get("status") != 200:
            raise HTTPException(status_code=404, detail="Product not found")
        
        product_data = {
            "id": product_id,
            "name": product_response["data"].name,
            "description": product_response["data"].description,
            "price": float(product_response["data"].price),
            "brand": product_response["data"].brand,
            "sustainability_rating": product_response.get("sustainability", {}).get("rating", 0.0),
            "category_name": product_response.get("category_name", "Unknown"),
            "retailer_name": product_response.get("retailer_name", "Unknown")
        }
        
        # LLM impact analysis; pass a cart average (placeholder) and ensure /100 framing in prompt
        current_cart_sustainability = 50.0  # TODO: replace with actual cart average out of 100
        openai_service = get_openai_service(OPENAI_API_KEY)
        impact_analysis = await openai_service.ecometer_impact(
            user_id, product_data, current_cart_sustainability
        )

        return {
            "status": 200,
            "question": "How does this product affect the EcoMeter score?",
            "answer": impact_analysis,
            "current_cart_sustainability": current_cart_sustainability,
            "product_sustainability": product_data["sustainability_rating"],
            "model_used": getattr(openai_service, "last_model_used", None)
        }
        
    except Exception as e:
        logger.error(f"Error in Q4 endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@recommendation_router.post("/update-context/{user_id}", operation_id="update_user_shopping_context")
async def update_user_context(
    user_id: str,
    purchase_data: Dict[str, Any],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Update user shopping context after purchase/interaction
    Maintains stateful context for improved recommendations
    """
    try:
        # Update context in background for performance
        def update_context_task():
            engine = get_recommendation_engine(db)
            updated_context = engine.update_user_context(user_id, purchase_data)
            logger.info(f"Updated context for user {user_id}")
        
        background_tasks.add_task(update_context_task)
        
        return {
            "status": 200,
            "message": "User context update queued successfully",
            "user_id": user_id
        }
        
    except Exception as e:
        logger.error(f"Error updating user context: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@recommendation_router.get("/health", operation_id="recommendation_health_check")
async def health_check():
    """
    Health check endpoint for the recommendation service
    """
    return {
        "status": 200,
        "message": "Smart Recommendation Engine is healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "features": {
            "algorithmic_recommendations": True,
            "openai_sustainability_qa": True,
            "Smart_compliant": True,
            "sub_10_second_response": True
        }
    }


@recommendation_router.get("/ai-health", operation_id="recommendation_ai_health")
async def ai_health_check():
    """
    Lightweight AI health check to verify GPT connectivity and response.
    Returns the first 120 characters of a fixed prompt's response.
    """
    try:
        openai_service = get_openai_service(OPENAI_API_KEY)
        prompt = [
            {"role": "system", "content": "You are a concise assistant."},
            {"role": "user", "content": "Reply with a single short sentence confirming AI connectivity for Green-Cart."}
        ]
        # Call underlying request method for a quick check
        content = await openai_service._make_openai_request(prompt)
        snippet = (content or "").strip()[:120]
        ok = bool(content)
        return {
            "status": 200 if ok else 500,
            "message": "AI connectivity OK" if ok else "AI connectivity failed",
            "model": openai_service.model,
            "snippet": snippet
        }
    except Exception as e:
        logger.error(f"AI health check failed: {e}")
        raise HTTPException(status_code=500, detail="AI health check failed")
