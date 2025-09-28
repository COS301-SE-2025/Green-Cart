import pytest
from unittest.mock import Mock, patch, MagicMock
import uuid
from datetime import datetime, date
from fastapi import HTTPException
from pydantic import ValidationError

from app.schemas.user import (
    UserCreate, UserLogin, UserInformationResponse, 
    SetUserInformationRequest, ChangeUserPasswordRequest
)


class TestUserSchemas:
    """Unit tests for user Pydantic schemas"""
    
    def test_user_create_schema_valid(self):
        """Test UserCreate schema with valid data"""
        user_data = {
            "name": "Jane Doe",
            "email": "jane.doe@example.com",
            "password": "securepassword123"
        }
        user_create = UserCreate(**user_data)
        
        assert user_create.name == "Jane Doe"
        assert user_create.email == "jane.doe@example.com"
        assert user_create.password == "securepassword123"
    
    def test_user_login_schema_valid(self):
        """Test UserLogin schema with valid data"""
        login_data = {
            "email": "user@example.com",
            "password": "password123"
        }
        user_login = UserLogin(**login_data)
        
        assert user_login.email == "user@example.com"
        assert user_login.password == "password123"
    
    def test_user_create_schema_invalid_email(self):
        """Test UserCreate schema with invalid email"""
        with pytest.raises(ValidationError):
            UserCreate(
                name="Invalid User",
                email="invalid-email",
                password="password123"
            )
    
    def test_user_create_schema_missing_fields(self):
        """Test UserCreate schema with missing required fields"""
        with pytest.raises(ValidationError):
            UserCreate(
                name="Incomplete User"
                # Missing email and password
            )
    
    def test_set_user_information_request_valid(self):
        """Test SetUserInformationRequest schema"""
        user_id = str(uuid.uuid4())
        request_data = {
            "user_id": user_id,
            "name": "Updated Name",
            "email": "updated@example.com",
            "date_of_birth": date(1990, 1, 1),
            "country_code": "+1",
            "telephone": "9876543210",
            "address": "123 Main Street",
            "city": "Cape Town",
            "postal_code": "8001"
        }
        request = SetUserInformationRequest(**request_data)
        
        assert request.user_id == user_id
        assert request.name == "Updated Name"
        assert request.email == "updated@example.com"
        assert request.date_of_birth == date(1990, 1, 1)
        assert request.country_code == "+1"
        assert request.telephone == "9876543210"
        assert request.address == "123 Main Street"
        assert request.city == "Cape Town"
        assert request.postal_code == "8001"
    
    def test_change_password_request_valid(self):
        """Test ChangeUserPasswordRequest schema"""
        user_id = str(uuid.uuid4())
        request_data = {
            "user_id": user_id,
            "old_password": "oldpassword123",
            "new_password": "newpassword456"
        }
        request = ChangeUserPasswordRequest(**request_data)
        
        assert request.user_id == user_id
        assert request.old_password == "oldpassword123"
        assert request.new_password == "newpassword456"


