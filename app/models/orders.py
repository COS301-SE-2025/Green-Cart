from sqlalchemy import Column, Integer, String, Text, Numeric, Boolean, ForeignKey, DateTime, Enum
from sqlalchemy.sql import func
from app.db.base import Base
from sqlalchemy.orm import relationship

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    cart_id = Column(Integer, ForeignKey("carts.id"), nullable=False)
    state = Column(Enum("Preparing Order", "Ready for Delivery", "In Transit", "Delivered", "Cancelled"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="orders")