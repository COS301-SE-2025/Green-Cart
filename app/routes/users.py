from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.user import UserInformationResponse
from app.services.user_service import get_user_information

router = APIRouter(prefix="/users", tags=["Users"])

@router.get('/{user_id}', response_model=UserInformationResponse, summary="Get User Information")
def getUserInformation(user_id: str, db: Session = Depends(get_db)):
    return get_user_information(db, user_id)