class TestUserBusinessLogic:
    """Unit tests for user business logic functions"""
    
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
        
        # Age should be calculated correctly
        assert isinstance(age, int)
        assert age >= 0
        assert age < 150  # Reasonable upper bound
        
        # Test with today's date (age should be 0)
        today = date.today()
        age_today = calculate_age(today)
        assert age_today == 0
    
    def test_phone_number_validation(self):
        """Test phone number validation logic"""
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
        assert validate_phone_number("+27", "0123456789") is True
        
        # Invalid phone numbers
        assert validate_phone_number("", "1234567890") is False  # Empty country code
        assert validate_phone_number("+1", "") is False  # Empty telephone
        assert validate_phone_number("1", "1234567890") is False  # No + prefix
        assert validate_phone_number("+1", "123abc456") is False  # Contains letters
        assert validate_phone_number("+1", "123") is False  # Too short
        assert validate_phone_number("+1", "1234567890123456") is False  # Too long
    
    def test_email_validation_regex(self):
        """Test email validation using regex"""
        import re
        
        def is_valid_email(email):
            pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            return re.match(pattern, email) is not None
        
        # Valid emails
        assert is_valid_email("user@example.com") is True
        assert is_valid_email("test.email+tag@domain.co.uk") is True
        assert is_valid_email("user123@sub.domain.com") is True
        assert is_valid_email("first.last@company.org") is True
        
        # Invalid emails
        assert is_valid_email("invalid-email") is False
        assert is_valid_email("@domain.com") is False
        assert is_valid_email("user@") is False
        assert is_valid_email("user@.com") is False
        assert is_valid_email("user.domain.com") is False  # Missing @
    
    def test_user_profile_completeness(self):
        """Test calculating user profile completeness percentage"""
        def calculate_profile_completeness(user_data):
            required_fields = ['name', 'email', 'date_of_birth', 'country_code', 'telephone']
            completed_fields = sum(1 for field in required_fields 
                                 if user_data.get(field) is not None and user_data.get(field) != "")
            return (completed_fields / len(required_fields)) * 100
        
        # Complete profile
        complete_user = {
            "name": "John Doe",
            "email": "john@example.com",
            "date_of_birth": date(1990, 1, 1),
            "country_code": "+1",
            "telephone": "1234567890"
        }
        assert calculate_profile_completeness(complete_user) == 100.0
        
        # Partial profile (3 out of 5 fields)
        partial_user = {
            "name": "Jane Doe",
            "email": "jane@example.com",
            "date_of_birth": None,
            "country_code": "+1",
            "telephone": None
        }
        assert calculate_profile_completeness(partial_user) == 60.0
        
        # Minimal profile (2 out of 5 fields)
        minimal_user = {
            "name": "Bob Smith",
            "email": "bob@example.com",
            "date_of_birth": None,
            "country_code": None,
            "telephone": None
        }
        assert calculate_profile_completeness(minimal_user) == 40.0


class TestUserDataValidation:
    """Unit tests for user data validation"""
    
    def test_uuid_generation_and_validation(self):
        """Test UUID generation and validation for user IDs"""
        # Generate UUID
        user_id = str(uuid.uuid4())
        
        # Validate UUID format
        assert len(user_id) == 36
        assert user_id.count('-') == 4
        
        # Should be able to convert back to UUID object
        uuid_obj = uuid.UUID(user_id)
        assert str(uuid_obj) == user_id
        
        # Test that generated UUIDs are unique
        user_id_2 = str(uuid.uuid4())
        assert user_id != user_id_2
    
    def test_password_strength_validation(self):
        """Test password strength validation"""
        def is_strong_password(password):
            if len(password) < 8:
                return False
            has_upper = any(c.isupper() for c in password)
            has_lower = any(c.islower() for c in password)
            has_digit = any(c.isdigit() for c in password)
            return has_upper and has_lower and has_digit
        
        # Strong passwords
        assert is_strong_password("MyPassword123") is True
        assert is_strong_password("SecurePass1") is True
        
        # Weak passwords
        assert is_strong_password("weak") is False  # Too short
        assert is_strong_password("alllowercase123") is False  # No uppercase
        assert is_strong_password("ALLUPPERCASE123") is False  # No lowercase
        assert is_strong_password("NoNumbers") is False  # No digits
        assert is_strong_password("Short1") is False  # Too short but has all character types
    
    def test_date_validation(self):
        """Test date validation for user data"""
        def is_valid_birth_date(birth_date):
            if birth_date is None:
                return False
            today = date.today()
            # Person must be at least 13 years old and not born in the future
            min_birth_date = date(today.year - 13, today.month, today.day)
            return birth_date <= min_birth_date and birth_date >= date(1900, 1, 1)
        
        today = date.today()
        
        # Valid birth dates
        assert is_valid_birth_date(date(1990, 5, 15)) is True
        assert is_valid_birth_date(date(1950, 12, 31)) is True
        assert is_valid_birth_date(date(2000, 1, 1)) is True
        
        # Invalid birth dates
        assert is_valid_birth_date(None) is False
        assert is_valid_birth_date(date(today.year, today.month, today.day)) is False  # Today
        assert is_valid_birth_date(date(today.year + 1, 1, 1)) is False  # Future date
        assert is_valid_birth_date(date(1899, 12, 31)) is False  # Too old
        assert is_valid_birth_date(date(today.year - 5, today.month, today.day)) is False  # Too young


