from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.admin import AdminLogin, AdminLoginResponse
from app.services.admin_auth_service import authenticate_admin

router = APIRouter(prefix="/admin", tags=["Admin Auth"])


@router.post("/signin", response_model=AdminLoginResponse)
def admin_signin(payload: AdminLogin, db: Session = Depends(get_db)):
    result = authenticate_admin(db, payload.email, payload.password)
    return AdminLoginResponse(**result)
