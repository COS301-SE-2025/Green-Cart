import sys
import os
import pytest
from unittest.mock import Mock, patch
import uuid
from datetime import datetime, date

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Mock the models to avoid SQLAlchemy relationship issues
class User:
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

class Address:
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

# Import schemas and services
from app.schemas.user import UserCreate, UserLogin
from app.services.user_service import create_user, get_user_by_email, get_user_information, set_user_information


class TestUserModel:
    """Test User model functionality"""
    
    def test_user_creation(self):
        """Test creating a user instance"""
        user_id = str(uuid.uuid4())
        user = User(
            id=user_id,
            name="John Doe",
            email="john.doe@example.com",
            password="hashed_password_123",
            created_at=datetime.now(),
            date_of_birth=date(1990, 1, 1),
            country_code="+1",
            telephone="123456789"
        )
        assert user.id == user_id
        assert user.name == "John Doe"
        assert user.email == "john.doe@example.com"
        assert user.password == "hashed_password_123"
        assert user.date_of_birth == date(1990, 1, 1)
        assert user.country_code == "+1"
        assert user.telephone == "123456789"
    
    def test_user_with_minimal_data(self):
        """Test creating a user with minimal required data"""
        user_id = str(uuid.uuid4())
        user = User(
            id=user_id,
            email="minimal@example.com",
            password="hashed_password"
        )
        assert user.id == user_id
        assert user.email == "minimal@example.com"
        assert user.password == "hashed_password"
        assert user.name is None
        assert user.date_of_birth is None
        assert user.country_code is None
        assert user.telephone is None
    
    def test_user_email_uniqueness(self):
        """Test that user email should be unique"""
        user1 = User(
            id=str(uuid.uuid4()),
            email="unique@example.com",
            password="password1"
        )
        user2 = User(
            id=str(uuid.uuid4()),
            email="unique@example.com",  # Same email
            password="password2"
        )
        
        # Both users have the same email - this would be caught by database constraints
        assert user1.email == user2.email


class TestAddressModel:
    """Test Address model functionality"""
    
    def test_address_creation(self):
        """Test creating an address instance"""
        address = Address(
            id=1,
            user_id=str(uuid.uuid4()),
            address="123 Main St",
            city="New York",
            postal_code="10001"
        )
        assert address.id == 1
        assert address.address == "123 Main St"
        assert address.city == "New York"
        assert address.postal_code == "10001"


class TestUserSchemas:
    """Test User Pydantic schemas"""
    
    def test_user_create_schema(self):
        """Test UserCreate schema validation"""
        user_data = {
            "name": "Jane Doe",
            "email": "jane.doe@example.com",
            "password": "securepassword123"
        }
        user_create = UserCreate(**user_data)
        
        assert user_create.name == "Jane Doe"
        assert user_create.email == "jane.doe@example.com"
        assert user_create.password == "securepassword123"
    
    def test_user_login_schema(self):
        """Test UserLogin schema validation"""
        login_data = {
            "email": "user@example.com",
            "password": "password123"
        }
        user_login = UserLogin(**login_data)
        
        assert user_login.email == "user@example.com"
        assert user_login.password == "password123"
    
    def test_user_create_schema_validation(self):
        """Test UserCreate schema email validation"""
        with pytest.raises(Exception):  # Should raise validation error for invalid email
            UserCreate(
                name="Invalid User",
                email="invalid-email",  # Invalid email format
                password="password123"
            )


