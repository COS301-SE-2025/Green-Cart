from fastapi import FastAPI
from app.routes import product
from app.routes import user
from app.routes import sustainabilityRatings
from app.routes import cart 
from app.routes import orders
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
app.include_router(sustainabilityRatings.router)