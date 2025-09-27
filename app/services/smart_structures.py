"""
Smart Recommendation Data Structures for Recommendation Engine
Using standard Python classes for smart recommendations without Pydantic dependencies
"""
from enum import Enum
from typing import Dict, List, Any, Optional
from datetime import datetime
import json


class RecommendationTier(Enum):
    """Product recommendation tiers with visual indicators"""
    PREMIUM = "PREMIUM"
    GOOD = "GOOD"
    BASIC = "BASIC"


class RecommendationReasoning:
    """
    Smart reasoning context for product recommendations
    Contains algorithmic scores and contextual data for transparency
    """
    
    def __init__(self, 
                 purchase_history_score: float = 0.0,
                 sustainability_score: float = 0.0,
                 popularity_score: float = 0.0,
                 category_preference_score: float = 0.0,
                 final_recommendation_score: float = 0.0,
                 reasoning_factors: Optional[List[str]] = None,
                 confidence_level: float = 0.0):
        
        self.purchase_history_score = purchase_history_score
        self.sustainability_score = sustainability_score
        self.popularity_score = popularity_score
        self.category_preference_score = category_preference_score
        self.final_recommendation_score = final_recommendation_score
        self.reasoning_factors = reasoning_factors or []
        self.confidence_level = confidence_level
        self.timestamp = datetime.utcnow().isoformat()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to smart recommendation dictionary format"""
        return {
            "purchase_history_score": self.purchase_history_score,
            "sustainability_score": self.sustainability_score,
            "popularity_score": self.popularity_score,
            "category_preference_score": self.category_preference_score,
            "final_recommendation_score": self.final_recommendation_score,
            "reasoning_factors": self.reasoning_factors,
            "confidence_level": self.confidence_level,
            "timestamp": self.timestamp
        }
    
    def to_json(self) -> str:
        """Serialize to JSON for Smart logging"""
        return json.dumps(self.to_dict())


class RecommendationContext:
    """
    Smart-compliant context wrapper for product recommendations
    Combines product data with recommendation reasoning and tier assignment
    """
    
    def __init__(self,
                 product_id: int,
                 product_data: Dict[str, Any],
                 recommendation_score: float,
                 tier: RecommendationTier,
                 reasoning: RecommendationReasoning,
                 sustainability_rating: float = 0.0,
                 image_urls: Optional[List[str]] = None,
                 category_name: str = "Unknown",
                 retailer_name: str = "Unknown"):
        
        self.product_id = product_id
        self.product_data = product_data
        self.recommendation_score = recommendation_score
        self.tier = tier
        self.reasoning = reasoning
        self.sustainability_rating = sustainability_rating
        self.image_urls = image_urls or []
        self.category_name = category_name
        self.retailer_name = retailer_name
        self.timestamp = datetime.utcnow().isoformat()
        
        # Smart metadata
        self.smart_version = "1.0"
        self.context_type = "product_recommendation"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to Smart-compliant dictionary format"""
        return {
            "smart_metadata": {
                "version": self.smart_version,
                "context_type": self.context_type,
                "timestamp": self.timestamp
            },
            "product_id": self.product_id,
            "product_data": self.product_data,
            "recommendation_score": self.recommendation_score,
            "tier": self.tier.value,
            "reasoning": self.reasoning.to_dict(),
            "sustainability_rating": self.sustainability_rating,
            "image_urls": self.image_urls,
            "category_name": self.category_name,
            "retailer_name": self.retailer_name
        }
    
    def to_json(self) -> str:
        """Serialize to JSON for Smart logging and API responses"""
        return json.dumps(self.to_dict())


