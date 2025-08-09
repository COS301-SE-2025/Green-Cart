import React from 'react';
import { Navigate } from 'react-router-dom';
import { isRetailerAuthenticated } from '../user-services/retailerAuthService';

const ProtectedRetailerRoute = ({ children }) => {
  const isAuthenticated = isRetailerAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/retailer-auth" replace />;
  }
  
  return children;
};

export default ProtectedRetailerRoute;
