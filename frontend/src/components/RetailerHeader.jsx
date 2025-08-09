import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { logoutRetailer, getRetailerUser } from '../user-services/retailerAuthService';
import ShopSwitcher from './retailer/ShopSwitcher';
import './styles/RetailerHeader.css';

const RetailerHeader = () => {
  const navigate = useNavigate();
  const retailerUser = getRetailerUser();

  const handleLogout = () => {
    try {
      logoutRetailer();
      toast.success('Logged out successfully');
      navigate('/retailer-auth');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <header className="retailer-header">
      <div className="retailer-header-container">
        <div className="retailer-header-left">
          <Link to="/retailer-dashboard" className="retailer-logo">
            <span className="logo-icon">🏪</span>
            <span className="logo-text">GreenCart Retailer</span>
          </Link>
          
          {retailerUser && (
            <div className="shop-switcher-container">
              <ShopSwitcher />
            </div>
          )}
        </div>

        <nav className="retailer-nav">
          <Link to="/retailer-dashboard" className="nav-link">
            Dashboard
          </Link>
          <Link to="/retailer-products" className="nav-link">
            Products
          </Link>
          <Link to="/retailer-orders" className="nav-link">
            Orders
          </Link>
          <Link to="/retailer-analytics" className="nav-link">
            Analytics
          </Link>
        </nav>

        <div className="retailer-header-right">
          {retailerUser && (
            <div className="user-menu">
              <div className="user-info">
                <span className="user-name">{retailerUser.user_name || retailerUser.email}</span>
                <span className="user-role">Retailer</span>
              </div>
              
              <div className="user-actions">
                <button 
                  onClick={handleLogout}
                  className="logout-btn"
                  title="Logout"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
          
          <Link to="/" className="customer-site-link">
            View Customer Site
          </Link>
        </div>
      </div>
    </header>
  );
};

export default RetailerHeader;
