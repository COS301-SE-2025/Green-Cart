from fastapi import FastAPI
from app.routes import product
from app.routes import user
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(product.router)
app.include_router(user.router, prefix="/auth", tags=["Auth"])