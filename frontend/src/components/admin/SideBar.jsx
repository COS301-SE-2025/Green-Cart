import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState('Orders');

  const menuItems = [
    { name: 'Dashboard', icon: '', shortcut: '' },
    { name: 'Orders', icon: '', shortcut: '' },
    { name: 'Inventory', icon: '', shortcut: '' },
    { name: 'Payments', icon: '', shortcut: '' },
    { name: 'Customers', icon: '', shortcut: '' },
  ];

  const bottomItems = [
    { name: 'Notifications', icon: '', hasNotification: true },
    { name: 'Help & support', icon: '', shortcut: '' },
    { name: 'Settings', icon: '', shortcut: '' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        {/* Header */}
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">Mate</span>
          </div>
          <button className="collapse-btn">
            <span>◀</span>
          </button>
        </div>

        {/* Search */}
        <div className="search-container">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search" 
              className="search-input"
            />
            <span className="search-shortcut">⌘F</span>
          </div>
        </div>

        {/* Main Menu */}
        <nav className="main-menu">
          {menuItems.map((item) => (
            <div
              key={item.name}
              className={`menu-item ${activeItem === item.name ? 'active' : ''}`}
              onClick={() => setActiveItem(item.name)}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-text">{item.name}</span>
              {item.shortcut && <span className="menu-shortcut">{item.shortcut}</span>}
            </div>
          ))}
        </nav>

        {/* Bottom Menu */}
        <div className="bottom-menu">
          {bottomItems.map((item) => (
            <div key={item.name} className="menu-item">
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-text">{item.name}</span>
              {item.hasNotification && <span className="notification-badge">1</span>}
              {item.shortcut && <span className="menu-shortcut">{item.shortcut}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Profile Section - Always Visible */}
      <div className="profile-section">
        <div className="profile-container">
          <div className="profile-avatar">
            <img 
              src="/api/placeholder/32/32" 
              alt="Olivia Williams" 
              className="avatar-image"
            />
          </div>
          <div className="profile-info">
            <span className="profile-name">Olivia Williams</span>
          </div>
          <button className="profile-menu-btn">
            <span>⋯</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;