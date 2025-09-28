import pytest
from unittest.mock import Mock, patch, MagicMock
import uuid
from datetime import datetime
from fastapi import HTTPException

from app.routes.authentication import signup, signin
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.schemas.retailer import RetailerCreate, RetailerLogin


class TestAuthenticationUnit:
    """Unit tests for authentication endpoints"""

    @patch('app.routes.authentication.get_user_by_email')
    @patch('app.routes.authentication.create_user')
    def test_signup_success(self, mock_create_user, mock_get_user_by_email):
        """Test successful user signup"""
        # Setup
        mock_get_user_by_email.return_value = None  # No existing user
        user_id = str(uuid.uuid4())
        mock_user = Mock()
        mock_user.id = user_id
        mock_user.name = "Test User"
        mock_user.email = "test@example.com"
        mock_user.created_at = datetime.now()
        mock_create_user.return_value = mock_user
        
        user_data = UserCreate(
            name="Test User",
            email="test@example.com",
            password="password123"
        )
        mock_db = Mock()
        
        # Execute
        result = signup(user_data, mock_db)
        
        # Assert
        assert result["id"] == user_id
        assert result["name"] == "Test User"
        assert result["email"] == "test@example.com"
        assert result["requires2FA"] == False
        assert "created_at" in result
        mock_get_user_by_email.assert_called_once_with(mock_db, "test@example.com")
        mock_create_user.assert_called_once_with(mock_db, user_data)

    @patch('app.routes.authentication.get_user_by_email')
    def test_signup_duplicate_email(self, mock_get_user_by_email):
        """Test signup with duplicate email"""
        # Setup
        mock_get_user_by_email.return_value = Mock()  # Existing user
        
        user_data = UserCreate(
            name="Test User",
            email="existing@example.com",
            password="password123"
        )
        mock_db = Mock()
        
        # Execute & Assert
        with pytest.raises(HTTPException) as exc_info:
            signup(user_data, mock_db)
        
        assert exc_info.value.status_code == 400
        assert exc_info.value.detail == "Email already registered"

    @patch('app.routes.authentication.verify_password')
    @patch('app.routes.authentication.get_user_by_email')
    def test_signin_success(self, mock_get_user_by_email, mock_verify_password):
        """Test successful user signin"""
        # Setup
        user_id = str(uuid.uuid4())
        mock_user = Mock()
        mock_user.id = user_id
        mock_user.name = "Test User"
        mock_user.email = "test@example.com"
        mock_user.secret = None  # No MFA
        
        mock_get_user_by_email.return_value = mock_user
        mock_verify_password.return_value = True
        
        login_data = UserLogin(
            email="test@example.com",
            password="password123"
        )
        mock_db = Mock()
        
        # Execute
        result = signin(login_data, mock_db)
        
        # Assert
        assert result["id"] == user_id
        assert result["name"] == "Test User"
        assert result["email"] == "test@example.com"
        assert result["requires2FA"] == False

    @patch('app.routes.authentication.verify_password')
    @patch('app.routes.authentication.get_user_by_email')
    def test_signin_with_mfa(self, mock_get_user_by_email, mock_verify_password):
        """Test signin with MFA enabled"""
        # Setup
        user_id = str(uuid.uuid4())
        mock_user = Mock()
        mock_user.id = user_id
        mock_user.name = "Test User"
        mock_user.email = "test@example.com"
        mock_user.secret = "secret_key"  # MFA enabled
        
        mock_get_user_by_email.return_value = mock_user
        mock_verify_password.return_value = True
        
        login_data = UserLogin(
            email="test@example.com",
            password="password123"
        )
        mock_db = Mock()
        
        # Execute
        result = signin(login_data, mock_db)
        
        # Assert
        assert result["requires2FA"] == True

    @patch('app.routes.authentication.get_user_by_email')
    def test_signin_invalid_credentials(self, mock_get_user_by_email):
        """Test signin with invalid credentials"""
        # Setup
        mock_get_user_by_email.return_value = None  # No user found
        
        login_data = UserLogin(
            email="nonexistent@example.com",
            password="wrongpassword"
        )
        mock_db = Mock()
        
        # Execute & Assert
        with pytest.raises(HTTPException) as exc_info:
            signin(login_data, mock_db)
        
        assert exc_info.value.status_code == 401
        assert exc_info.value.detail == "Invalid credentials"

    @patch('app.routes.authentication.verify_password')
    @patch('app.routes.authentication.get_user_by_email')
    def test_signin_wrong_password(self, mock_get_user_by_email, mock_verify_password):
        """Test signin with wrong password"""
        # Setup
        mock_user = Mock()
        mock_user.password = "hashedpassword"
        mock_get_user_by_email.return_value = mock_user
        mock_verify_password.return_value = False
        
        login_data = UserLogin(
            email="test@example.com",
            password="wrongpassword"
        )
        mock_db = Mock()
        
        # Execute & Assert
        with pytest.raises(HTTPException) as exc_info:
            signin(login_data, mock_db)
        
        assert exc_info.value.status_code == 401
        assert exc_info.value.detail == "Invalid credentials"


class TestRetailerAuthenticationUnit:
    """Unit tests for retailer authentication"""

    @patch('app.routes.authentication.create_retailer_user')
    def test_retailer_signup_success(self, mock_create_retailer):
        """Test successful retailer signup"""
        # This test would need to be implemented based on the actual retailer signup logic
        pass

    @patch('app.routes.authentication.authenticate_retailer')
    def test_retailer_signin_success(self, mock_authenticate_retailer):
        """Test successful retailer signin"""
        # This test would need to be implemented based on the actual retailer signin logic
        pass


class TestPasswordUtility:
    """Unit tests for password utility functions"""

    @patch('app.utilities.utils.bcrypt.checkpw')
    def test_verify_password_success(self, mock_checkpw):
        """Test password verification success"""
        from app.utilities.utils import verify_password
        
        mock_checkpw.return_value = True
        
        result = verify_password("plaintext", "hashedpassword")
        
        assert result == True
        mock_checkpw.assert_called_once_with(b'plaintext', b'hashedpassword')

    @patch('app.utilities.utils.bcrypt.checkpw')
    def test_verify_password_failure(self, mock_checkpw):
        """Test password verification failure"""
        from app.utilities.utils import verify_password
        
        mock_checkpw.return_value = False
        
        result = verify_password("wrongpassword", "hashedpassword")
        
        assert result == False
        mock_checkpw.assert_called_once_with(b'wrongpassword', b'hashedpassword')

    @patch('app.utilities.utils.bcrypt.hashpw')
    @patch('app.utilities.utils.bcrypt.gensalt')
    def test_hash_password(self, mock_gensalt, mock_hashpw):
        """Test password hashing"""
        from app.utilities.utils import hash_password
        
        mock_gensalt.return_value = b'salt'
        mock_hashpw.return_value = b'hashedpassword'
        
        result = hash_password("plaintext")
        
        assert result == "hashedpassword"
        mock_gensalt.assert_called_once()
        mock_hashpw.assert_called_once_with(b'plaintext', b'salt')