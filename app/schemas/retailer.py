from pydantic import BaseModel, Field
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

