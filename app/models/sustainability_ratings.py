from sqlalchemy import Column, Integer, String, Text, Numeric, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class SustainabilityRating(Base):
    __tablename__ = "sustainability_ratings"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    type = Column(Integer, ForeignKey("sustainability_types.id"), nullable=False)  # Foreign key to sustainability_types
    value = Column(Numeric(5, 2), nullable=False)  # Changed to support decimal values
    created_at = Column(DateTime, server_default=func.now())
    verification = Column(Boolean, default=False, nullable=False)  # Boolean verification field
    
    # Relationship to get the type name
    type_info = relationship("SustainabilityType", back_populates="ratings")