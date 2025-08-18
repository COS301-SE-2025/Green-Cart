import React, { useState, useRef, useEffect } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { useNavigate } from 'react-router-dom';
import '../styles/admin/SideBar.css';

// Import icons
import dashboardIcon from './icons/dashboardIcon.png';
import ordersIcon from './icons/ordersIcon.png';
import productsIcon from './icons/productsIcon.png';
import paymentsIcon from './icons/paymentsIcon.png';
import customersIcon from './icons/customersIcon.png';
import backIcon from './icons/backIcon.png';
import settingsIcon from './icons/settingsIcon.png';
import bellIcon from './icons/bellIcon.png'; // Assuming you have a bell icon for notifications
import logo from './icons/Green-cart-admin.png';
// Profile menu icons - you'll need to add these to your icons folder
import profileIcon from './icons/profileIcon.png';
import logoutIcon from './icons/logoutIcon.png';

const SideBar = ({ isOpen, onToggle, currentPage, onNavigate }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [adminData, setAdminData] = useState({
    name: 'Unknown User',
    email: 'unknown@example.com'
  });
  
  const navigate = useNavigate();

  const navigationItems = [
    { name: 'Dashboard', icon: dashboardIcon },
    { name: 'Orders', icon: ordersIcon },
    { name: 'Products', icon: productsIcon },
    { name: 'Payments', icon: paymentsIcon },
    { name: 'Customers', icon: customersIcon }
  ];

  const supportItems = [
    { name: 'Notifications', icon: bellIcon, badge: 7 },
    // { name: 'Help & Support', icon: dashboardIcon },
    { name: 'Settings', icon: settingsIcon }
  ];

  // Load admin data from session storage
  useEffect(() => {
    const loadAdminData = () => {
      try {
        const adminInfo = sessionStorage.getItem('adminSession');
        if (adminInfo) {
          const parsedAdminData = JSON.parse(adminInfo);
          setAdminData({
            name: parsedAdminData.name || 'Admin User',
            email: parsedAdminData.email || 'admin@example.com'
          });
        }
      } catch (error) {
        console.error('Error loading admin data from session storage:', error);
        // Keep default values if error occurs
      }
    };

    loadAdminData();
  }, []);

  // Helper function to get initials from name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleNavClick = (itemName) => {
    onNavigate(itemName);
  };

  const handleProfileAction = (action) => {
    if (action === 'logout') {
      handleLogout();
    } else if (action === 'profile') {
      console.log('Viewing profile...');
      // You can navigate to a profile page or open a profile modal here
    }
  };

  const handleLogout = () => {
    try {
      // Clear session storage
      sessionStorage.removeItem('adminSession');
      // Clear any other stored data if needed
      sessionStorage.clear();
      
      // Navigate to login page
      navigate('/admin/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still navigate to login even if there's an error clearing storage
      navigate('/admin/login');
    }
  };

  // Handle sidebar animation state
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Reset animation state after animation completes
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 800); // Adjust based on your longest animation delay
      
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  return (
    <div className={`sidebar ${!isOpen ? 'sidebar-closed' : ''} ${isAnimating ? 'sidebar-animating' : ''}`}>
      {/* Toggle Button */}
      <button className="sidebar-toggle" onClick={onToggle}>
        <img 
          src={backIcon} 
          alt="Toggle sidebar" 
          className={`toggle-arrow ${!isOpen ? 'toggle-arrow-closed' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <div className="admin-sidebar-header">
            <div className="logo">
              <span className="logo-text"><img src={logo} className='logo-admin-image'/></span>
            </div>
          </div>

          <div className="admin-search-bar">
            <div className="search-input-container">
              <svg 
                className="search-icon" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input type="text" placeholder="Search" />
            </div>
          </div>

          <nav className="sidebar-nav">
            {navigationItems.map((item, index) => (
              <div 
                key={item.name}
                className={`nav-item ${currentPage === item.name ? 'active' : ''}`}
                style={{ 
                  animationDelay: isAnimating ? `${index * 0.1}s` : '0s' 
                }}
                onClick={() => handleNavClick(item.name)}
              >
                <img 
                  src={item.icon} 
                  alt={`${item.name} icon`} 
                  className="nav-icon-img"
                />
                <span>{item.name}</span>
              </div>
            ))}

            <div className="nav-divider"></div>

            {supportItems.map((item, index) => (
              <div 
                key={item.name}
                className={`nav-item ${currentPage === item.name ? 'active' : ''}`}
                style={{ 
                  animationDelay: isAnimating ? `${(navigationItems.length + index) * 0.1}s` : '0s' 
                }}
                onClick={() => handleNavClick(item.name)}
              >
                <img 
                  src={item.icon} 
                  alt={`${item.name} icon`} 
                  className="nav-icon-img"
                />
                <span>{item.name}</span>
                {item.badge && <span className="notification-badge">{item.badge}</span>}
              </div>
            ))}
          </nav>
        </>
      )}

      {/* User Profile - Always visible */}
      <div className={isOpen ? "sidebar-user" : "sidebar-user sidebar-user-closed"}>
        <div className="user-avatar">{getInitials(adminData.name)}</div>
        {isOpen && (
          <>
            <div className="user-info">
              <span className="user-name">{adminData.name}</span>
              <span className="user-email">{adminData.email}</span>
            </div>
            
            {/* Bootstrap Dropdown */}
            <Dropdown drop="up" align="end">
              <Dropdown.Toggle 
                variant="none"
                id="profile-dropdown"
                className="sidebar-profile-dropdown-toggle"
              >
                ⋯
              </Dropdown.Toggle>

              <Dropdown.Menu className="sidebar-profile-dropdown-menu">
                <Dropdown.Item 
                  onClick={() => handleProfileAction('profile')}
                  className="sidebar-profile-dropdown-item"
                >
                  <img src={profileIcon} alt="Profile" className="sidebar-profile-dropdown-icon" />
                  View Profile
                </Dropdown.Item>
                
                <Dropdown.Divider className="sidebar-profile-dropdown-divider" />
                
                <Dropdown.Item 
                  onClick={() => handleProfileAction('logout')}
                  className="sidebar-profile-dropdown-item logout"
                >
                  <img src={logoutIcon} alt="Logout" className="sidebar-profile-dropdown-icon" />
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </>
        )}
      </div>
    </div>
  );
};

export default SideBar;