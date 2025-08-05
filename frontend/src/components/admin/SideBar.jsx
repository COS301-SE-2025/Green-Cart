import React, { useState, useRef, useEffect } from 'react';
import '../styles/admin/SideBar.css';

// Import icons
import dashboardIcon from './icons/dashboardIcon.png';
import ordersIcon from './icons/ordersIcon.png';
import productsIcon from './icons/productsIcon.png';
import paymentsIcon from './icons/paymentsIcon.png';
import customersIcon from './icons/customersIcon.png';
// import notificationsIcon from '../icons/notificationsIcon.png';
// import helpIcon from '../icons/helpIcon.png';
// import settingsIcon from '../icons/settingsIcon.png';
import searchIcon from './icons/microscope.png'; // Add this icon to your icons folder
import logoImage from './icons/microscope.png'; // Add your logo image

const SideBar = ({ isOpen, onToggle, currentPage, onNavigate }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
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
    { name: 'Notifications', icon: dashboardIcon /*notificationsIcon*/, badge: 7 },
    { name: 'Help & Support', icon: dashboardIcon /*helpIcon*/ },
    { name: 'Settings', icon: dashboardIcon /*settingsIcon*/ }
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

  // Close profile menu when sidebar is collapsed
  useEffect(() => {
    if (!isOpen) {
      setShowProfileMenu(false);
    }
  }, [isOpen]);

  return (
    <div className={`sidebar ${!isOpen ? 'sidebar-closed' : ''}`}>
      {/* Toggle Button */}
      <button className="sidebar-toggle" onClick={onToggle}>
        {isOpen ? '←' : '→'}
      </button>

      {isOpen && (
        <>
          <div className="admin-sidebar-header">
            <div className="logo">
              <img src={logoImage} alt="Green-Cart Logo" className="logo-image" />
              <span className="logo-text">Green-Cart</span>
            </div>
          </div>

          <div className="admin-search-bar">
            <img src={searchIcon} alt="Search" className="search-icon" />
            <input type="text" placeholder="Search" />
          </div>

          <nav className="sidebar-nav">
            {navigationItems.map((item) => (
              <div 
                key={item.name}
                className={`nav-item ${currentPage === item.name ? 'active' : ''}`}
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

            {supportItems.map((item) => (
              <div 
                key={item.name}
                className={`nav-item ${currentPage === item.name ? 'active' : ''}`}
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
      <div className="sidebar-user">
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