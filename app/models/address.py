from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Address(Base):
    __tablename__ = "address"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    address = Column(String(255), nullable=True)
    city = Column(String(255), nullable=True)
    postal_code = Column(String(4), nullable=True)

    user = relationship("User", back_populates="address")