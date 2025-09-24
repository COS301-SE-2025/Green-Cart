import React, { useState, useEffect } from 'react'; 
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
import bellIcon from './icons/bellIcon.png';
import logo from './icons/Green-cart-admin.png';

const SideBar = ({ isOpen, onToggle, currentPage, onNavigate }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  const navigationItems = [
    { name: 'Dashboard', icon: dashboardIcon },
    { name: 'Orders', icon: ordersIcon },
    { name: 'Products', icon: productsIcon },
    // { name: 'Payments', icon: paymentsIcon },
    { name: 'Customers', icon: customersIcon }
  ];

  const supportItems = [
    { name: 'Notifications', icon: bellIcon, badge: 7 },
    { name: 'Settings', icon: settingsIcon }
  ];

  const handleNavClick = (itemName) => {
    onNavigate(itemName);
  };

  const handleLogout = () => {
    try {
      sessionStorage.clear();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/admin/login');
    }
  };

  // Handle sidebar animation state
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 800); 
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
              <span className="logo-text"><img src={logo} className='logo-admin-image' alt="Admin Logo"/></span>
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
                style={{ animationDelay: isAnimating ? `${index * 0.1}s` : '0s' }}
                onClick={() => handleNavClick(item.name)}
              >
                <img src={item.icon} alt={`${item.name} icon`} className="nav-icon-img"/>
                <span>{item.name}</span>
              </div>
            ))}

            <div className="nav-divider"></div>

            {/* {supportItems.map((item, index) => (
              <div 
                key={item.name}
                className={`nav-item ${currentPage === item.name ? 'active' : ''}`}
                style={{ animationDelay: isAnimating ? `${(navigationItems.length + index) * 0.1}s` : '0s' }}
                onClick={() => handleNavClick(item.name)}
              >
                <img src={item.icon} alt={`${item.name} icon`} className="nav-icon-img"/>
                <span>{item.name}</span>
                {item.badge && <span className="notification-badge">{item.badge}</span>}
              </div>
            ))} */}
          </nav>

          {/* Red Logout Button */}
          <div className="sidebar-logout">
            <button 
              className="logout-btn" 
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SideBar;