class UserShoppingContext:
    """
    Smart-compliant user shopping context for personalized recommendations
    Tracks user preferences, purchase history patterns, and sustainability choices
    """
    
    def __init__(self,
                 user_id: str,
                 preferred_categories: Optional[List[str]] = None,
                 purchase_frequency: Dict[str, int] = None,
                 sustainability_preference_weight: float = 0.5,
                 price_sensitivity: float = 0.5,
                 brand_loyalty: Dict[str, float] = None,
                 seasonal_patterns: Dict[str, float] = None,
                 last_updated: Optional[str] = None):
        
        self.user_id = user_id
        self.preferred_categories = preferred_categories or []
        self.purchase_frequency = purchase_frequency or {}
        self.sustainability_preference_weight = sustainability_preference_weight
        self.price_sensitivity = price_sensitivity
        self.brand_loyalty = brand_loyalty or {}
        self.seasonal_patterns = seasonal_patterns or {}
        self.last_updated = last_updated or datetime.utcnow().isoformat()
        
        # Smart metadata
        self.smart_version = "1.0"
        self.context_type = "user_shopping_context"
    
    def update_context(self, new_purchase_data: Dict[str, Any]):
        """Update context with new purchase information"""
        category = new_purchase_data.get("category")
        brand = new_purchase_data.get("brand")
        
        if category:
            if category not in self.preferred_categories:
                self.preferred_categories.append(category)
            self.purchase_frequency[category] = self.purchase_frequency.get(category, 0) + 1
        
        if brand:
            current_loyalty = self.brand_loyalty.get(brand, 0.0)
            self.brand_loyalty[brand] = min(1.0, current_loyalty + 0.1)
        
        self.last_updated = datetime.utcnow().isoformat()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to Smart-compliant dictionary format"""
        return {
            "smart_metadata": {
                "version": self.smart_version,
                "context_type": self.context_type,
                "last_updated": self.last_updated
            },
            "user_id": self.user_id,
            "preferred_categories": self.preferred_categories,
            "purchase_frequency": self.purchase_frequency,
            "sustainability_preference_weight": self.sustainability_preference_weight,
            "price_sensitivity": self.price_sensitivity,
            "brand_loyalty": self.brand_loyalty,
            "seasonal_patterns": self.seasonal_patterns
        }
    
    def to_json(self) -> str:
        """Serialize to JSON for Smart logging"""
        return json.dumps(self.to_dict())


class SmartLogger:
    """
    Smart-compliant logging utility for recommendation engine audit trail
    """
    
    def __init__(self, log_file: str = "logs/smart_recommendations.log"):
        self.log_file = log_file
    
    def log_recommendation_context(self, context: RecommendationContext):
        """Log recommendation context in Smart format"""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": "recommendation_generated",
            "smart_context": context.to_dict()
        }
        
        try:
            with open(self.log_file, "a", encoding="utf-8") as f:
                f.write(json.dumps(log_entry) + "\n")
        except Exception as e:
            print(f"Failed to log Smart context: {e}")
    
    def log_user_context_update(self, context: UserShoppingContext):
        """Log user context updates in Smart format"""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": "user_context_updated",
            "smart_context": context.to_dict()
        }
        
        try:
            with open(self.log_file, "a", encoding="utf-8") as f:
                f.write(json.dumps(log_entry) + "\n")
        except Exception as e:
            print(f"Failed to log user context update: {e}")
    
    def log_openai_interaction(self, user_id: str, product_id: int, question: str, response: str):
        """Log OpenAI API interactions for audit trail"""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": "openai_interaction",
            "user_id": user_id,
            "product_id": product_id,
            "question": question,
            "response": response,
            "smart_metadata": {
                "version": "1.0",
                "context_type": "openai_sustainability_qa"
            }
        }
        
        try:
            with open(self.log_file, "a", encoding="utf-8") as f:
                f.write(json.dumps(log_entry) + "\n")
        except Exception as e:
            print(f"Failed to log OpenAI interaction: {e}")


def assign_recommendation_tier(score: float) -> RecommendationTier:
    """
    Assign recommendation tier based on algorithmic score
    
    Args:
        score: Recommendation score between 0-10
        
    Returns:
        RecommendationTier enum value
    """
    if score >= 8.0:
        return RecommendationTier.PREMIUM
    elif score >= 6.0:
        return RecommendationTier.GOOD
    else:
        return RecommendationTier.BASIC


def create_smart_recommendation(product_data: Dict[str, Any], 
                             reasoning: RecommendationReasoning) -> RecommendationContext:
    """
    Factory function to create Smart-compliant recommendation context
    
    Args:
        product_data: Raw product data from database
        reasoning: Algorithmic reasoning for the recommendation
        
    Returns:
        RecommendationContext object ready for API response
    """
    score = reasoning.final_recommendation_score
    tier = assign_recommendation_tier(score)
    
    return RecommendationContext(
        product_id=product_data.get("id"),
        product_data=product_data,
        recommendation_score=score,
        tier=tier,
        reasoning=reasoning,
        sustainability_rating=product_data.get("sustainability_rating", 0.0),
        image_urls=product_data.get("image_urls", []),
        category_name=product_data.get("category_name", "Unknown"),
        retailer_name=product_data.get("retailer_name", "Unknown")
    )
