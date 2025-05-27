from pydantic import BaseModel

class ProductImageResponse(BaseModel):
    id: int
    product_id: int
    image_url: str

    class Config:
        from_attributes = True
