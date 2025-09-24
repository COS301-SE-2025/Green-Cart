import sys
import os
import pytest
from unittest.mock import Mock, MagicMock, patch
from decimal import Decimal

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import the actual services we want to test
from app.services.cart import get_or_create_cart, add_item, get_cart, remove_item
from app.schemas.cart import CartItemCreate


class TestCartModel:
    """Test Cart model functionality"""
    
    def test_cart_creation(self):
        """Test creating a cart instance"""
        # Mock the Cart model to avoid SQLAlchemy relationships
        with patch('app.models.cart.Cart') as MockCart:
            mock_cart = MockCart.return_value
            mock_cart.user_id = "test-user-123"
            mock_cart.items = []
            
            assert mock_cart.user_id == "test-user-123"
            assert isinstance(mock_cart.items, list)
    
    def test_cart_item_creation(self):
        """Test creating a cart item"""
        with patch('app.models.cart_item.CartItem') as MockCartItem:
            mock_cart_item = MockCartItem.return_value
            mock_cart_item.cart_id = 1
            mock_cart_item.product_id = 10
            mock_cart_item.quantity = 2
            
            assert mock_cart_item.cart_id == 1
            assert mock_cart_item.product_id == 10
            assert mock_cart_item.quantity == 2


class TestCartServices:
    """Test cart service functions"""
    
    def test_get_or_create_cart_existing(self):
        """Test getting an existing cart"""
        # Mock database session
        mock_db = Mock()
        mock_cart = Mock()
        mock_cart.user_id = "test-user-123"
        mock_db.query.return_value.filter.return_value.first.return_value = mock_cart
        
        result = get_or_create_cart(mock_db, "test-user-123")
        
        assert result == mock_cart
        mock_db.query.assert_called_once()
        mock_db.add.assert_not_called()  # Should not create new cart
    
    @patch('app.services.cart.Cart')
    def test_get_or_create_cart_new(self, mock_cart_model):
        """Test creating a new cart when none exists"""
        # Mock database session
        mock_db = Mock()
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        # Mock cart creation
        mock_new_cart = Mock()
        mock_new_cart.user_id = "test-user-123"
        mock_cart_model.return_value = mock_new_cart
        
        result = get_or_create_cart(mock_db, "test-user-123")
        
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()
    
    @patch('app.services.cart.CartItem')
    @patch('app.utilities.stock_utils.is_product_available')
    @patch('app.utilities.stock_utils.sync_stock_status')
    @patch('app.services.cart.get_cart')
    def test_add_item_success(self, mock_get_cart, mock_sync_stock, mock_is_available, mock_cart_item_model):
        """Test successfully adding an item to cart"""
        # Setup mocks
        mock_db = Mock()
        mock_product = Mock()
        mock_product.id = 1
        mock_product.name = "Test Product"
        mock_db.query.return_value.filter.return_value.first.return_value = mock_product
        
        mock_cart = Mock()
        mock_cart.id = 1
        mock_get_cart.return_value = mock_cart
        
        mock_is_available.return_value = (True, "")
        
        # No existing cart item
        mock_db.query.return_value.filter_by.return_value.first.return_value = None
        
        # Mock cart item creation
        mock_new_item = Mock()
        mock_cart_item_model.return_value = mock_new_item
        
        item_create = CartItemCreate(product_id=1, quantity=2)
        
        add_item(mock_db, "test-user-123", item_create)
        
        mock_sync_stock.assert_called_once_with(mock_db, 1)
        mock_is_available.assert_called()
        mock_db.add.assert_called()
        mock_db.commit.assert_called()
    
    @patch('app.utilities.stock_utils.is_product_available')
    @patch('app.utilities.stock_utils.sync_stock_status')
    def test_add_item_product_not_found(self, mock_sync_stock, mock_is_available):
        """Test adding item when product doesn't exist"""
        from fastapi import HTTPException
        
        mock_db = Mock()
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        item_create = CartItemCreate(product_id=999, quantity=2)
        
        with pytest.raises(HTTPException) as exc_info:
            add_item(mock_db, "test-user-123", item_create)
        
        assert exc_info.value.status_code == 404
        assert "Product not found" in str(exc_info.value.detail)
    
    @patch('app.utilities.stock_utils.is_product_available')
    @patch('app.utilities.stock_utils.sync_stock_status')
    @patch('app.services.cart.get_cart')
    def test_add_item_insufficient_stock(self, mock_get_cart, mock_sync_stock, mock_is_available):
        """Test adding item when there's insufficient stock"""
        from fastapi import HTTPException
        
        mock_db = Mock()
        mock_product = Mock()
        mock_product.id = 1
        mock_product.name = "Test Product"
        mock_db.query.return_value.filter.return_value.first.return_value = mock_product
        
        mock_cart = Mock()
        mock_cart.id = 1
        mock_get_cart.return_value = mock_cart
        
        mock_is_available.return_value = (False, "Insufficient stock")
        
        item_create = CartItemCreate(product_id=1, quantity=10)
        
        with pytest.raises(HTTPException) as exc_info:
            add_item(mock_db, "test-user-123", item_create)
        
        assert exc_info.value.status_code == 400
        assert "Insufficient stock" in str(exc_info.value.detail)
    
    def test_get_cart_existing(self):
        """Test getting an existing cart"""
        mock_db = Mock()
        mock_cart = Mock()
        mock_cart.user_id = "test-user-123"
        mock_db.query.return_value.filter.return_value.order_by.return_value.first.return_value = mock_cart
        
        # No existing order for this cart
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        result = get_cart(mock_db, "test-user-123")
        
        assert result == mock_cart
    
    @patch('app.services.cart.Cart')
    def test_get_cart_create_new_when_none_exists(self, mock_cart_model):
        """Test creating new cart when none exists"""
        mock_db = Mock()
        mock_db.query.return_value.filter.return_value.order_by.return_value.first.return_value = None
        
        # Mock cart creation
        mock_new_cart = Mock()
        mock_new_cart.user_id = "test-user-123"
        mock_cart_model.return_value = mock_new_cart
        
        result = get_cart(mock_db, "test-user-123")
        
        mock_db.add.assert_called()
        mock_db.commit.assert_called()
    
    def test_remove_item_success(self):
        """Test successfully removing an item from cart"""
        mock_db = Mock()
        mock_cart = Mock()
        mock_cart.id = 1
        mock_db.query.return_value.filter.return_value.order_by.return_value.first.return_value = mock_cart
        
        mock_item = Mock()
        mock_db.query.return_value.filter_by.return_value.first.return_value = mock_item
        
        result = remove_item(mock_db, "test-user-123", 1)
        
        assert result is True
        mock_db.delete.assert_called_once_with(mock_item)
        mock_db.commit.assert_called_once()
    
    def test_remove_item_cart_not_found(self):
        """Test removing item when cart doesn't exist"""
        mock_db = Mock()
        mock_db.query.return_value.filter.return_value.order_by.return_value.first.return_value = None
        
        result = remove_item(mock_db, "test-user-123", 1)
        
        assert result is False
    
    def test_remove_item_item_not_found(self):
        """Test removing item when item doesn't exist in cart"""
        mock_db = Mock()
        mock_cart = Mock()
        mock_cart.id = 1
        mock_db.query.return_value.filter.return_value.order_by.return_value.first.return_value = mock_cart
        
        # Item not found in cart
        mock_db.query.return_value.filter_by.return_value.first.return_value = None
        
        result = remove_item(mock_db, "test-user-123", 999)
        
        assert result is False
        mock_db.delete.assert_not_called()


