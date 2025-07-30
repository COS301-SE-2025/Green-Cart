import React, { useState, useRef, useEffect } from 'react';
import '../styles/admin/SideBar.css';

// Import icons
import dashboardIcon from './icons/dashboardIcon.png';
import ordersIcon from './icons/ordersIcon.png';
import productsIcon from './icons/productsIcon.png';
import paymentsIcon from './icons/paymentsIcon.png';
import customersIcon from './icons/customersIcon.png';
import leafIcon from './icons/leafIcon.png';
import backIcon from './icons/backIcon.png';
import logo from './icons/Green-cart-admin.png'

const SideBar = ({ isOpen, onToggle, currentPage, onNavigate }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const profileMenuRef = useRef(null);
  const profileButtonRef = useRef(null);

  const navigationItems = [
    { name: 'Dashboard', icon: dashboardIcon },
    { name: 'Orders', icon: ordersIcon },
    { name: 'Products', icon: productsIcon },
    { name: 'Payments', icon: paymentsIcon },
    { name: 'Customers', icon: customersIcon }
  ];

  const supportItems = [
    { name: 'Notifications', icon: dashboardIcon, badge: 7 },
    { name: 'Help & Support', icon: dashboardIcon },
    { name: 'Settings', icon: dashboardIcon }
  ];

  const handleNavClick = (itemName) => {
    onNavigate(itemName);
  };

  const handleProfileMenuToggle = (e) => {
    e.stopPropagation();
    setShowProfileMenu(!showProfileMenu);
  };

  const handleProfileAction = (action) => {
    setShowProfileMenu(false);
    if (action === 'logout') {
      console.log('Logging out...');
    } else if (action === 'profile') {
      console.log('Viewing profile...');
    }
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current && 
        !profileMenuRef.current.contains(event.target) &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
      setShowProfileMenu(false);
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
        <div className="user-avatar">OW</div>
        {isOpen && (
          <>
            <span className="user-name">Olivia Williams</span>
            <button 
              ref={profileButtonRef}
              className="user-menu"
              onClick={handleProfileMenuToggle}
            >
              ⋯
            </button>
          </>
        )}

        {/* Profile Menu Overlay */}
        {showProfileMenu && isOpen && (
          <div 
            ref={profileMenuRef}
            className="profile-menu-overlay"
          >
            <div className="profile-menu-item" onClick={() => handleProfileAction('profile')}>
              <span className="profile-menu-icon">👤</span>
              <span>View Profile</span>
            </div>
            <div className="profile-menu-divider"></div>
            <div className="profile-menu-item logout" onClick={() => handleProfileAction('logout')}>
              <span className="profile-menu-icon">🚪</span>
              <span>Logout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SideBar;