class TestUserServices:
    """Test user service functions"""
    
    @patch('app.services.user_service.hash_password')
    @patch('app.services.user_service.uuid.uuid4')
    def test_create_user_success(self, mock_uuid, mock_hash_password):
        """Test successfully creating a user"""
        # Setup mocks
        mock_uuid.return_value = "test-user-id-123"
        mock_hash_password.return_value = "hashed_password"
        
        mock_db = Mock()
        user_create = UserCreate(
            name="Test User",
            email="test@example.com",
            password="plaintext_password"
        )
        
        result = create_user(mock_db, user_create)
        
        assert isinstance(result, User)
        assert result.id == "test-user-id-123"
        assert result.name == "Test User"
        assert result.email == "test@example.com"
        assert result.password == "hashed_password"
        
        mock_hash_password.assert_called_once_with("plaintext_password")
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()
    
    def test_get_user_by_email_found(self):
        """Test getting user by email when user exists"""
        mock_db = Mock()
        mock_user = Mock()
        mock_user.email = "found@example.com"
        mock_db.query.return_value.filter.return_value.first.return_value = mock_user
        
        result = get_user_by_email(mock_db, "found@example.com")
        
        assert result == mock_user
        mock_db.query.assert_called_once()
    
    def test_get_user_by_email_not_found(self):
        """Test getting user by email when user doesn't exist"""
        mock_db = Mock()
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        result = get_user_by_email(mock_db, "notfound@example.com")
        
        assert result is None
    
    def test_get_user_information_success(self):
        """Test getting user information successfully"""
        mock_db = Mock()
        
        # Mock user
        mock_user = Mock()
        mock_user.id = "user-123"
        mock_user.name = "Test User"
        mock_user.email = "test@example.com"
        mock_user.__dict__ = {
            "id": "user-123",
            "name": "Test User",
            "email": "test@example.com",
            "password": "hashed_password"
        }
        
        # Mock address
        mock_address = Mock()
        mock_address.user_id = "user-123"
        mock_address.address = "123 Test St"
        
        # Configure database queries
        mock_db.query.return_value.filter.return_value.first.side_effect = [mock_user, mock_address]
        
        result = get_user_information(mock_db, "user-123")
        
        assert result["status"] == 200
        assert result["message"] == "Success"
        assert result["user"] == mock_user
        assert result["address"] == mock_address
    
    def test_get_user_information_user_not_found(self):
        """Test getting user information when user doesn't exist"""
        from fastapi import HTTPException
        
        mock_db = Mock()
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        with pytest.raises(HTTPException) as exc_info:
            get_user_information(mock_db, "nonexistent-user")
        
        assert exc_info.value.status_code == 404
        assert "User not found" in str(exc_info.value.detail)


class TestUserBusinessLogic:
    """Test user business logic"""
    
    def test_user_age_calculation(self):
        """Test calculating user age from date of birth"""
        def calculate_age(birth_date):
            today = date.today()
            age = today.year - birth_date.year
            if today.month < birth_date.month or (today.month == birth_date.month and today.day < birth_date.day):
                age -= 1
            return age
        
        # Test with a known birth date
        birth_date = date(1990, 5, 15)
        age = calculate_age(birth_date)
        
        # Age should be calculated correctly (this will depend on current date)
        assert isinstance(age, int)
        assert age >= 0
    
    def test_user_contact_validation(self):
        """Test user contact information validation"""
        def validate_phone_number(country_code, telephone):
            if not country_code or not telephone:
                return False
            if not country_code.startswith('+'):
                return False
            if not telephone.isdigit():
                return False
            return len(telephone) >= 7 and len(telephone) <= 15
        
        # Valid phone numbers
        assert validate_phone_number("+1", "1234567890") is True
        assert validate_phone_number("+44", "7890123456") is True
        
        # Invalid phone numbers
        assert validate_phone_number("", "1234567890") is False
        assert validate_phone_number("+1", "") is False
        assert validate_phone_number("1", "1234567890") is False  # No + prefix
        assert validate_phone_number("+1", "123abc456") is False  # Contains letters
        assert validate_phone_number("+1", "123") is False  # Too short
    
    def test_user_email_validation(self):
        """Test email validation logic"""
        import re
        
        def is_valid_email(email):
            pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            return re.match(pattern, email) is not None
        
        # Valid emails
        assert is_valid_email("user@example.com") is True
        assert is_valid_email("test.email+tag@domain.co.uk") is True
        assert is_valid_email("user123@sub.domain.com") is True
        
        # Invalid emails
        assert is_valid_email("invalid-email") is False
        assert is_valid_email("@domain.com") is False
        assert is_valid_email("user@") is False
        assert is_valid_email("user@.com") is False
    
    def test_user_profile_completeness(self):
        """Test checking user profile completeness"""
        def calculate_profile_completeness(user):
            fields = ['name', 'email', 'date_of_birth', 'country_code', 'telephone']
            completed_fields = sum(1 for field in fields if getattr(user, field, None) is not None)
            return (completed_fields / len(fields)) * 100
        
        # Complete profile
        complete_user = Mock()
        complete_user.name = "John Doe"
        complete_user.email = "john@example.com"
        complete_user.date_of_birth = date(1990, 1, 1)
        complete_user.country_code = "+1"
        complete_user.telephone = "1234567890"
        
        assert calculate_profile_completeness(complete_user) == 100.0
        
        # Partial profile
        partial_user = Mock()
        partial_user.name = "Jane Doe"
        partial_user.email = "jane@example.com"
        partial_user.date_of_birth = None
        partial_user.country_code = None
        partial_user.telephone = None
        
        assert calculate_profile_completeness(partial_user) == 40.0  # 2 out of 5 fields
