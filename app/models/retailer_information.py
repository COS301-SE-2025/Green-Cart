from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class RetailerInformation(Base):
    __tablename__ = 'retailer_information'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    user_id = Column(String(36), ForeignKey('users.id'))
    banner_image = Column(String, nullable=True)

    products = relationship("Product", back_populates="retailer_information", cascade="all, delete")
    user = relationship("User", back_populates="retailer_information")