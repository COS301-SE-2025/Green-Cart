from app.models.product import Product

def test_product_creation():
    product = Product(id=1, name="Test Product", description="Test", price=99.99)
    assert product.name == "Test Product"
    assert product.price == 99.99
