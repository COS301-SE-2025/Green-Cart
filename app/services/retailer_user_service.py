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
    
