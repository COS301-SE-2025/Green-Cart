from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
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
from app.routes import images
from app.routes import admin_fix_images
from app.routes import admin_database
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Green Cart API", version="1.0.0")

# Add health check endpoint
@app.get("/health")
async def health_check():
    logger.info("Health check endpoint called")
    return {"status": "healthy", "message": "Backend is running"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://www.greencart-cos301.co.za",
        "https://greencart-cos301.co.za", 
        "http://localhost:3000",  # For development
        "http://localhost:5173",  # For Vite dev server
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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
app.include_router(images.router)
app.include_router(admin_fix_images.router)
app.include_router(admin_database.router)

# Mount static files for serving uploaded images
app.mount("/static", StaticFiles(directory="uploads"), name="static")