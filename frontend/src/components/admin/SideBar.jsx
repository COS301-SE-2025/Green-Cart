import React from 'react';
import '../styles/admin/SideBar.css';

const SideBar = ({ isOpen, onToggle }) => {
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
            <div className="nav-item">
              <span className="nav-icon">📊</span>
              <span>Dashboard</span>
            </div>
            <div className="nav-item">
              <span className="nav-icon">📦</span>
              <span>Orders</span>
            </div>
            <div className="nav-item active">
              <span className="nav-icon">🛍️</span>
              <span>Products</span>
            </div>
            <div className="nav-item">
              <span className="nav-icon">💳</span>
              <span>Payments</span>
            </div>
            <div className="nav-item">
              <span className="nav-icon">👥</span>
              <span>Customers</span>
            </div>

            <div className="nav-divider"></div>

            <div className="nav-item">
              <span className="nav-icon notification-icon">🔔</span>
              <span>Notifications</span>
              <span className="notification-badge">7</span>
            </div>
            <div className="nav-item">
              <span className="nav-icon">❓</span>
              <span>Help & Support</span>
            </div>
            <div className="nav-item">
              <span className="nav-icon">⚙️</span>
              <span>Settings</span>
            </div>
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