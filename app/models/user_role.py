from sqlalchemy import Column, Integer, String
from app.db.database import Base


class UserRole(Base):
    __tablename__ = "user_roles"

    user_id = Column(String(36), primary_key=True, index=True)
    role_id = Column(Integer, primary_key=True, index=True)
