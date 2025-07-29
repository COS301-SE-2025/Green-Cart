import React, { useState } from 'react';
import SideBar from '../components/admin/SideBar';
import Products from '../components/admin/tabs/Products';
import './styles/Admin.css';

const Admin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('Products');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'Dashboard':
        return <div className="page-placeholder">Dashboard Page - Coming Soon</div>;
      case 'Orders':
        return <div className="page-placeholder">Orders Page - Coming Soon</div>;
      case 'Products':
        return <Products />;
      case 'Payments':
        return <div className="page-placeholder">Payments Page - Coming Soon</div>;
      case 'Customers':
        return <div className="page-placeholder">Customers Page - Coming Soon</div>;
      case 'Notifications':
        return <div className="page-placeholder">Notifications Page - Coming Soon</div>;
      case 'Help & Support':
        return <div className="page-placeholder">Help & Support Page - Coming Soon</div>;
      case 'Settings':
        return <div className="page-placeholder">Settings Page - Coming Soon</div>;
      default:
        return <Products />;
    }
  };

  return (
    <div className="admin-layout">
      <SideBar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
        currentPage={currentPage}
        onNavigate={handleNavigation}
      />
      
      <div className={`main-wrapper ${!sidebarOpen ? 'main-wrapper-expanded' : ''}`}>
        {renderContent()}
      </div>
    </div>
  );
};

export default Admin;