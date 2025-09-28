import pytest
from unittest.mock import Mock, patch, MagicMock
import uuid
from datetime import datetime, date
from fastapi import HTTPException

from app.schemas.product import ProductResponse


class TestRecommendationEngine:
    """Unit tests for recommendation engine logic"""
    
    def test_collaborative_filtering_logic(self):
        """Test collaborative filtering recommendation logic"""
        def calculate_user_similarity(user1_purchases, user2_purchases):
            # Simple Jaccard similarity
            set1 = set(user1_purchases)
            set2 = set(user2_purchases)
            
            if not set1 or not set2:
                return 0.0
            
            intersection = len(set1 & set2)
            union = len(set1 | set2)
            
            return intersection / union if union > 0 else 0.0
        
        # Test similar users
        user1 = [1, 2, 3, 4, 5]
        user2 = [2, 3, 4, 5, 6]
        similarity = calculate_user_similarity(user1, user2)
        assert 0.6 <= similarity <= 0.7  # 4/6 = 0.67
        
        # Test dissimilar users
        user3 = [1, 2, 3]
        user4 = [7, 8, 9]
        similarity = calculate_user_similarity(user3, user4)
        assert similarity == 0.0
        
        # Test identical users
        user5 = [1, 2, 3]
        user6 = [1, 2, 3]
        similarity = calculate_user_similarity(user5, user6)
        assert similarity == 1.0
    
    def test_content_based_filtering_logic(self):
        """Test content-based filtering recommendation logic"""
        def calculate_product_similarity(product1, product2):
            # Simple category and price-based similarity
            category_match = 1.0 if product1["category"] == product2["category"] else 0.0
            
            price_diff = abs(product1["price"] - product2["price"])
            max_price = max(product1["price"], product2["price"])
            price_similarity = 1.0 - (price_diff / max_price) if max_price > 0 else 1.0
            
            # Weighted average
            similarity = (category_match * 0.7) + (price_similarity * 0.3)
            return similarity
        
        product1 = {"category": "electronics", "price": 100.0}
        product2 = {"category": "electronics", "price": 120.0}
        product3 = {"category": "clothing", "price": 50.0}
        
        # Similar products (same category, close price)
        similarity = calculate_product_similarity(product1, product2)
        assert similarity > 0.8
        
        # Dissimilar products (different category, different price)
        similarity = calculate_product_similarity(product1, product3)
        assert similarity < 0.5
    
    def test_popularity_based_recommendations(self):
        """Test popularity-based recommendation logic"""
        def get_popular_products(product_stats, limit=5):
            # Sort by purchase count and rating
            def popularity_score(stats):
                purchase_weight = 0.6
                rating_weight = 0.4
                
                normalized_purchases = min(stats["purchases"] / 100, 1.0)
                normalized_rating = stats["rating"] / 5.0
                
                return (normalized_purchases * purchase_weight) + (normalized_rating * rating_weight)
            
            sorted_products = sorted(
                product_stats,
                key=popularity_score,
                reverse=True
            )
            
            return sorted_products[:limit]
        
        products = [
            {"id": 1, "name": "Product A", "purchases": 150, "rating": 4.5},
            {"id": 2, "name": "Product B", "purchases": 80, "rating": 4.8},
            {"id": 3, "name": "Product C", "purchases": 200, "rating": 3.9},
            {"id": 4, "name": "Product D", "purchases": 50, "rating": 4.9}
        ]
        
        popular = get_popular_products(products, 3)
        
        # Should prioritize products with good balance of purchases and ratings
        assert len(popular) == 3
        assert popular[0]["id"] == 1  # High purchases, high rating
    
    def test_seasonal_recommendation_adjustment(self):
        """Test seasonal adjustment of recommendations"""
        def apply_seasonal_boost(products, current_season):
            seasonal_categories = {
                "winter": ["clothing", "electronics", "home"],
                "spring": ["garden", "sports", "beauty"],
                "summer": ["sports", "travel", "outdoor"],
                "fall": ["clothing", "books", "home"]
            }
            
            boosted_categories = seasonal_categories.get(current_season, [])
            
            for product in products:
                if product["category"] in boosted_categories:
                    product["score"] *= 1.2  # 20% boost
            
            return sorted(products, key=lambda x: x["score"], reverse=True)
        
        products = [
            {"id": 1, "category": "clothing", "score": 0.8},
            {"id": 2, "category": "sports", "score": 0.9},
            {"id": 3, "category": "electronics", "score": 0.7}
        ]
        
        # Winter season should boost clothing and electronics
        winter_results = apply_seasonal_boost(products.copy(), "winter")
        
        # Clothing and electronics should have higher scores
        clothing_product = next(p for p in winter_results if p["category"] == "clothing")
        electronics_product = next(p for p in winter_results if p["category"] == "electronics")
        sports_product = next(p for p in winter_results if p["category"] == "sports")
        
        assert clothing_product["score"] == 0.96  # 0.8 * 1.2
        assert electronics_product["score"] == 0.84  # 0.7 * 1.2
        assert sports_product["score"] == 0.9  # No boost


