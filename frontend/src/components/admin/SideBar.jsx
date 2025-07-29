import React from 'react';
import '../styles/admin/SideBar.css';

const SideBar = ({ isOpen, onToggle, currentPage, onNavigate }) => {
  const navigationItems = [
    { name: 'Dashboard', icon: '📊' },
    { name: 'Orders', icon: '📦' },
    { name: 'Products', icon: '🛍️' },
    { name: 'Payments', icon: '💳' },
    { name: 'Customers', icon: '👥' }
  ];

  const supportItems = [
    { name: 'Notifications', icon: '🔔', badge: 7 },
    { name: 'Help & Support', icon: '❓' },
    { name: 'Settings', icon: '⚙️' }
  ];

  const handleNavClick = (itemName) => {
    onNavigate(itemName);
  };

  return (
    <div className={`sidebar ${!isOpen ? 'sidebar-closed' : ''}`}>
      {/* Close Button */}
      <button className="sidebar-toggle" onClick={onToggle}>
        {isOpen ? '←' : '→'}
      </button>

      {isOpen && (
        <>
          <div className="sidebar-header">
            <div className="logo">
              <span className="logo-icon">🛒</span>
              <span className="logo-text">Green-Cart</span>
            </div>
          </div>

          <div className="search-bar">
            <input type="text" placeholder="Search" />
            <span className="search-shortcut">⌘F</span>
          </div>

          <nav className="sidebar-nav">
            {navigationItems.map((item) => (
              <div 
                key={item.name}
                className={`nav-item ${currentPage === item.name ? 'active' : ''}`}
                onClick={() => handleNavClick(item.name)}
              >
                <span className="nav-icon">{item.icon}</span>
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
                <span className="nav-icon">{item.icon}</span>
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
            <span className="user-menu">⋯</span>
          </>
        )}
      </div>
    </div>
  );
};

export default SideBar;