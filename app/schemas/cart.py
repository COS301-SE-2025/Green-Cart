from pydantic import BaseModel
from typing import List

class CartItemCreate(BaseModel):
    product_id: int
    quantity: int

class CartItemOut(CartItemCreate):
    id: int
    class Config:
        orm_mode = True

class CartOut(BaseModel):
    id: int
    user_id: str
    items: List[CartItemOut]
    class Config:
        orm_mode = True
