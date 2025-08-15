import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import '../styles/login/LoginForm.css';
import { loginUser } from '../../user-services/loginService'; // External function
import GoogleIcon from '../../assets/icons/googleColored.png'; // Import Google icon

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await loginUser(email, password);
      console.log('Login success:', result);
      
      // Clear any existing retailer data to prevent conflicts
      localStorage.removeItem('retailer_user');
      localStorage.removeItem('retailer_token');
      localStorage.removeItem('selected_shop');
      
      // Store user data with correct key
      localStorage.setItem('userData', JSON.stringify(result));
      console.log('User data stored:', result);
      
      // Dispatch event to update navbar
      window.dispatchEvent(new Event('authStateChanged'));
      
      toast.success('Login successful!');
      navigate('/Home');
    } catch (err) {
      console.error('Login failed:', err.message);
      toast.error(err.message || 'Login failed. Please try again.');
    }
  };

  const handleGoogleSignIn = () => {
    console.log('Google sign in clicked');
  };

  return (
    <div className="login-form-container">
      <div className="login-form-background"></div>
      <div className="login-form-overlay"></div>

      <div className="login-form-content">
        <h1 className="login-form-title">Sign in</h1>

        <form className="login-form" onSubmit={handleSubmit}>
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

          <div className="divider">
            <span>or</span>
          </div>

          <button
            type="button"
            className="google-signin-button"
            onClick={handleGoogleSignIn}
          >
            <img
              src={GoogleIcon}
              alt="Google"
              className="google-icon"
            />
            Sign in with Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;