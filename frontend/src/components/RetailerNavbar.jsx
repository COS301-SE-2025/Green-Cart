import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Logo from '../assets/images/logo.png';
import './styles/RetailerNavbar.css';
import { getRetailerUser, logoutRetailer } from '../user-services/retailerAuthService';
import ShopSwitcher from './retailer/ShopSwitcher';

const RetailerNavbar = () => {
  const navigate = useNavigate();
  const retailerUser = getRetailerUser();

  const handleLogout = () => {
    try {
      logoutRetailer();
      toast.success('Logged out successfully');
      navigate('/retailer-auth');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <nav className="retailer-navbar">
      <div className="navbar-container">
        {/* Left: Retailer Name and Shop Switcher */}
        <div className="navbar-left">
          <h2 className="retailer-name">{retailerUser?.name || 'Retailer Store'}</h2>
          {retailerUser && (
            <div className="shop-switcher-container">
              <ShopSwitcher />
            </div>
          )}
        </div>

        {/* Center: GreenCart Logo */}
        <div className="navbar-center">
          <Link to="/retailer-dashboard" className="navbar-logo" title="Go to Dashboard">
            <div className="css-logo">
              Green <span className="cart-text">Cart</span>
              <span className="animated-leaf">🍃</span>
            </div>
          </Link>
        </div>

        {/* Right: Logout */}
        <div className="navbar-right">
          <button 
            onClick={handleLogout}
            className="logout-btn"
            title="Logout"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default RetailerNavbar;
