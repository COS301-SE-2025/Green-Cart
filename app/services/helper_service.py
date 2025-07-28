from sqlalchemy.orm import Session
from app.models.categories import Category
from app.models.sustainability_type import SustainabilityType

def get_all_categories(db: Session):
    """
    Get all available categories
    """
    return db.query(Category).all()

def get_all_sustainability_types(db: Session):
    """
    Get all available sustainability types
    """
    return db.query(SustainabilityType).filter(SustainabilityType.is_active == True).all()
