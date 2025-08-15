from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.role import Role
from app.models.user_role import UserRole
from app.utilities.utils import verify_password, hash_password

ADMIN_ROLE_NAME = "admin"


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def user_has_admin_role(db: Session, user_id: str) -> bool:
    """Return True if the user has any role with name containing 'admin' (case-insensitive)."""
    match = (
        db.query(Role)
        .join(UserRole, UserRole.role_id == Role.id)
        .filter(UserRole.user_id == user_id)
        .filter(Role.name.ilike("%admin%"))
        .first()
    )
    return match is not None


def authenticate_admin(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(password, user.password):
        # Fallback for legacy plaintext admin passwords (rehash on first successful login)
        if user.password == password:
            user.password = hash_password(password)
            db.add(user)
            db.commit()
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user_has_admin_role(db, user.id):
        raise HTTPException(status_code=403, detail="User is not an admin")

    return {
        "status": 200,
        "message": "Admin login successful",
        "user_id": user.id,
    "name": user.name,
        "email": user.email,
        "role": ADMIN_ROLE_NAME,
    }
