import React, { useState, useEffect } from 'react';
import SideBar from '../components/admin/SideBar';
import Products from '../components/admin/tabs/Products';
import Dashboard from '../components/admin/tabs/Dashboard';
import Customers from '../components/admin/tabs/Customers';
import Orders from '../components/admin/tabs/Orders';
import './styles/Admin.css';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('Dashboard');
  const navigate = useNavigate();

  // Set sidebar closed by default on smaller screens
  useEffect(() => {

    // Function to handle login authentication
    if (!sessionStorage.getItem('adminSession')) {
      navigate('/admin/login'); // Redirect to admin login if not authenticated
    }
    
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Orders':
        return <Orders />;
      case 'Products':
        return <Products />;
      case 'Payments':
        return <div className="page-placeholder">Payments Page - Coming Soon</div>;
      case 'Customers':
        return <Customers />;
      case 'Notifications':
        return <div className="page-placeholder">Notifications Page - Coming Soon</div>;
      case 'Help & Support':
        return <div className="page-placeholder">Help & Support Page - Coming Soon</div>;
      case 'Settings':
        return <div className="page-placeholder">Settings Page - Coming Soon</div>;
      default:
        return <Dashboard />;
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