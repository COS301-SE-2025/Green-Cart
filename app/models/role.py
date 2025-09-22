from sqlalchemy import Column, Integer, Text
from app.db.database import Base


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, nullable=False)
