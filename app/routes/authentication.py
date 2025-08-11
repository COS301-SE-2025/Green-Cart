from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.schemas.retailer import RetailerCreate, RetailerLogin, RetailerResponse, RetailerLoginResponse, ShopSelectionRequest, ShopSelectionResponse, ShopInfo
from app.services.user_service import create_user, get_user_by_email
from app.services.retailer_auth_service import create_retailer_user, authenticate_retailer, get_shop_by_id
from app.utilities.utils import verify_password

router = APIRouter()

# User authentication routes
@router.post("/signup", response_model=UserResponse)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing = get_user_by_email(db, user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    return create_user(db, user)

@router.post("/signin", response_model=UserResponse)
def signin(user: UserLogin, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, user.email)
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return db_user

# Retailer authentication routes
@router.post("/retailer/signup", response_model=RetailerResponse)
def retailer_signup(retailer: RetailerCreate, db: Session = Depends(get_db)):
    result = create_retailer_user(db, retailer)
    return RetailerResponse(
        id=result.id,
        name=result.name,
        description=result.description,
        user_id=result.user_id
    )

@router.post("/retailer/signin", response_model=RetailerLoginResponse)
def retailer_signin(retailer: RetailerLogin, db: Session = Depends(get_db)):
    result = authenticate_retailer(db, retailer)
    return RetailerLoginResponse(**result)

@router.post("/retailer/select-shop", response_model=ShopSelectionResponse)
def select_shop(selection: ShopSelectionRequest, db: Session = Depends(get_db)):
    # Note: In a real app, you'd get user_id from the authentication token
    # For now, we'll need to pass it or get it from session
    # This is a simplified implementation
    shop = get_shop_by_id(db, selection.shop_id, "user_id_from_session")
    
    shop_info = ShopInfo(
        id=shop.id,
        name=shop.name,
        description=shop.description,
        banner_image=shop.banner_image
    )
    
    return ShopSelectionResponse(
        shop=shop_info,
        user_id=shop.user_id,
        message=f"Successfully selected shop: {shop.name}"
    )

@router.get("/retailer/shops/by-user/{user_id}")
def get_user_shops_endpoint(user_id: str, db: Session = Depends(get_db)):
    """Get all shops for a specific user"""
    from app.services.retailer_auth_service import get_user_shops
    
    shops = get_user_shops(db, user_id)
    
    if not shops:
        return {
            "status": 200,
            "message": "No shops found for this user",
            "shops": []
        }
    
    # Convert to ShopInfo objects
    shop_list = [
        {
            "id": shop.id,
            "name": shop.name,
            "description": shop.description,
            "banner_image": shop.banner_image
        }
        for shop in shops
    ]
    
    return {
        "status": 200,
        "message": "Shops retrieved successfully",
        "shops": shop_list
    }
