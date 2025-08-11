import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { signup } from '../../user-services/signupService';
import '../styles/register/RegisterForm.css';
import GoogleIcon from '../../assets/icons/googleColored.png'; // Import Google icon

const RegisterForm = () => {
  const [showInitialForm, setShowInitialForm] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleCreateAccount = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowInitialForm(false);
      setIsTransitioning(false);
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const result = await signup({ name, email, password });
      
      // Clear any existing retailer data to prevent conflicts
      localStorage.removeItem('retailer_user');
      localStorage.removeItem('retailer_token');
      localStorage.removeItem('selected_shop');
      
      // Extract token and user data from response
      if (result.access_token || result.token) {
        // Store the authentication token
        localStorage.setItem('token', result.access_token || result.token);
      }
      
      // Store user data (remove token from user object to avoid duplication)
      const userData = { ...result };
      delete userData.access_token;
      delete userData.token;
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Dispatch event to update navbar
      window.dispatchEvent(new Event('authStateChanged'));
      
      toast.success("Account created successfully!");
      navigate("/Home");
    } catch (err) {
      toast.error(err.message || "An error occurred while creating the account.");
    }
  };

  return (
    <div className="register-form-container">
      <div className="register-form-background"></div>
      <div className="register-form-overlay"></div>

      <div className={`register-form-content ${isTransitioning ? 'slide-out' : 'slide-in'}`}>
        <h1 className="register-form-title">Sign up</h1>

        {showInitialForm ? (
          <div className="register-form">
            <button type="button" className="google-signup-button" onClick={() => console.log('Google sign up clicked')}>
              <img src={GoogleIcon} alt="Google" className="google-icon" />
              Sign up with Google
            </button>

            <div className="divider"><span>or</span> </div>

            <button type="button" className="create-account-button" onClick={handleCreateAccount}>
              Create an Account
            </button>

            <div className="terms-text">
              By signing up you agree to the{' '}
              <Link to="/terms" className="terms-link">terms of service</Link>,{' '}
              <Link to="/privacy" className="terms-link">privacy policy</Link> and{' '}
              <Link to="/cookies" className="terms-link">cookie use</Link>.
            </div>

            <div className="signin-link">
              Already have an account?{' '}
              <Link to="/login" className="signin-link-text">Sign in</Link>
            </div>
          </div>
        ) : (
          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="form-input"
                placeholder=" "
                required 
              />
              <label htmlFor="email" className="form-label">Email address</label>
            </div>

            <div className="form-group">
              <input 
                id="name" 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="form-input"
                placeholder=" "
                required 
              />
              <label htmlFor="name" className="form-label">Name</label>
            </div>

            <div className="form-group">
              <input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="form-input"
                placeholder=" "
                required 
              />
              <label htmlFor="password" className="form-label">Password</label>
            </div>

            <div className="form-group">
              <input 
                id="confirmPassword" 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="form-input"
                placeholder=" "
                required 
              />
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            </div>

            <button type="submit" className="sign-up-button">Sign up</button>

            <div className="terms-text">
              By clicking on 'sign up' you agree to{' '}
              <Link to="/terms" className="terms-link">terms of service</Link> |{' '}
              <Link to="/privacy" className="terms-link">privacy policy</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterForm;