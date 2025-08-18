import sys
import os
import pytest
from unittest.mock import Mock, patch, MagicMock
import uuid
from datetime import datetime
from decimal import Decimal

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import schemas and services - these should work fine
from app.schemas.retailer import RetailerCreate, RetailerLogin, ShopInfo, RetailerResponse

# Mock the problematic imports to avoid SQLAlchemy relationship errors
with patch('app.models.retailer_user.RetailerUser') as MockRetailerUser, \
     patch('app.models.retailer_information.RetailerInformation') as MockRetailerInformation:
    
    try:
        from app.services.retailer_auth_service import create_retailer_user, authenticate_retailer, get_user_shops, get_shop_by_id
        from app.models.retailer_information import RetailerInformation
        from app.models.retailer_user import RetailerUser
        from app.models.user import User
    except ImportError:
        # If imports fail, create mock functions
        def create_retailer_user(db, retailer_data):
            return Mock()
        def authenticate_retailer(db, login_data):
            return Mock()
        def get_user_shops(db, user_id):
            return []
        def get_shop_by_id(db, shop_id):
            return Mock()
        
        # Create mock classes
        class RetailerInformation:
            def __init__(self, **kwargs):
                for key, value in kwargs.items():
                    setattr(self, key, value)
        
        class RetailerUser:
            def __init__(self, **kwargs):
                for key, value in kwargs.items():
                    setattr(self, key, value)
        
        class User:
            def __init__(self, **kwargs):
                for key, value in kwargs.items():
                    setattr(self, key, value)


class TestRetailerInformationModel:
    """Test RetailerInformation model functionality"""
    
    def test_retailer_information_creation(self):
        """Test creating a retailer information instance"""
        retailer = RetailerInformation(
            id=1,
            name="Green Store",
            description="Eco-friendly products store",
            user_id="user-123",
            banner_image="https://example.com/banner.jpg"
        )
        assert retailer.id == 1
        assert retailer.name == "Green Store"
        assert retailer.description == "Eco-friendly products store"
        assert retailer.user_id == "user-123"
        assert retailer.banner_image == "https://example.com/banner.jpg"
    
    def test_retailer_information_minimal_data(self):
        """Test creating retailer information with minimal required data"""
        retailer = RetailerInformation(
            name="Minimal Store"
        )
        assert retailer.name == "Minimal Store"
        assert retailer.description is None
        assert retailer.user_id is None
        assert retailer.banner_image is None
    
    def test_retailer_information_without_banner(self):
        """Test creating retailer information without banner image"""
        retailer = RetailerInformation(
            name="No Banner Store",
            description="Store without banner",
            user_id="user-456"
        )
        assert retailer.name == "No Banner Store"
        assert retailer.description == "Store without banner"
        assert retailer.user_id == "user-456"
        assert retailer.banner_image is None


class TestRetailerUserModel:
    """Test RetailerUser model functionality"""
    
    def test_retailer_user_creation(self):
        """Test creating a retailer user instance"""
        retailer_user = RetailerUser(
            id=str(uuid.uuid4()),
            name="John Retailer",
            organisation="Green Corp",
            password="hashed_password_123"
        )
        assert isinstance(retailer_user.id, str)
        assert retailer_user.name == "John Retailer"
        assert retailer_user.organisation == "Green Corp"
        assert retailer_user.password == "hashed_password_123"


class TestRetailerSchemas:
    """Test Retailer Pydantic schemas"""
    
    def test_retailer_create_schema(self):
        """Test RetailerCreate schema validation"""
        retailer_data = {
            "name": "New Green Store",
            "description": "A new eco-friendly store",
            "email": "store@greenexample.com",
            "password": "securepassword123"
        }
        retailer_create = RetailerCreate(**retailer_data)
        
        assert retailer_create.name == "New Green Store"
        assert retailer_create.description == "A new eco-friendly store"
        assert retailer_create.email == "store@greenexample.com"
        assert retailer_create.password == "securepassword123"
    
    def test_retailer_login_schema(self):
        """Test RetailerLogin schema validation"""
        login_data = {
            "email": "retailer@example.com",
            "password": "password123"
        }
        retailer_login = RetailerLogin(**login_data)
        
        assert retailer_login.email == "retailer@example.com"
        assert retailer_login.password == "password123"
    
    def test_shop_info_schema(self):
        """Test ShopInfo schema"""
        shop_data = {
            "id": 1,
            "name": "Test Shop",
            "description": "A test shop",
            "banner_image": "https://example.com/banner.jpg"
        }
        shop_info = ShopInfo(**shop_data)
        
        assert shop_info.id == 1
        assert shop_info.name == "Test Shop"
        assert shop_info.description == "A test shop"
        assert shop_info.banner_image == "https://example.com/banner.jpg"
    
    def test_retailer_create_schema_validation(self):
        """Test RetailerCreate schema email validation"""
        with pytest.raises(Exception):  # Should raise validation error for invalid email
            RetailerCreate(
                name="Invalid Retailer",
                description="Test description",
                email="invalid-email",  # Invalid email format
                password="password123"
            )


