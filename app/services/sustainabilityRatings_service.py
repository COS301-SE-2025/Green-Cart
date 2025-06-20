from sqlalchemy.orm import Session
from app.models.sustainability_ratings import SustainabilityRating
from app.models.product import Product
from fastapi import HTTPException

def fetchSustainabilityRatings(request, db : Session):
    productID = request.get("product_id", -1)

    if not db.query(Product).filter(Product.id == productID).first():
        raise HTTPException(status_code=404, detail="Product ID not found")

    statistics = db.query(SustainabilityRating).filter(SustainabilityRating.product_id == productID)

    if request.get("type", None) != None:
        types = request.get("type", [])
        statistics = statistics.filter(SustainabilityRating.type.in_(types))

    statistics = statistics.all()

    currentSum = 0
    minSum = 0
    maxSum = 0

    for x in statistics:
        if x.type == "energy_efficiency": #2
            EE = x.value

            currentSum += EE
            minSum += 1
            maxSum += 5
        
        elif x.type == "carbon_footprint": #1
            CF = normalizeCarbonFootprint(x.value)

            currentSum += CF
            minSum += 1
            maxSum += 5

        elif x.type == "recyclability": #2
            RC = x.value

            currentSum += RC
            minSum += 1
            maxSum += 5
        
        elif x.type == "durability": #4
            DU = x.value

            currentSum += DU
            minSum += 1
            maxSum += 5
        
        elif x.type == "sustainable_materials": #3
            SM = x.value

            currentSum += SM
            minSum += 1
            maxSum += 5

    EcologicalImpact = ((currentSum - minSum) / (maxSum - minSum)) * 100

    return {
        "status": 200,
        "message": "Success",
        "rating": EcologicalImpact,
        "statistics": statistics
    }

        

def normalizeCarbonFootprint(value):
    return 6 - value