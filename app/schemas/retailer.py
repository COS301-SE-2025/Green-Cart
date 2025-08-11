from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime

class RetailerInformation(BaseModel):
    id: int
    name: str
    description: str
    banner_image: Optional[str] = None

class ContacInformation(BaseModel):
    type: str
    name: str
    value: str

class RetailerCreate(BaseModel):
    name: str
    description: str
    email: EmailStr
    password: str

class RetailerLogin(BaseModel):
    email: EmailStr
    password: str

class ShopInfo(BaseModel):
    id: int
    name: str
    description: str
    banner_image: Optional[str] = None
    
    class Config:
        from_attributes = True

class RetailerLoginResponse(BaseModel):
    user_id: str
    user_name: str
    email: str
    retailer_id: Optional[int] = None  # Add retailer integer ID
    shops: list[ShopInfo]
    
class RetailerResponse(BaseModel):
    id: int
    name: str
    description: str
    user_id: str
    
    class Config:
        from_attributes = True

class ShopSelectionRequest(BaseModel):
    shop_id: int

class ShopSelectionResponse(BaseModel):
    shop: ShopInfo
    user_id: str
    message: str

class RegisterAsRetailerRequest(BaseModel):
    user_id: str
    name: str
    description: str
    banner_image: Optional[str] = None

class RegisterAsRetailerResponse(BaseModel):
    status: int
    message: str

class SetRetailerInformationRequest(BaseModel):
    user_id: str
    name: str
    description: str
    banner_image: str

class SetRetailerInformationResponse(BaseModel):
    status: int
    message: str

