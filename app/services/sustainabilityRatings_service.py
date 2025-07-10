from sqlalchemy.orm import Session
from app.models.sustainability_ratings import SustainabilityRating
from app.models.product import Product
from fastapi import HTTPException
import logging

def fetchSustainabilityRatings(request, db: Session):
    productID = request.get("product_id", -1)

    if not db.query(Product).filter(Product.id == productID).first():
        raise HTTPException(status_code=404, detail="Product ID not found")

    statistics = db.query(SustainabilityRating).filter(SustainabilityRating.product_id == productID)

    if request.get("type", None) != None:
        types = request.get("type", [])
        statistics = statistics.filter(SustainabilityRating.type.in_(types))

    statistics = statistics.all()

    if not statistics:
        return {
            "status": 200,
            "message": "No sustainability ratings found for this product",
            "rating": 0.0,
            "statistics": []
        }

    # Calculate weighted sustainability score
    overall_rating = calculateWeightedSustainabilityScore(statistics)

    return {
        "status": 200,
        "message": "Success",
        "rating": round(overall_rating, 1),
        "statistics": statistics
    }

def calculateWeightedSustainabilityScore(statistics):
    """
    Calculate weighted sustainability score based on different rating types.
    Missing sustainability types are treated as 0% (penalizes incomplete data).
    """
    
    # Define weights for different sustainability metrics
    WEIGHTS = {
        'carbon_footprint': 0.35,      # 35%
        'energy_efficiency': 0.25,     # 25%
        'recyclability': 0.20,         # 20%
        'sustainable_materials': 0.15, # 15%
        'durability': 0.05,           # 5%
    }
    
    # Group ratings by type and calculate averages
    type_averages = {}
    for stat in statistics:
        if stat.type not in type_averages:
            type_averages[stat.type] = []
        type_averages[stat.type].append(stat.value)
    
    # Calculate average for each type that exists
    for rating_type in type_averages:
        values = type_averages[rating_type]
        type_averages[rating_type] = sum(values) / len(values)
    
    # Calculate weighted score including ALL weight categories
    weighted_score = 0.0
    total_possible_weight = sum(WEIGHTS.values())  # Should be 1.0
    
    for weight_category, weight in WEIGHTS.items():
        if weight_category in type_averages:
            # Use actual rating if available
            category_score = type_averages[weight_category]
        else:
            # Treat missing categories as 0% (penalty for incomplete data)
            category_score = 0
        
        weighted_score += category_score * weight
        
        # Optional: Log for debugging
        logging.info(f"Category: {weight_category}, Score: {category_score}, Weight: {weight}, Contribution: {category_score * weight}")
    
    # No need to normalize since we're using all weights
    final_score = weighted_score
    
    # Ensure score is within 0-100 range
    return max(0, min(100, final_score))