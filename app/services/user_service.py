from http.client import HTTPException
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.address import Address
from app.schemas.user import UserCreate
from app.utilities.utils import hash_password
import uuid

def create_user(db: Session, user: UserCreate):
    new_user = User(
        id=str(uuid.uuid4()),
        name=user.name,
        email=user.email,
        password=hash_password(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_information(db: Session, user_id: str):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_dict = user.__dict__.copy()
    user_dict.pop("password", None)

    address = db.query(Address).filter(Address.user_id == user.id).first()

    return {
        "status": 200,
        "message": "Success",
        "user": user,
        "address": address
    }