import React, { useState } from 'react';
import './LoginForm.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt:', { email, password, rememberMe });
  };

  return (
    <div className="login-form-container">
      <div className="login-form">
        <h1 className="login-title">Sign in</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="form-options">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="checkmark"></span>
              remember me
            </label>
            <a href="#" className="forgot-password">forgot your password?</a>
          </div>
          
          <button type="submit" className="sign-in-btn">sign in</button>
        </form>
        
        <div className="signup-section">
          <span>Don't have an account? </span>
          <a href="#" className="signup-link">Sign up</a>
        </div>
        
        <div className="divider">
          <span>or</span>
        </div>
        
        <button className="google-signin-btn">
          <img src="/assets/google-icon.png" alt="Google" className="google-icon" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default LoginForm;