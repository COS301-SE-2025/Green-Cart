from sqlalchemy.orm import Session, joinedload
from app.models.sustainability_ratings import SustainabilityRating
from app.models.sustainability_type import SustainabilityType
from app.models.product import Product
from fastapi import HTTPException
import logging

def fetchSustainabilityRatings(request, db: Session):
    productID = request.get("product_id", -1)

    if not db.query(Product).filter(Product.id == productID).first():
        raise HTTPException(status_code=404, detail="Product ID not found")

    # Join with sustainability_types to get type names
    statistics_query = db.query(SustainabilityRating).options(
        joinedload(SustainabilityRating.type_info)
    ).filter(SustainabilityRating.product_id == productID)

    if request.get("type", None) is not None:
        type_names = request.get("type", [])
        # Convert type names to IDs for filtering
        type_ids = db.query(SustainabilityType.id).filter(
            SustainabilityType.type_name.in_(type_names)
        ).all()
        type_ids = [t[0] for t in type_ids]
        statistics_query = statistics_query.filter(SustainabilityRating.type.in_(type_ids))

    statistics = statistics_query.all()

    if not statistics:
        return {
            "status": 200,
            "message": "No sustainability ratings found for this product",
            "rating": 0.0,
            "statistics": []
        }

    # Calculate dynamic weighted sustainability score
    overall_rating = calculateDynamicSustainabilityScore(statistics, db)

    # Convert statistics to include type names for frontend
    formatted_statistics = []
    for stat in statistics:
        formatted_statistics.append({
            "id": stat.id,
            "product_id": stat.product_id,
            "type": stat.type_info.type_name,  # Use type_name instead of ID
            "value": float(stat.value),
            "created_at": stat.created_at,
            "verification": stat.verification
        })

    return {
        "status": 200,
        "message": "Success",
        "rating": round(overall_rating, 1),
        "statistics": formatted_statistics
    }

def calculateDynamicSustainabilityScore(statistics, db: Session):
    """
    Calculate dynamic sustainability score using actual database type names
    """
    # Get all sustainability types from database for dynamic weighting
    all_types = db.query(SustainabilityType).filter(SustainabilityType.is_active == True).all()
    
    # Create mapping of type names to importance levels
    importance_levels = {}
    main_sustainability_types = []
    
    for stype in all_types:
        importance_levels[stype.type_name] = stype.importance_level
        main_sustainability_types.append(stype.type_name)
    
    logging.info(f"Active sustainability types from database: {main_sustainability_types}")
    
    # Group statistics by type name and calculate averages
    type_averages = {}
    for stat in statistics:
        type_name = stat.type_info.type_name
        if type_name not in type_averages:
            type_averages[type_name] = []
        type_averages[type_name].append(float(stat.value))
    
    # Calculate average for each type
    available_averages = {}
    for type_name, values in type_averages.items():
        available_averages[type_name] = sum(values) / len(values)
    
    if not available_averages:
        return 0.0
    
    logging.info(f"Available averages: {available_averages}")
    
    # Calculate dynamic weights using database types
    weights = calculateDynamicWeights(available_averages, importance_levels, main_sustainability_types)
    
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

def calculateDynamicWeights(available_averages, importance_levels, main_sustainability_types):
    """
    Calculate dynamic weights based on database sustainability types.
    Missing types are assumed to have 0% rating.
    Carbon footprint always gets the highest weight.
    """
    
    # Calculate weights based on ALL main types from database
    total_importance = sum(importance_levels.get(t, 3) for t in main_sustainability_types)
    
    # Calculate proportional weights for ALL main types
    weights = {}
    for type_name in main_sustainability_types:
        importance = importance_levels.get(type_name, 3)
        weights[type_name] = importance / total_importance
    
    # Ensure carbon footprint gets at least 35% of total weight if it exists
    if 'carbon_footprint' in weights:
        min_carbon_weight = 0.35
        if weights['carbon_footprint'] < min_carbon_weight:
            # Adjust weights to give carbon footprint minimum weight
            current_carbon_weight = weights['carbon_footprint']
            adjustment_needed = min_carbon_weight - current_carbon_weight
            
            # Reduce other weights proportionally
            other_types = [t for t in main_sustainability_types if t != 'carbon_footprint']
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
        if type_name not in main_sustainability_types:
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