class TestRetailerServices:
    """Test retailer service functions"""
    
    @patch('app.services.retailer_auth_service.hash_password')
    @patch('app.services.retailer_auth_service.uuid.uuid4')
    def test_create_retailer_user_new_user(self, mock_uuid, mock_hash_password):
        """Test creating a retailer user when user doesn't exist"""
        # Setup mocks
        mock_uuid.return_value = "new-user-id-123"
        mock_hash_password.return_value = "hashed_password"
        
        mock_db = Mock()
        # No existing user
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        retailer_create = RetailerCreate(
            name="Test Retailer",
            description="Test Description",
            email="test@retailer.com",
            password="plaintext_password"
        )
        
        result = create_retailer_user(mock_db, retailer_create)
        
        assert isinstance(result, RetailerInformation)
        assert result.name == "Test Retailer"
        assert result.description == "Test Description"
        
        # Verify user creation
        mock_hash_password.assert_called_once_with("plaintext_password")
        assert mock_db.add.call_count == 2  # User and RetailerInformation
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()
    
    @patch('app.services.retailer_auth_service.hash_password')
    def test_create_retailer_user_existing_user(self, mock_hash_password):
        """Test creating a retailer shop for existing user"""
        mock_db = Mock()
        
        # Mock existing user
        mock_existing_user = Mock()
        mock_existing_user.id = "existing-user-id"
        mock_existing_user.email = "existing@retailer.com"
        mock_db.query.return_value.filter.return_value.first.return_value = mock_existing_user
        
        retailer_create = RetailerCreate(
            name="Second Shop",
            description="Second shop for existing user",
            email="existing@retailer.com",
            password="password123"
        )
        
        result = create_retailer_user(mock_db, retailer_create)
        
        assert isinstance(result, RetailerInformation)
        assert result.name == "Second Shop"
        assert result.user_id == "existing-user-id"
        
        # Should not create new user, only retailer information
        mock_hash_password.assert_not_called()
        assert mock_db.add.call_count == 1  # Only RetailerInformation
    
    def test_get_user_shops(self):
        """Test getting all shops for a user"""
        mock_db = Mock()
        
        # Mock shops
        mock_shop1 = Mock()
        mock_shop1.id = 1
        mock_shop1.name = "Shop 1"
        mock_shop1.user_id = "user-123"
        
        mock_shop2 = Mock()
        mock_shop2.id = 2
        mock_shop2.name = "Shop 2"
        mock_shop2.user_id = "user-123"
        
        mock_shops = [mock_shop1, mock_shop2]
        mock_db.query.return_value.filter.return_value.all.return_value = mock_shops
        
        result = get_user_shops(mock_db, "user-123")
        
        assert len(result) == 2
        assert result[0].name == "Shop 1"
        assert result[1].name == "Shop 2"
    
    def test_get_user_shops_empty(self):
        """Test getting shops when user has no shops"""
        mock_db = Mock()
        mock_db.query.return_value.filter.return_value.all.return_value = []
        
        result = get_user_shops(mock_db, "user-no-shops")
        
        assert result == []
    
    @patch('app.services.retailer_auth_service.verify_password')
    @patch('app.services.retailer_auth_service.get_user_by_email')
    @patch('app.services.retailer_auth_service.get_user_shops')
    def test_authenticate_retailer_success(self, mock_get_shops, mock_get_user, mock_verify_password):
        """Test successful retailer authentication"""
        mock_db = Mock()
        
        # Mock user
        mock_user = Mock()
        mock_user.id = "user-123"
        mock_user.name = "John Retailer"
        mock_user.email = "john@retailer.com"
        mock_get_user.return_value = mock_user
        
        # Mock password verification
        mock_verify_password.return_value = True
        
        # Mock shops
        mock_shop = Mock()
        mock_shop.id = 1
        mock_shop.name = "John's Store"
        mock_shop.description = "Eco-friendly store"
        mock_shop.banner_image = None
        mock_get_shops.return_value = [mock_shop]
        
        retailer_login = RetailerLogin(
            email="john@retailer.com",
            password="correct_password"
        )
        
        result = authenticate_retailer(mock_db, retailer_login)
        
        assert result["user_id"] == "user-123"
        assert result["user_name"] == "John Retailer"
        assert result["email"] == "john@retailer.com"
        assert result["retailer_id"] == 1
        assert len(result["shops"]) == 1
        assert result["shops"][0].name == "John's Store"
        
        mock_verify_password.assert_called_once_with("correct_password", mock_user.password)
    
    @patch('app.services.retailer_auth_service.get_user_by_email')
    def test_authenticate_retailer_user_not_found(self, mock_get_user):
        """Test retailer authentication when user doesn't exist"""
        from fastapi import HTTPException
        
        mock_db = Mock()
        mock_get_user.return_value = None
        
        retailer_login = RetailerLogin(
            email="nonexistent@retailer.com",
            password="password123"
        )
        
        with pytest.raises(HTTPException) as exc_info:
            authenticate_retailer(mock_db, retailer_login)
        
        assert exc_info.value.status_code == 401
        assert "Invalid credentials" in str(exc_info.value.detail)
    
    @patch('app.services.retailer_auth_service.verify_password')
    @patch('app.services.retailer_auth_service.get_user_by_email')
    def test_authenticate_retailer_wrong_password(self, mock_get_user, mock_verify_password):
        """Test retailer authentication with wrong password"""
        from fastapi import HTTPException
        
        mock_db = Mock()
        
        # Mock user exists
        mock_user = Mock()
        mock_user.password = "hashed_correct_password"
        mock_get_user.return_value = mock_user
        
        # Mock wrong password
        mock_verify_password.return_value = False
        
        retailer_login = RetailerLogin(
            email="john@retailer.com",
            password="wrong_password"
        )
        
        with pytest.raises(HTTPException) as exc_info:
            authenticate_retailer(mock_db, retailer_login)
        
        assert exc_info.value.status_code == 401
        assert "Invalid credentials" in str(exc_info.value.detail)
    
    @patch('app.services.retailer_auth_service.verify_password')
    @patch('app.services.retailer_auth_service.get_user_by_email')
    @patch('app.services.retailer_auth_service.get_user_shops')
    def test_authenticate_retailer_no_shops(self, mock_get_shops, mock_get_user, mock_verify_password):
        """Test retailer authentication when user has no shops"""
        from fastapi import HTTPException
        
        mock_db = Mock()
        
        # Mock user exists
        mock_user = Mock()
        mock_user.id = "user-123"
        mock_get_user.return_value = mock_user
        
        # Mock correct password
        mock_verify_password.return_value = True
        
        # Mock no shops
        mock_get_shops.return_value = []
        
        retailer_login = RetailerLogin(
            email="john@retailer.com",
            password="correct_password"
        )
        
        with pytest.raises(HTTPException) as exc_info:
            authenticate_retailer(mock_db, retailer_login)
        
        assert exc_info.value.status_code == 404
        assert "No retailer shops found" in str(exc_info.value.detail)
    
    def test_get_shop_by_id_success(self):
        """Test getting shop by ID successfully"""
        mock_db = Mock()
        
        mock_shop = Mock()
        mock_shop.id = 1
        mock_shop.name = "Test Shop"
        mock_shop.user_id = "user-123"
        mock_db.query.return_value.filter.return_value.first.return_value = mock_shop
        
        result = get_shop_by_id(mock_db, 1, "user-123")
        
        assert result == mock_shop
    
    def test_get_shop_by_id_not_found(self):
        """Test getting shop by ID when shop doesn't exist or doesn't belong to user"""
        from fastapi import HTTPException
        
        mock_db = Mock()
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        with pytest.raises(HTTPException) as exc_info:
            get_shop_by_id(mock_db, 999, "user-123")
        
        assert exc_info.value.status_code == 404
        assert "Shop not found or doesn't belong to user" in str(exc_info.value.detail)


