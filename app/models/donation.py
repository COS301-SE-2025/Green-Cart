from sqlalchemy import Column, Integer, Float, ForeignKey
from app.db.database import Base

class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)
    total = Column(Float)
    charity_id = Column(Integer, ForeignKey("charities.id"))
    order_id = Column(Integer, ForeignKey("orders.id"))
