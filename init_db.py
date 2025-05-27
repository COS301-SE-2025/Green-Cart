# init_db.py

from app.db.database import Base, engine
from app.models.product import Product

def init():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Done.")

if __name__ == "__main__":
    init()