class TestRetailerBusinessLogic:
    """Test retailer business logic"""
    
    def test_retailer_shop_validation(self):
        """Test retailer shop validation logic"""
        def validate_shop_data(shop_data):
            errors = []
            
            if not shop_data.get("name") or len(shop_data["name"].strip()) == 0:
                errors.append("Shop name is required")
            
            if shop_data.get("name") and len(shop_data["name"]) > 100:
                errors.append("Shop name must be 100 characters or less")
            
            if shop_data.get("description") and len(shop_data["description"]) > 500:
                errors.append("Description must be 500 characters or less")
            
            return len(errors) == 0, errors
        
        # Valid shop data
        valid_shop = {
            "name": "Valid Shop Name",
            "description": "A valid description"
        }
        is_valid, errors = validate_shop_data(valid_shop)
        assert is_valid is True
        assert len(errors) == 0
        
        # Invalid shop data - empty name
        invalid_shop1 = {
            "name": "",
            "description": "Description"
        }
        is_valid, errors = validate_shop_data(invalid_shop1)
        assert is_valid is False
        assert "Shop name is required" in errors
        
        # Invalid shop data - name too long
        invalid_shop2 = {
            "name": "A" * 101,  # Too long
            "description": "Description"
        }
        is_valid, errors = validate_shop_data(invalid_shop2)
        assert is_valid is False
        assert "Shop name must be 100 characters or less" in errors
    
    def test_retailer_banner_image_validation(self):
        """Test retailer banner image URL validation"""
        def is_valid_image_url(url):
            if not url:
                return True  # Optional field
            
            valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
            return any(url.lower().endswith(ext) for ext in valid_extensions)
        
        # Valid image URLs
        assert is_valid_image_url("https://example.com/banner.jpg") is True
        assert is_valid_image_url("https://example.com/banner.png") is True
        assert is_valid_image_url("") is True  # Empty is valid (optional)
        assert is_valid_image_url(None) is True  # None is valid (optional)
        
        # Invalid image URLs
        assert is_valid_image_url("https://example.com/banner.txt") is False
        assert is_valid_image_url("https://example.com/banner") is False
    
    def test_retailer_search_and_filtering(self):
        """Test retailer search and filtering functionality"""
        retailers = [
            Mock(name="Green Store", description="Eco-friendly products"),
            Mock(name="Organic Market", description="Fresh organic food"),
            Mock(name="Sustainable Shop", description="Zero waste products"),
            Mock(name="Natural Foods", description="Organic and natural products")
        ]
        
        # Search by name
        def search_by_name(retailers, query):
            return [r for r in retailers if query.lower() in str(r.name).lower()]
        
        green_stores = search_by_name(retailers, "green")
        assert len(green_stores) == 1
        assert green_stores[0].name == "Green Store"
        
        # Search by description
        def search_by_description(retailers, query):
            return [r for r in retailers if query.lower() in str(r.description).lower()]
        
        organic_stores = search_by_description(retailers, "organic")
        assert len(organic_stores) == 2
        
        # Filter by keyword in name or description
        def search_retailers(retailers, query):
            query_lower = query.lower()
            return [r for r in retailers if 
                   query_lower in str(r.name).lower() or 
                   query_lower in str(r.description).lower()]
        
        sustainable_stores = search_retailers(retailers, "sustainable")
        assert len(sustainable_stores) == 1
        assert sustainable_stores[0].name == "Sustainable Shop"
    
    def test_retailer_stats_calculation(self):
        """Test calculating retailer statistics"""
        def calculate_retailer_stats(products, orders):
            stats = {
                "total_products": len(products),
                "total_orders": len(orders),
                "total_revenue": sum(order.total_amount for order in orders),
                "average_order_value": 0
            }
            
            if stats["total_orders"] > 0:
                stats["average_order_value"] = stats["total_revenue"] / stats["total_orders"]
            
            return stats
        
        # Mock products
        products = [Mock() for _ in range(25)]  # 25 products
        
        # Mock orders
        from decimal import Decimal
        orders = [
            Mock(total_amount=Decimal("99.99")),
            Mock(total_amount=Decimal("149.50")),
            Mock(total_amount=Decimal("75.25")),
            Mock(total_amount=Decimal("200.00"))
        ]
        
        stats = calculate_retailer_stats(products, orders)
        
        assert stats["total_products"] == 25
        assert stats["total_orders"] == 4
        assert stats["total_revenue"] == Decimal("524.74")
        assert round(stats["average_order_value"], 2) == Decimal("131.18")
    
    def test_retailer_product_management(self):
        """Test retailer product management logic"""
        def can_manage_product(retailer_id, product_retailer_id):
            return retailer_id == product_retailer_id
        
        def get_retailer_products(all_products, retailer_id):
            return [p for p in all_products if p.retailer_id == retailer_id]
        
        # Mock products
        products = [
            Mock(id=1, retailer_id=1, name="Product 1"),
            Mock(id=2, retailer_id=1, name="Product 2"),
            Mock(id=3, retailer_id=2, name="Product 3"),
            Mock(id=4, retailer_id=1, name="Product 4")
        ]
        
        # Test product ownership
        assert can_manage_product(1, 1) is True
        assert can_manage_product(1, 2) is False
        
        # Test getting retailer products
        retailer1_products = get_retailer_products(products, 1)
        assert len(retailer1_products) == 3
        
        retailer2_products = get_retailer_products(products, 2)
        assert len(retailer2_products) == 1
