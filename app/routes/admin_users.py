from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["Admin Users"])

@router.get("/users")
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return {
        "status": 200,
        "message": "Success",
        "data": users
    }
