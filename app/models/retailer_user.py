from sqlalchemy import Column, String, Text
from sqlalchemy.orm import relationship
from app.db.database import Base

class RetailerUser(Base):
    __tablename__ = "retailer_users"
    
    id = Column(String(36), primary_key=True, index=True)
    name = Column(Text, nullable=False)
    organisation = Column(Text, nullable=False)
    password = Column(Text, nullable=False)  # store hashed
    
    # One retailer user can have one retailer_information profile
    retailer_information = relationship("RetailerInformation", back_populates="retailer_user", cascade="all, delete")
