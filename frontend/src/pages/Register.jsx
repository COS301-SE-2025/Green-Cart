import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/register/RegisterForm';
import LoginDisplay from '../components/login/LoginDisplay';
import './styles/Register.css';

const Register = () => {
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
    <div className="register-container">
      <RegisterForm />
      <LoginDisplay />
    </div>
  );
};

export default Register;