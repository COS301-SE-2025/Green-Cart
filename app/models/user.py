from sqlalchemy import Column, String, Text
from sqlalchemy.orm import relationship
from app.db.base import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, index=True)
    name = Column(Text, nullable=False)
    email = Column(Text, unique=True, index=True, nullable=False)
    password = Column(Text, nullable=False)  # store hashed

    orders = relationship("Order", back_populates="user", cascade="all, delete")
