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
    
    # Simple average calculation - no complex weighting or penalties
    # Only use the values that are actually provided
    valid_scores = []
    for type_name in frontend_types:
        if type_name in available_averages:
            score = available_averages[type_name]
            valid_scores.append(score)
            logging.info(f"✓ {type_name}: {score:.1f}%")
        else:
            logging.info(f"✗ {type_name}: not provided (skipped)")
    
    if not valid_scores:
        return 0.0
    
    # Calculate simple average of provided scores
    final_score = sum(valid_scores) / len(valid_scores)
    
    logging.info(f"Final sustainability score: {final_score:.1f} (average of {len(valid_scores)} metrics)")
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