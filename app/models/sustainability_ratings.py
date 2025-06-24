from sqlalchemy import Column, Integer, String, Text, Numeric, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.db.database import Base

class SustainabilityRating(Base):
    __tablename__ = "sustainability_ratings"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    type = Column(Text, nullable=False)  
    value = Column(Integer, nullable=False, info={"min": 1, "max": 5})
    created_at = Column(DateTime, server_default=func.now())