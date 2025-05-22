import React from 'react';
import LoginForm from './LoginForm';
import LoginDisplay from './LoginDisplay';
import './LoginPage.css';

const LoginPage = () => {
  return (
    <div className="login-page">
      <LoginForm />
      <LoginDisplay />
    </div>
  );
};

export default LoginPage;