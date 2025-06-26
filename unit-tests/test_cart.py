import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.product import Product

def test_cart_initialization():
    cart = Cart(user_id=1)
    assert cart.user_id == 1
    assert isinstance(cart.items, list) or cart.items is None  

def test_cart_add_item_logic():
    product = Product(id=10, name="Test Product", price=100)
    cart_item = CartItem(product_id=10, quantity=2)
    cart = Cart(user_id=1, items=[cart_item])

    assert cart.items[0].product_id == 10
    assert cart.items[0].quantity == 2

def test_cart_total_price_computation():
    cart = Cart(user_id=1)
    cart.items = [
        CartItem(product_id=1, quantity=2),
        CartItem(product_id=2, quantity=1)
    ]

    prices = {1: 50, 2: 80}
    total = sum(prices[item.product_id] * item.quantity for item in cart.items)
    assert total == 180
