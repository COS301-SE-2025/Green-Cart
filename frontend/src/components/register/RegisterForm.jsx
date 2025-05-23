import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/register/RegisterForm.css';

const RegisterForm = () => {
  const [showInitialForm, setShowInitialForm] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleCreateAccount = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowInitialForm(false);
      setIsTransitioning(false);
    }, 300);
  };

  const handleGoogleSignUp = () => {
    console.log('Google sign up clicked');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log({ email, name, password, confirmPassword });
  };

  return (
    <div className="register-form-container">
      <div className="register-form-background"></div>
      <div className="register-form-overlay"></div>
      
      <div className={`register-form-content ${isTransitioning ? 'slide-out' : 'slide-in'}`}>
        <h1 className="register-form-title">Sign up</h1>
        
        {showInitialForm ? (
          <div className="register-form">
            <button 
              type="button" 
              className="google-signup-button"
              onClick={handleGoogleSignUp}
            >
              <img src="./src/assets/icons/googleColored.png" alt="Google" className="google-icon" />
              Sign up with Google
            </button>
            
            <div className="divider">
              <span>or</span>
            </div>
            
            <button 
              type="button" 
              className="create-account-button"
              onClick={handleCreateAccount}
            >
              Create an Account
            </button>
            
            <div className="terms-text">
              By Signing up you agree to the{' '}
              <Link to="/terms" className="terms-link">terms of service</Link>,{' '}
              <Link to="/privacy" className="terms-link">public policy</Link> and{' '}
              <Link to="/cookies" className="terms-link">Cookie use</Link>.
            </div>
            
            <div className="signin-link">
              Already have an account?{' '}
              <Link to="/login" className="signin-link-text">
                Sign in
              </Link>
            </div>
          </div>
        ) : (
          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>
            
            <button type="submit" className="sign-up-button">
              sign up
            </button>
            
            <div className="terms-text">
              By clicking on 'sign up' you agree to{' '}
              <Link to="/terms" className="terms-link">terms of service</Link> |{' '}
              <Link to="/privacy" className="terms-link">public policy</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterForm;