from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.user import UserInformationResponse, SetUserInformationRequest, SetUserInformationResponse, ChangeUserPasswordRequest, ChangeUserPasswordResponse, setupMFAResponse, isMFASetupResponse, disableMFAResponse, verifyMFARequest, verifyMFAResponse
from app.services.user_service import get_user_information, set_user_information, change_password, mfa_setup, is_MFA, disable_MFA, verify_2fa_code

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

@router.get('/isMFA/{email}', response_model=isMFASetupResponse)
def isMFA(email: str, db : Session = Depends(get_db)):
    return is_MFA(email, db)

@router.get('/disableMFA/{user_id}', response_model=disableMFAResponse)
def disableMFA(user_id: str, db : Session = Depends(get_db)):
    return disable_MFA(user_id, db)

@router.post('/verifyMFA', response_model=verifyMFAResponse)
def verifyMFA(request: verifyMFARequest, db : Session = Depends(get_db)):
    return verify_2fa_code(request.user_id, request.code, db)