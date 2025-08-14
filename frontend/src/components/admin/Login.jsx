import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import '../styles/admin/Login.css';
import AdminIcon from './icons/Green-cart-admin.png'; // Changed to .png

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // TODO: Implement admin login service
      console.log('Admin login attempt:', { email, password });
      
      // Placeholder for admin authentication

      sessionStorage.setItem('admin', JSON.stringify({ email, password }));
      // const result = await loginAdmin(email, password);
      
      toast.success('Admin login successful!');
      navigate('/admin'); // TODO: Navigate to admin dashboard
    } catch (err) {
      console.error('Admin login failed:', err.message);
      toast.error(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="admin-login-container">
        <div className="admin-header">
            <h1 className="admin-main-title">Admin Portal</h1>
        </div>
      <div className="admin-login-modal">
        <div className="admin-logo-container">
            <img src={AdminIcon} alt="Admin" className="admin-logo" />
        </div>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="admin-form-input"
              placeholder=" "
              required
            />
            <label htmlFor="admin-email" className="admin-form-label">Email address</label>
          </div>

          <div className="admin-form-group">
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-form-input"
              placeholder=" "
              required
            />
            <label htmlFor="admin-password" className="admin-form-label">Password</label>
          </div>

          <button type="submit" className="admin-signin-button">
            SIGN IN
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;