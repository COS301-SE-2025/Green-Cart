from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime

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
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserInformation(BaseModel):
    id: str
    name: str 
    email: str
    created_at: Optional[datetime] = None
    date_of_birth: Optional[date] = None
    country_code: Optional[str] = None
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

class ChangeUserPasswordRequest(BaseModel):
    user_id: str
    old_password: str
    new_password: str

class ChangeUserPasswordResponse(BaseModel):
    status: int
    message: str

class setupMFAResponse(BaseModel):
    status: int
    message: str
    qr_code: str
    secret: str

class isMFASetupResponse(BaseModel):
    status: int
    message: str
    enabled: bool

class disableMFAResponse(BaseModel):
    status: int
    message: str