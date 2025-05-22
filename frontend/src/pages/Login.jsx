import React from 'react';

import LoginForm from '../components/login/LoginForm';
import LoginDisplay from '../components/login/LoginDisplay';
import './styles/Login.css';

const Login = () => {
  return (
    <div className="login-page">
      <LoginForm />
      <LoginDisplay />
    </div>
  );
};

export default Login;