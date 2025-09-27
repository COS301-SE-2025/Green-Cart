import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/login/LoginForm';
import LoginDisplay from '../components/login/LoginDisplay';
import './styles/Login.css';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const userData = localStorage.getItem('userData');
    const retailerUser = localStorage.getItem('retailer_user');
    
    if (userData || retailerUser) {
      // User is already logged in, redirect to Home
      navigate('/Home', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="login-container">
      <LoginForm />
      <LoginDisplay />
    </div>
  );
};

export default Login;