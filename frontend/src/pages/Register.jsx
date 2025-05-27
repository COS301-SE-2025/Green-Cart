import React from 'react';
import RegisterForm from '../components/register/RegisterForm';
import LoginDisplay from '../components/login/LoginDisplay';
import './styles/Register.css';

const Register = () => {
  return (
    <div className="register-container">
      <RegisterForm />
      <LoginDisplay />
    </div>
  );
};

export default Register;