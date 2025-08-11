from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.retailer_information import RetailerInformation
from app.schemas.retailer import RetailerCreate, RetailerLogin, ShopInfo
from app.utilities.utils import hash_password, verify_password
from typing import Optional, List
import uuid

def create_retailer_user(db: Session, retailer: RetailerCreate):
    """Create a new retailer user in users table and create their first shop"""
    
    # Check if user already exists with this email
    existing_user = db.query(User).filter(User.email == retailer.email).first()
    if existing_user:
        # User exists, create a new shop for them
        db_user = existing_user
    else:
        # Create new user
        hashed_password = hash_password(retailer.password)
        user_id = str(uuid.uuid4())
        db_user = User(
            id=user_id,
            name=retailer.name,
            email=retailer.email,
            password=hashed_password
        )
        db.add(db_user)
        db.flush()  # Flush to ensure user is created and get the ID
    
    # Create retailer shop linked to the user
    db_retailer = RetailerInformation(
        name=retailer.name,
        description=retailer.description,
        user_id=db_user.id,
        banner_image=None
    )
    
    db.add(db_retailer)
    db.commit()
    db.refresh(db_retailer)
    
    return db_retailer

def get_user_by_email(db: Session, email: str):
    """Get user by email from users table"""
    return db.query(User).filter(User.email == email).first()

def get_user_shops(db: Session, user_id: str) -> List[RetailerInformation]:
    """Get all retailer shops for a user"""
    return db.query(RetailerInformation).filter(
        RetailerInformation.user_id == user_id
    ).all()

def authenticate_retailer(db: Session, retailer_login: RetailerLogin):
    """Authenticate retailer user and return all their shops"""
    user = get_user_by_email(db, retailer_login.email)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(retailer_login.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Get all shops for this user
    shops = get_user_shops(db, user.id)
    
    if not shops:
        raise HTTPException(status_code=404, detail="No retailer shops found for this user")
    
    # Convert to ShopInfo objects
    shop_list = [
        ShopInfo(
            id=shop.id,
            name=shop.name,
            description=shop.description,
            banner_image=shop.banner_image
        )
        for shop in shops
    ]
    
    return {
        "user_id": user.id,
        "user_name": user.name,
        "email": user.email,
        "retailer_id": shops[0].id if shops else None,  # Include first retailer ID
        "shops": shop_list
    }

def get_shop_by_id(db: Session, shop_id: int, user_id: str):
    """Get a specific shop by ID if it belongs to the user"""
    shop = db.query(RetailerInformation).filter(
        RetailerInformation.id == shop_id,
        RetailerInformation.user_id == user_id
    ).first()
    
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found or doesn't belong to user")
    
    return shop
