import React, { useState } from 'react';
import { API_BASE_URL } from '../../config/api.js'; // Ensure this path is correct
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import '../styles/login/LoginForm.css';
import { loginUser } from '../../user-services/loginService'; // External function

import TwoFactorVerificationModal from '../modals/TwoFactorVerificationModal';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userData, setUserData] = useState(null);
  const [id, setID] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [show2FAModal, setShow2FAModal] = useState(false);
  const [pendingLogin, setPendingLogin] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const navigate = useNavigate();

const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await loginUser(email, password);
      console.log(result);
      
      // Check if 2FA is required
      if (result.requires2FA) {
        setID(result.id);
        setPendingLogin(result);
        setUserData(result);
        setShow2FAModal(true);
        return;
      }
      
      // Normal login success
      completeLogin(result);
      
    } catch (error) {
      toast.error(error.message || 'Login failed');
    }
  };

  const handle2FAVerification = async (code) => {
    setIsVerifying(true);
    
    try {
      // Call your 2FA verification endpoint
      const apiURL = API_BASE_URL;
      const result = await fetch(`${apiURL}/users/verifyMFA`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: id,
          code: code
        })
      }).then(res => {
        if (!res.ok) {
          throw new Error('Invalid verification code');
        }

        return res.json();
      }).then(data => {
        console.log(data);
        completeLogin(userData);
        setShow2FAModal(false);
      })
    } catch (error) {
      toast.error(error.message || 'Invalid verification code');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBackupCodeVerification = async (backupCode) => {
    setIsVerifying(true);
    
    try {
      // Call your backup code verification endpoint
      const result = await verifyBackupCode({
        sessionToken: pendingLogin.sessionToken,
        backupCode: backupCode
      });
      
      completeLogin(result);
      setShow2FAModal(false);
      
    } catch (error) {
      toast.error(error.message || 'Invalid backup code');
    } finally {
      setIsVerifying(false);
    }
  };

  const completeLogin = (result) => {
    localStorage.setItem('userData', JSON.stringify(result));
    window.dispatchEvent(new Event('authStateChanged'));
    toast.success('Login successful!');
    navigate('/Home');
  };

  return (
    <div className="login-form-container">
      <div className="login-form-background"></div>
      <div className="login-form-overlay"></div>

      <div className="login-form-content">
        <h1 className="login-form-title">Sign in</h1>

        <form className="login-form" onSubmit={handleLoginSubmit}>
          <div className="login-form-group">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-form-input"
              placeholder=" "
              required
            />
            <label htmlFor="email" className="login-form-label">Email address</label>
          </div>

          <div className="login-form-group">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-form-input"
              placeholder=" "
              required
            />
            <label htmlFor="password" className="login-form-label">Password</label>
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="checkbox-input"
              />
              <span>remember me</span>
            </label>
            <Link to="/forgot-password" className="forgot-password-link">
              forgot your password?
            </Link>
          </div>

          <button type="submit" className="sign-in-button">
            sign in
          </button>

          <div className="signup-link">
            Don't have an account?{' '}
            <Link to="/Register" className="signup-link-text">
              Sign up
            </Link>
          </div>

          <div className="retailer-auth-link">
            Are you a retailer?{' '}
            <Link to="/retailer-auth" className="retailer-link-text">
              Sign in as Retailer
            </Link>
          </div>
        </form>
      </div>
       <TwoFactorVerificationModal
        isOpen={show2FAModal}
        onClose={() => {
          setShow2FAModal(false);
          setPendingLogin(null);
        }}
        onVerify={handle2FAVerification}
        onUseBackupCode={handleBackupCodeVerification}
        userEmail={id}
        isLoading={isVerifying}
      />
    </div>
  );
};

export default LoginForm;