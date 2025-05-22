import React from 'react';
import './LoginDisplay.css';

const LoginDisplay = () => {
  return (
    <div className="login-display-container">
      <div className="login-display">
        <div className="logo-container">
          <img src="/assets/green-cart-logo.png" alt="Green Cart" className="logo" />
        </div>
        
        <div className="welcome-content">
          <h2 className="welcome-title">Welcome to Green Cart - where conscious shopping meets convenience.</h2>
          
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