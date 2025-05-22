import { useState } from 'react';
import { Navigate } from 'react-router-dom'
import './styles/loginForm.css';

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt with:', formData);
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <h1 className="welcome-text">Welcome to GreenCart</h1>
        
        <div className="login-box">
          <h2 className="login-heading">Login</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username/email:</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button 
                  type="button" 
                  className="toggle-password"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <span className="eye-icon">👁️</span>
                  ) : (
                    <span className="eye-slash-icon">👁️‍🗨️</span>
                  )}
                </button>
              </div>
              <div className="forgot-password">
                <a href="/forgot-password">Forgot Password?</a>
              </div>
            </div>
            
            <button type="submit" className="login-button">Login</button>
          </form>
          
          <div className="signup-prompt">
            Don't have an account yet? <a href="/signup">Signup</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;