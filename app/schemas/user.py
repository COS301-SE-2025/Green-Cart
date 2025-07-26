from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str

    class Config:
        from_attributes = True

class UserInformation(BaseModel):
    id: str
    name: str 
    email: str
    date_of_birth: Optional[date] = None
    coutry_code: Optional[str] = None
    telephone: Optional[str] = None

class Address(BaseModel):
    id: int
    user_id: str
    address: str
    city: str
    postal_code: str

class UserInformationResponse(BaseModel):
    status: int
    message: str
    user: UserInformation
    address: Optional[Address] = None

class SetUserInformationRequest(BaseModel):
    user_id: str
    name: Optional[str]
    email: Optional[EmailStr]
    date_of_birth: Optional[date]
    country_code: Optional[str]
    telephone: Optional[str]
    address: str
    city: str
    postal_code: str

class SetUserInformationResponse(BaseModel):
    status: int
    message: str