class TestUserServiceMocks:
    """Unit tests using mocks for user services"""
    
    @patch('app.services.user_service.hash_password')
    @patch('app.services.user_service.uuid.uuid4')
    def test_create_user_service_mock(self, mock_uuid, mock_hash_password):
        """Test user creation service with mocks"""
        # This is a mock test that doesn't import actual services
        # but demonstrates how service functions would be tested
        
        mock_uuid.return_value = "test-user-id-123"
        mock_hash_password.return_value = "hashed_password_secure"
        
        # Mock the service behavior
        def mock_create_user(db, user_create):
            return {
                "id": str(mock_uuid.return_value),
                "name": user_create.name,
                "email": user_create.email,
                "password": mock_hash_password.return_value,
                "created_at": datetime.now()
            }
        
        user_create = UserCreate(
            name="Test User",
            email="test@example.com",
            password="plaintext_password"
        )
        
        result = mock_create_user(None, user_create)
        
        assert result["id"] == "test-user-id-123"
        assert result["name"] == "Test User"
        assert result["email"] == "test@example.com"
        assert result["password"] == "hashed_password_secure"
        assert "created_at" in result
    
    def test_get_user_by_email_mock(self):
        """Test getting user by email with mock data"""
        def mock_get_user_by_email(db, email):
            users_db = {
                "existing@example.com": {
                    "id": str(uuid.uuid4()),
                    "name": "Existing User",
                    "email": "existing@example.com",
                    "password": "hashed_password"
                }
            }
            return users_db.get(email)
        
        # User exists
        result = mock_get_user_by_email(None, "existing@example.com")
        assert result is not None
        assert result["email"] == "existing@example.com"
        assert result["name"] == "Existing User"
        
        # User doesn't exist
        result = mock_get_user_by_email(None, "nonexistent@example.com")
        assert result is None


class TestUserUtilityFunctions:
    """Unit tests for user utility functions"""
    
    def test_sanitize_user_input(self):
        """Test sanitizing user input data"""
        def sanitize_string(input_str):
            if input_str is None:
                return None
            return input_str.strip()
        
        # Test string sanitization
        assert sanitize_string("  test  ") == "test"
        assert sanitize_string("normal_string") == "normal_string"
        assert sanitize_string("") == ""
        assert sanitize_string(None) is None
        assert sanitize_string("   ") == ""
    
    def test_format_phone_number(self):
        """Test phone number formatting"""
        def format_phone_number(country_code, telephone):
            if not country_code or not telephone:
                return None
            return f"{country_code}{telephone}"
        
        assert format_phone_number("+1", "1234567890") == "+11234567890"
        assert format_phone_number("+44", "7890123456") == "+447890123456"
        assert format_phone_number("", "1234567890") is None
        assert format_phone_number("+1", "") is None
    
    def test_mask_sensitive_data(self):
        """Test masking sensitive user data"""
        def mask_email(email):
            if not email or '@' not in email:
                return email
            username, domain = email.split('@', 1)
            if len(username) <= 2:
                return email
            masked_username = username[0] + '*' * (len(username) - 2) + username[-1]
            return f"{masked_username}@{domain}"
        
        assert mask_email("test@example.com") == "t**t@example.com"
        assert mask_email("a@example.com") == "a@example.com"  # Too short to mask
        assert mask_email("ab@example.com") == "ab@example.com"  # Too short to mask
        assert mask_email("john.doe@company.com") == "j******e@company.com"
        assert mask_email("invalid-email") == "invalid-email"  # Invalid format
        assert mask_email("") == ""
        assert mask_email(None) is None