import logging
import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables from .env file - load as early as possible
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path, verbose=True)

# Validate critical environment variables
openai_key = os.getenv('OPENAI_API_KEY')
if openai_key and openai_key != 'your-openai-api-key-here':
    print("OpenAI API key loaded successfully from environment variables")
else:
    print("OpenAI API key not found or using default value. Please check your .env file.")

# Core models (ensures SQLAlchemy metadata is loaded)
import app.models  # noqa

# Routers – core
from app.routes import product
from app.routes import authentication
from app.routes import users
from app.routes import sustainabilityRatings
from app.routes import cart
from app.routes import orders
from app.routes import donation
from app.routes import retailer_user
from app.routes import retailer_metrics
from app.routes import retailer_products
from app.routes import carbon_forecasting
from app.routes import admin_orders

# Routers – admin/aws and images
from app.routes import admin_metrics
from app.routes import admin_users
from app.routes import admin_auth
from app.routes import admin_retailers
from app.routes import admin_products
from app.routes import images
from app.routes import admin_fix_images
from app.routes import admin_database
from app.routes import product_with_images  # AWS S3 product+images endpoint

# MCP Recommendation Engine
from app.routes import recommendations

# Test routes
from app.routes import test_email

# Optional routers from integration branch (guarded so app won’t break if missing)
try:
    from app.routes import admin_stock
except Exception as e:  # pragma: no cover
    admin_stock = None
    logging.getLogger(__name__).warning("Optional router 'admin_stock' not available: %s", e)

try:
    from app.routes import carbon_goals
except Exception as e:  # pragma: no cover
    carbon_goals = None
    logging.getLogger(__name__).warning("Optional router 'carbon_goals' not available: %s", e)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("greencart")

app = FastAPI(title="Green Cart API", version="1.2.2")

# Health check
@app.get("/health")
async def health_check():
    logger.info("Health check endpoint called - v1.2.2")
    return {"status": "healthy", "message": "Backend is running", "version": "1.2.2"}

# CORS (secure prod origins + local dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://www.greencart-cos301.co.za",
        "https://greencart-cos301.co.za",
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
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
app.include_router(admin_orders.router)

# Admin/AWS/image related
app.include_router(admin_metrics.router)
app.include_router(admin_users.router)
app.include_router(admin_auth.router)
app.include_router(admin_retailers.router)
app.include_router(admin_products.router)
app.include_router(images.router)
app.include_router(admin_fix_images.router)
app.include_router(admin_database.router)
app.include_router(product_with_images.router)
app.include_router(carbon_forecasting.router, prefix="/api")

# MCP Recommendation Engine
app.include_router(recommendations.recommendation_router)

# Test routes
app.include_router(test_email.router)

# Optional integrations
if admin_stock:
    app.include_router(admin_stock.router)
if carbon_goals:
    app.include_router(carbon_goals.router, prefix="/api", tags=["Carbon Goals"])

# Static mount for any locally stored uploads (kept for compatibility)
uploads_dir = Path(__file__).parent.parent / "uploads"
uploads_dir.mkdir(exist_ok=True)  # Create directory if it doesn't exist
app.mount("/static", StaticFiles(directory=str(uploads_dir)), name="static")
