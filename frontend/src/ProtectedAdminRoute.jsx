import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ children }) => {
  const isAdminAuthenticated = () => {
    try {
      const adminSession = sessionStorage.getItem('adminSession');
      return !!adminSession && JSON.parse(adminSession).user_id;
    } catch (error) {
      console.error('Error checking admin authentication:', error);
      return false;
    }
  };
  
  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

export default ProtectedAdminRoute;