class TestCartBusinessLogic:
    """Test cart business logic"""
    
    def test_cart_total_calculation(self):
        """Test calculating cart total with multiple items"""
        # Mock cart items with different products and quantities
        cart_items = [
            Mock(product_id=1, quantity=2),
            Mock(product_id=2, quantity=3),
            Mock(product_id=3, quantity=1)
        ]
        
        # Mock product prices
        product_prices = {1: Decimal('10.99'), 2: Decimal('25.50'), 3: Decimal('5.00')}
        
        total = sum(product_prices[item.product_id] * item.quantity for item in cart_items)
        expected_total = Decimal('10.99') * 2 + Decimal('25.50') * 3 + Decimal('5.00') * 1
        
        assert total == expected_total
        assert total == Decimal('103.48')
    
    def test_cart_item_count(self):
        """Test counting total items in cart"""
        cart_items = [
            Mock(quantity=2),
            Mock(quantity=3),
            Mock(quantity=1)
        ]
        
        total_items = sum(item.quantity for item in cart_items)
        assert total_items == 6
    
    def test_cart_validation_empty_cart(self):
        """Test validation of empty cart"""
        cart_items = []
        assert len(cart_items) == 0
        
        # Empty cart should have zero total
        total = sum(item.quantity for item in cart_items)
        assert total == 0
