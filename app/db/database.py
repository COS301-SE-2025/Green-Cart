import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# Load from .env file
load_dotenv()

# Full connection string override (optional)
DATABASE_URL = os.getenv("DATABASE_URL")

# If not provided, construct from parts
if not DATABASE_URL:
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_USER = os.getenv("DB_USER", "postgres")
    
    # Support both DB_PASS and DB_PASSWORD
    DB_PASS = os.getenv("DB_PASS") or os.getenv("DB_PASSWORD")
    
    DB_NAME = os.getenv("DB_NAME", "greencart")

    if DB_PASS:
        DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    else:
        DATABASE_URL = f"postgresql://{DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# SQLAlchemy setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
