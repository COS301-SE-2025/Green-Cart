import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.models.product import Product

def test_product_creation():
    product = Product(
        id=1,
        name="Test Product",
        description="A test product",
        price=99.99
    )
    assert product.id == 1
    assert product.name == "Test Product"
    assert product.description == "A test product"
    assert product.price == 99.99
