import React from 'react';
import '../styles/login/LoginDisplay.css';

const LoginDisplay = () => {
  return (
    <div className="login-display-container">
      <div className="login-display-content">
        <div className="brand-logo">
          <img src="/src/assets/images/logo.png" alt="Green Cart" className="brand-logo-img" />
        </div>
        
        <div className="welcome-section">
          <h2 className="welcome-title">
            Welcome to Green Cart - where conscious shopping meets convenience.
          </h2>
          
          <p className="welcome-description">
            Discover eco-friendly products that support your lifestyle and the planet.
            Fast, local, and sustainable — shopping that makes a difference.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginDisplay;