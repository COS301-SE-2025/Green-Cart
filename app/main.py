from fastapi import FastAPI
from app.routes import product
from app.routes import authentication
from app.routes import users
from app.routes import sustainabilityRatings
from app.routes import cart 
from app.routes import orders
from app.routes import donation
from app.routes import retailer_user
from app.routes import retailer_metrics
import app.models
from fastapi.middleware.cors import CORSMiddleware
from app.routes import retailer_products
from app.routes import admin_metrics
from app.routes import admin_users
from app.routes import admin_retailers
from app.routes import admin_products

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(product.router)
app.include_router(authentication.router, prefix="/auth", tags=["Auth"])
app.include_router(sustainabilityRatings.router)
app.include_router(cart.router) 
app.include_router(orders.router)
app.include_router(users.router)
app.include_router(donation.router)
app.include_router(retailer_metrics.router) 
app.include_router(retailer_user.router)
app.include_router(retailer_products.router)
app.include_router(admin_metrics.router)
app.include_router(admin_users.router)
app.include_router(admin_retailers.router)
app.include_router(admin_products.router)
app.include_router(admin_metrics.router)