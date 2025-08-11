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
        # Handle case where type_info relationship might not be loaded
        if stat.type_info:
            type_name = stat.type_info.type_name
        else:
            # Fallback: manually query for type name
            type_record = db.query(SustainabilityType).filter(
                SustainabilityType.id == stat.type
            ).first()
            type_name = type_record.type_name if type_record else str(stat.type)
        
        formatted_statistics.append({
            "id": stat.id,
            "product_id": stat.product_id,
            "type": type_name,  # Use type_name instead of ID
            "value": float(stat.value),
            "created_at": stat.created_at,
            "verification": bool(stat.verification) if stat.verification is not None else False
        })

    return {
        "status": 200,
        "message": "Success",
        "rating": round(overall_rating, 1),
        "statistics": formatted_statistics
    }

def calculateDynamicSustainabilityScore(statistics, db: Session):
    """
    Calculate sustainability score using only the 5 main frontend metrics
    No penalties for missing types - only calculate average of available ratings
    """
    # Frontend sustainability types (matching what frontend sends)
    frontend_types = [
        'energy_efficiency',
        'carbon_footprint', 
        'recyclability',
        'durability',
        'material_sustainability'
    ]
    
    # Define importance levels for weighting
    importance_levels = {
        'energy_efficiency': 1.2,
        'carbon_footprint': 1.3,
        'recyclability': 1.1,
        'durability': 1.0,
        'material_sustainability': 1.15
    }
    
    main_sustainability_types = frontend_types
    
    # Group statistics by type name and calculate averages
    type_averages = {}
    for stat in statistics:
        # Get type name, handle different naming conventions
        if stat.type_info:
            type_name = stat.type_info.type_name.lower().replace(' ', '_')
        else:
            # Fallback
            type_record = db.query(SustainabilityType).filter(
                SustainabilityType.id == stat.type
            ).first()
            type_name = type_record.type_name.lower().replace(' ', '_') if type_record else str(stat.type)
        
        if type_name not in type_averages:
            type_averages[type_name] = []
        type_averages[type_name].append(float(stat.value))
    
    # Calculate average for each available type
    available_averages = {}
    for type_name, values in type_averages.items():
        available_averages[type_name] = sum(values) / len(values)
    
    if not available_averages:
        return 0.0
    
    logging.info(f"Available sustainability ratings: {available_averages}")
    # Calculate dynamic weights using only available types
    weights = calculateDynamicWeights(available_averages, importance_levels, main_sustainability_types)
    
    # Calculate weighted score using ONLY available types
    weighted_score = 0.0
    
    for type_name, weight in weights.items():
        # Only process types that have actual ratings
        if type_name in available_averages:
            rating_value = available_averages[type_name]
            contribution = rating_value * weight
            weighted_score += contribution
            
            logging.info(f"Type: {type_name}, Value: {rating_value:.1f}, Weight: {weight:.3f}, Contribution: {contribution:.2f}")
        # Note: We no longer penalize missing types - we simply ignore them
    
    # Apply carbon footprint bonus/penalty if it's present in the ratings
    if 'Carbon Footprint' in available_averages:
        carbon_score = available_averages['Carbon Footprint']
        if carbon_score >= 80:
            weighted_score *= 1.1  # 10% bonus for excellent carbon performance
            logging.info(f"Carbon footprint bonus applied: {carbon_score:.1f}% -> +10%")
        elif carbon_score <= 30:
            weighted_score *= 0.9  # 10% penalty for poor carbon performance
            logging.info(f"Carbon footprint penalty applied: {carbon_score:.1f}% -> -10%")
    # Note: We no longer penalize for missing carbon footprint - the calculation is based on available data only
    
    # Ensure score is within 0-100 range
    final_score = max(0, min(100, weighted_score))
    
    logging.info(f"Final sustainability score: {final_score:.1f}")
    return final_score

def calculateDynamicWeights(available_averages, importance_levels, main_sustainability_types):
    """
    Calculate dynamic weights based on ONLY the sustainability types that have actual ratings.
    This ensures the average is calculated only from available data, not penalized by missing types.
    Carbon footprint always gets the highest weight if present.
    """
    
    # Calculate weights based on ONLY available types (those with actual ratings)
    available_types = list(available_averages.keys())
    
    # Calculate total importance for available types only
    total_importance = sum(importance_levels.get(t, 3) for t in available_types)
    
    # Calculate proportional weights for ONLY available types
    weights = {}
    for type_name in available_types:
        importance = importance_levels.get(type_name, 3)
        weights[type_name] = importance / total_importance
    
    # Ensure carbon footprint gets at least 35% of total weight if it exists in available types
    if 'Carbon Footprint' in weights:
        min_carbon_weight = 0.35
        if weights['Carbon Footprint'] < min_carbon_weight:
            # Adjust weights to give carbon footprint minimum weight
            current_carbon_weight = weights['Carbon Footprint']
            
            # Reduce other weights proportionally
            other_types = [t for t in available_types if t != 'Carbon Footprint']
            total_other_weight = sum(weights[t] for t in other_types)
            
            if total_other_weight > 0:
                reduction_factor = (1.0 - min_carbon_weight) / total_other_weight
                
                # Apply reduction to other types
                for type_name in other_types:
                    weights[type_name] *= reduction_factor
                
                # Set carbon footprint to minimum weight
                weights['Carbon Footprint'] = min_carbon_weight
    
    # Log the calculated weights for debugging
    logging.info("Dynamic weights calculated (based on available types only):")
    for type_name, weight in weights.items():
        logging.info(f"  {type_name}: {weight:.3f} ({weight*100:.1f}%)")
    
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