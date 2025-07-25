from sqlalchemy import Column, String, Text, Date
from sqlalchemy.orm import relationship
from app.db.base import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, index=True)
    name = Column(Text, nullable=True)
    email = Column(Text, unique=True, index=True, nullable=True)
    password = Column(Text, nullable=True)  # store hashed
    date_of_birth = Column(Date, nullable=True)
    country_code = Column(String(4), nullable=True)
    telephone = Column(String(9), nullable=True)

    orders = relationship("Order", back_populates="user", cascade="all, delete")
    address = relationship("Address", back_populates="user", cascade="all, delete")
    
