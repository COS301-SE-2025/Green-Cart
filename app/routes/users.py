<<<<<<< HEAD
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.user import UserInformationResponse, SetUserInformationRequest, SetUserInformationResponse, ChangeUserPasswordRequest, ChangeUserPasswordResponse
from app.services.user_service import get_user_information, set_user_information, change_password

router = APIRouter(prefix="/users", tags=["Users"])

@router.get('/{user_id}', response_model=UserInformationResponse, summary="Get User Information")
def getUserInformation(user_id: str, db: Session = Depends(get_db)):
    return get_user_information(db, user_id)

@router.patch('/setUserInformation', response_model=SetUserInformationResponse, summary="Set User Information")
def setUserInformation(request: SetUserInformationRequest, db: Session = Depends(get_db)):
    return set_user_information(request, db)

@router.post('/changePassword', response_model=ChangeUserPasswordResponse, summary="Change User Password")
def changeUserPassword(request: ChangeUserPasswordRequest, db: Session = Depends(get_db)):
    return change_password(request, db)
=======
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.user import UserInformationResponse, SetUserInformationRequest, SetUserInformationResponse, ChangeUserPasswordRequest, ChangeUserPasswordResponse, setupMFAResponse
from app.services.user_service import get_user_information, set_user_information, change_password, mfa_setup

router = APIRouter(prefix="/users", tags=["Users"])

@router.get('/{user_id}', response_model=UserInformationResponse, summary="Get User Information")
def getUserInformation(user_id: str, db: Session = Depends(get_db)):
    return get_user_information(db, user_id)

@router.patch('/setUserInformation', response_model=SetUserInformationResponse, summary="Set User Information")
def setUserInformation(request: SetUserInformationRequest, db: Session = Depends(get_db)):
    return set_user_information(request, db)

@router.post('/changePassword', response_model=ChangeUserPasswordResponse, summary="Change User Password")
def changeUserPassword(request: ChangeUserPasswordRequest, db: Session = Depends(get_db)):
    return change_password(request, db)

@router.get('/setupMFA/{user_id}', response_model=setupMFAResponse, summary="Setup Multi-Factor Authentication (MFA)")
def setupMFA(user_id: str, db: Session = Depends(get_db)):
    return mfa_setup(user_id, db)
>>>>>>> 190-two-factor-authentication