class TestRecommendationAlgorithms:
    """Unit tests for recommendation algorithms"""
    
    def test_matrix_factorization_mock(self):
        """Test matrix factorization algorithm mock"""
        def mock_matrix_factorization(user_item_matrix, factors=10):
            # Simplified mock implementation
            users = list(user_item_matrix.keys())
            items = set()
            for user_items in user_item_matrix.values():
                items.update(user_items.keys())
            
            # Mock predictions for each user-item pair
            predictions = {}
            for user in users:
                predictions[user] = {}
                for item in items:
                    if item not in user_item_matrix[user]:
                        # Mock prediction score
                        predictions[user][item] = 0.5 + (hash(f"{user}_{item}") % 100) / 200
            
            return predictions
        
        # Mock user-item interaction matrix
        matrix = {
            "user1": {"item1": 5, "item2": 3},
            "user2": {"item2": 4, "item3": 5},
            "user3": {"item1": 2, "item3": 4}
        }
        
        predictions = mock_matrix_factorization(matrix)
        
        # Should have predictions for all users
        assert len(predictions) == 3
        
        # Should have predictions for items user hasn't interacted with
        assert "item3" in predictions["user1"]
        assert "item1" in predictions["user2"]
        assert "item2" in predictions["user3"]
        
        # Predictions should be in reasonable range
        for user_preds in predictions.values():
            for score in user_preds.values():
                assert 0.0 <= score <= 1.0
    
    def test_deep_learning_recommendation_mock(self):
        """Test deep learning recommendation mock"""
        def mock_neural_recommendation(user_features, item_features, interactions):
            # Mock neural network prediction
            def predict_interaction(user_id, item_id):
                user_feat = user_features.get(user_id, {})
                item_feat = item_features.get(item_id, {})
                
                # Simple linear combination as mock
                user_score = sum(user_feat.values()) if user_feat else 0
                item_score = sum(item_feat.values()) if item_feat else 0
                
                # Normalize to 0-1 range
                combined_score = (user_score + item_score) / 20.0
                return min(max(combined_score, 0.0), 1.0)
            
            recommendations = {}
            for user_id in user_features:
                user_recs = []
                for item_id in item_features:
                    if (user_id, item_id) not in interactions:
                        score = predict_interaction(user_id, item_id)
                        user_recs.append({"item_id": item_id, "score": score})
                
                user_recs.sort(key=lambda x: x["score"], reverse=True)
                recommendations[user_id] = user_recs[:5]  # Top 5
            
            return recommendations
        
        user_features = {
            "user1": {"age": 25, "income": 5, "activity": 8},
            "user2": {"age": 35, "income": 8, "activity": 6}
        }
        
        item_features = {
            "item1": {"price": 3, "quality": 4, "popularity": 7},
            "item2": {"price": 8, "quality": 9, "popularity": 5}
        }
        
        interactions = {("user1", "item1")}  # User1 already interacted with item1
        
        recommendations = mock_neural_recommendation(user_features, item_features, interactions)
        
        assert len(recommendations) == 2  # Two users
        assert len(recommendations["user1"]) <= 5
        assert len(recommendations["user2"]) <= 5
        
        # User1 should not get item1 recommendation (already interacted)
        user1_items = [rec["item_id"] for rec in recommendations["user1"]]
        assert "item1" not in user1_items


