from sqlalchemy import Column, String, Text, Date, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, index=True)
    name = Column(Text, nullable=True)
    email = Column(Text, unique=True, index=True, nullable=True)
    password = Column(Text, nullable=True)  # store hashed
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    date_of_birth = Column(Date, nullable=True)
    country_code = Column(String(4), nullable=True)
    telephone = Column(String(9), nullable=True)

    orders = relationship("Order", back_populates="user", cascade="all, delete")
    address = relationship("Address", back_populates="user", cascade="all, delete")
    retailer_information = relationship("RetailerInformation", back_populates="user", cascade="all, delete")
    
