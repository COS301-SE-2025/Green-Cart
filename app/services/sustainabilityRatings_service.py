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

    # Calculate dynamic weighted sustainability score
    overall_rating = calculateDynamicSustainabilityScore(statistics)

    return {
        "status": 200,
        "message": "Success",
        "rating": round(overall_rating, 1),
        "statistics": statistics
    }

def calculateDynamicSustainabilityScore(statistics):
   
    # Dynamic sustainability scoring system that:
    # 1. Considers ALL main sustainability variables (missing = 0%)
    # 2. Prioritizes carbon_footprint as the most important factor
    # 3. Distributes weight among all variables, not just present ones
    # 4. Works with new/removed variables automatically


    type_averages = {}
    for stat in statistics:
        if stat.type not in type_averages:
            type_averages[stat.type] = []
        type_averages[stat.type].append(stat.value)
    

    available_averages = {}
    for rating_type in type_averages:
        values = type_averages[rating_type]
        available_averages[rating_type] = sum(values) / len(values)
    
  
    if not available_averages:
        return 0.0
    
    # We get the weights for ALL sustainability types (includes missing ones too)
    weights = calculateDynamicWeights(available_averages)
    
    # Calculate weighted score including ALL types
    weighted_score = 0.0
    
    for type_name, weight in weights.items():
        if type_name in available_averages:
            # Use actual rating if available
            rating_value = available_averages[type_name]
        else:
            # Missing sustainability data = 0% rating
            rating_value = 0
        
        contribution = rating_value * weight
        weighted_score += contribution
        
        status = f"(actual: {rating_value:.1f})" if type_name in available_averages else "(missing: 0.0)"
        logging.info(f"Type: {type_name}, Value: {rating_value:.1f} {status}, Weight: {weight:.3f}, Contribution: {contribution:.2f}")
    
    # Apply carbon footprint bonus/penalty if needed
    if 'carbon_footprint' in available_averages:
        carbon_score = available_averages['carbon_footprint']
        if carbon_score >= 80:
            weighted_score *= 1.1  # 10% bonus for excellent carbon performance
            logging.info(f"Carbon footprint bonus applied: {carbon_score:.1f}% -> +10%")
        elif carbon_score <= 30:
            weighted_score *= 0.9  # 10% penalty for poor carbon performance
            logging.info(f"Carbon footprint penalty applied: {carbon_score:.1f}% -> -10%")
    else:
        # Penalty for missing carbon footprint data
        weighted_score *= 0.8  # 20% penalty for missing critical environmental data
        logging.info("Carbon footprint missing -> -20% penalty applied")
    
    # Ensure score is within 0-100 range
    final_score = max(0, min(100, weighted_score))
    
    logging.info(f"Final sustainability score: {final_score:.1f}")
    return final_score

def calculateDynamicWeights(available_averages):
    """
    Calculate dynamic weights based on ALL main sustainability types.
    Missing types are assumed to have 0% rating.
    Carbon footprint always gets the highest weight.
    """
    
    # Define ALL main sustainability variables that should be considered
    MAIN_SUSTAINABILITY_TYPES = [
        'carbon_footprint',
        'energy_efficiency', 
        'recyclability',
        'sustainable_materials',
        'durability'
    ]
    
    # Base importance levels (higher number = more important)
    IMPORTANCE_LEVELS = {
        'carbon_footprint': 10,      # Highest priority
        'energy_efficiency': 7,      # High priority
        'recyclability': 6,          # Medium-high priority
        'sustainable_materials': 5,  # Medium priority
        'durability': 4,            # Lower priority
    }
    
    # Calculate weights based on ALL main types, not just available ones
    total_importance = sum(IMPORTANCE_LEVELS[t] for t in MAIN_SUSTAINABILITY_TYPES)
    
    # Calculate proportional weights for ALL main types
    weights = {}
    for type_name in MAIN_SUSTAINABILITY_TYPES:
        importance = IMPORTANCE_LEVELS[type_name]
        weights[type_name] = importance / total_importance
    
    # Ensure carbon footprint gets at least 35% of total weight
    min_carbon_weight = 0.35
    if weights['carbon_footprint'] < min_carbon_weight:
        # Adjust weights to give carbon footprint minimum weight
        current_carbon_weight = weights['carbon_footprint']
        adjustment_needed = min_carbon_weight - current_carbon_weight
        
        # Reduce other weights proportionally
        other_types = [t for t in MAIN_SUSTAINABILITY_TYPES if t != 'carbon_footprint']
        total_other_weight = sum(weights[t] for t in other_types)
        
        if total_other_weight > 0:
            reduction_factor = (1.0 - min_carbon_weight) / total_other_weight
            
            # Apply reduction to other types
            for type_name in other_types:
                weights[type_name] *= reduction_factor
            
            # Set carbon footprint to minimum weight
            weights['carbon_footprint'] = min_carbon_weight
    
    # Add any additional types that might be present but not in main list
    available_types = list(available_averages.keys())
    for type_name in available_types:
        if type_name not in MAIN_SUSTAINABILITY_TYPES:
            # Give small weight to unknown types
            weights[type_name] = 0.05
    
    # Log the calculated weights for debugging
    logging.info("Dynamic weights calculated (including missing types as 0%):")
    for type_name, weight in weights.items():
        present = "✓" if type_name in available_averages else "✗ (missing = 0%)"
        logging.info(f"  {type_name}: {weight:.3f} ({weight*100:.1f}%) {present}")
    
    return weights

def addNewSustainabilityType(type_name, importance_level=None):
 
    if importance_level is None:
        importance_level = 3  # Default priority if not specified
    
    # This could update a database table or configuration file
    # For now, it's just a placeholder showing how to extend the system

    logging.info(f"New sustainability type added: {type_name} with importance {importance_level}")
    
    return {
        "type": type_name,
        "importance": importance_level,
        "status": "added"
    }

