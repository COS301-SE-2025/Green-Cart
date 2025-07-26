from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.retailer_information import RetailerInformation

def register_as_retailer(request, db : Session):
    user = db.query(User).filter(User.id == request.user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not request.name or request.name == "":
        raise HTTPException(status_code=400, detail="Name is required")

    if not request.description or request.description == "":
        raise HTTPException(status_code=400, detail="Description is required")

    try:
        retailer_info = RetailerInformation(
            name=request.name,
            description=request.description,
            user_id=user.id,
            banner_image=request.banner_image
        )
        db.add(retailer_info)
        db.commit()
        db.refresh(retailer_info)

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
    return {
        "status": 200,
        "message": "Retailer registered successfully"
    }
    
def set_retailer_information(request, db: Session):
    retailer_info = db.query(RetailerInformation).filter(RetailerInformation.user_id == request.user_id).first()

    if not retailer_info:
        raise HTTPException(status_code=404, detail="Retailer information not found")

    retailer_info.name = request.name
    retailer_info.description = request.description
    retailer_info.banner_image = request.banner_image

    db.commit()
    db.refresh(retailer_info)

    return {
        "status": 200,
        "message": "Retailer information updated successfully"
    }