from sqlalchemy.orm import Session
from app.models.user import User
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