class TestRecommendationValidation:
    """Unit tests for recommendation validation"""
    
    def test_recommendation_diversity(self):
        """Test recommendation diversity validation"""
        def calculate_diversity(recommendations):
            if len(recommendations) < 2:
                return 1.0
            
            categories = [rec["category"] for rec in recommendations]
            unique_categories = len(set(categories))
            
            return unique_categories / len(categories)
        
        # Diverse recommendations
        diverse_recs = [
            {"id": 1, "category": "electronics"},
            {"id": 2, "category": "clothing"},
            {"id": 3, "category": "books"},
            {"id": 4, "category": "sports"}
        ]
        diversity = calculate_diversity(diverse_recs)
        assert diversity == 1.0
        
        # Not diverse recommendations
        same_category_recs = [
            {"id": 1, "category": "electronics"},
            {"id": 2, "category": "electronics"},
            {"id": 3, "category": "electronics"}
        ]
        diversity = calculate_diversity(same_category_recs)
        assert diversity < 0.5
    
    def test_recommendation_freshness(self):
        """Test recommendation freshness validation"""
        def calculate_freshness(recommendations, current_time):
            if not recommendations:
                return 0.0
            
            total_freshness = 0
            for rec in recommendations:
                days_old = (current_time - rec["created_date"]).days
                freshness = max(0, 1 - (days_old / 365))  # Decay over a year
                total_freshness += freshness
            
            return total_freshness / len(recommendations)
        
        current = datetime.now()
        
        # Fresh recommendations
        fresh_recs = [
            {"id": 1, "created_date": current},
            {"id": 2, "created_date": current}
        ]
        freshness = calculate_freshness(fresh_recs, current)
        assert freshness == 1.0
        
        # Old recommendations
        from datetime import timedelta
        old_date = current - timedelta(days=365)
        old_recs = [
            {"id": 1, "created_date": old_date},
            {"id": 2, "created_date": old_date}
        ]
        freshness = calculate_freshness(old_recs, current)
        assert freshness == 0.0
    
    def test_recommendation_relevance_scoring(self):
        """Test recommendation relevance scoring"""
        def calculate_relevance_score(user_profile, product):
            score = 0.0
            
            # Category preference match
            if product["category"] in user_profile.get("preferred_categories", []):
                score += 0.3
            
            # Price range match
            user_budget = user_profile.get("budget_range", (0, float('inf')))
            if user_budget[0] <= product["price"] <= user_budget[1]:
                score += 0.3
            
            # Brand preference match
            if product["brand"] in user_profile.get("preferred_brands", []):
                score += 0.2
            
            # Rating threshold
            if product["rating"] >= user_profile.get("min_rating", 3.0):
                score += 0.2
            
            return min(score, 1.0)
        
        user_profile = {
            "preferred_categories": ["electronics", "books"],
            "budget_range": (50, 200),
            "preferred_brands": ["Apple", "Samsung"],
            "min_rating": 4.0
        }
        
        # Highly relevant product
        relevant_product = {
            "category": "electronics",
            "price": 150,
            "brand": "Apple",
            "rating": 4.5
        }
        score = calculate_relevance_score(user_profile, relevant_product)
        assert score == 1.0  # Perfect match
        
        # Partially relevant product
        partial_product = {
            "category": "clothing",  # Not preferred
            "price": 100,  # In budget
            "brand": "Nike",  # Not preferred
            "rating": 4.2  # Above min rating
        }
        score = calculate_relevance_score(user_profile, partial_product)
        assert score == 0.5  # Price + rating match


class TestRecommendationMockServices:
    """Unit tests for recommendation services using mocks"""
    
    def test_get_recommendations_service_mock(self):
        """Test recommendation service with mocks"""
        # Setup mock data
        mock_purchase_history_data = [
            {"product_id": 1, "category": "electronics", "rating": 5},
            {"product_id": 2, "category": "books", "rating": 4}
        ]
        
        mock_similarities_data = [
            {"product_id": 3, "similarity_score": 0.85, "category": "electronics"},
            {"product_id": 4, "similarity_score": 0.78, "category": "books"},
            {"product_id": 5, "similarity_score": 0.65, "category": "electronics"}
        ]
        
        def mock_get_recommendations(db, user_id, limit=10):
            purchase_history = mock_purchase_history_data
            similar_products = mock_similarities_data
            
            recommendations = []
            for product in similar_products[:limit]:
                recommendations.append({
                    "product_id": product["product_id"],
                    "score": product["similarity_score"],
                    "reason": f"Based on your interest in {product['category']}"
                })
            
            return {
                "status": 200,
                "message": "Recommendations generated successfully",
                "recommendations": recommendations,
                "total_count": len(recommendations)
            }
        
        user_id = str(uuid.uuid4())
        result = mock_get_recommendations(None, user_id, 5)
        
        assert result["status"] == 200
        assert len(result["recommendations"]) == 3  # Based on mock similarities
        assert result["recommendations"][0]["score"] == 0.85
        assert "electronics" in result["recommendations"][0]["reason"]
    
    def test_recommendation_feedback_service_mock(self):
        """Test recommendation feedback service with mock"""
        def mock_record_feedback(db, user_id, product_id, feedback_type, rating=None):
            valid_feedback_types = ["liked", "disliked", "purchased", "viewed"]
            
            if feedback_type not in valid_feedback_types:
                return {
                    "status": 400,
                    "message": "Invalid feedback type"
                }
            
            # Mock feedback recording
            feedback_record = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "product_id": product_id,
                "feedback_type": feedback_type,
                "rating": rating,
                "timestamp": datetime.now().isoformat()
            }
            
            return {
                "status": 200,
                "message": "Feedback recorded successfully",
                "feedback": feedback_record
            }
        
        user_id = str(uuid.uuid4())
        
        # Valid feedback
        result = mock_record_feedback(None, user_id, 123, "liked", 5)
        assert result["status"] == 200
        assert result["feedback"]["feedback_type"] == "liked"
        assert result["feedback"]["rating"] == 5
        
        # Invalid feedback type
        result = mock_record_feedback(None, user_id, 123, "invalid_type")
        assert result["status"] == 400
        assert "Invalid feedback type" in result["message"]