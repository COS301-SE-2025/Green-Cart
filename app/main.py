from fastapi import FastAPI
from app.routes import product
from app.routes import user

app = FastAPI()

app.include_router(product.router)
app.include_router(user.router, prefix="/auth", tags=["Auth"])