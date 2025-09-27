
import React, { useState } from 'react';
import '../../styles/retailer/Auth/RetailerAuthOverlay.css';
import toast from 'react-hot-toast';

const RetailerAuthOverlay = ({ isOpen, onClose, onSubmit }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    organisation: '',
    password: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, isSignUp ? 'signup' : 'signin');
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({
      name: '',
      organisation: '',
      password: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="retailer-auth-backdrop">
      <div className="retailer-auth-container">
        <button onClick={onClose} className="close-button">✕</button>
        <h2 className="retailer-auth-header">{isSignUp ? 'Sign Up' : 'Sign In'} as Retailer</h2>
        <form className="retailer-auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              placeholder=" "
              className='AuthInput'
            />
            <label htmlFor="name" className='AuthLabel'>Name</label>
          </div>

          <div className="form-group">
            <input
              id="organisation"
              type="text"
              value={formData.organisation}
              onChange={(e) => handleInputChange('organisation', e.target.value)}
              required
              placeholder=" "
              className='AuthInput'
            />
            <label htmlFor="organisation" className='AuthLabel'>Organisation</label>
          </div>

          <div className="form-group">
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              placeholder=" "
              className='AuthInput'
            />
            <label htmlFor="password" className='AuthLabel'>Password</label>
          </div>

          <button type="submit" className="submit-button">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>

          <div className="toggle-container">
            <span className="toggle-text">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <button
              type="button"
              onClick={toggleMode}
              className="toggle-button"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RetailerAuthOverlay;
