// Customers.jsx
import React, { useState } from 'react';
import '../../styles/admin/tabs/Customers.css';
import CustomerCard from '../elements/CustomerCard';
import CustomerStatsCard from '../elements/CustomerStatsCard';
import CustomerModal from '../elements/CustomerModal';
import CustomersTable from '../elements/CustomersTable';
import CustomersPagination from '../elements/CustomersPagination';

//icons

import blackGridIcon from '../icons/blackGridIcon.png';
import blackListIcon from '../icons/blackListIcon.png';
import whiteGridIcon from '../icons/whiteGridIcon.png';
import whiteListIcon from '../icons/whiteListIcon.png';

const Customers = () => {
  const [viewMode, setViewMode] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Enhanced customer data with more entries for pagination
  const customers = [
    {
      id: 1,
      name: "Tahsan Khan",
      userId: "4568",
      company: "Ulstore.org",
      email: "Khan036@gmail.com",
      phone: "+1 (555) 123-4567",
      contact: "066-083-2696",
      receivables: "USD 43,648.00",
      status: "Accepted",
      avatar: "/api/placeholder/40/40",
      isPremium: true,
      plan: "Premium",
      registrationDate: "02 March 2025",
      accountType: "Google",
      lastLogin: "2 hours ago",
      totalOrders: 45,
      memberSince: "March 2025",
      sustainability: 85
    },
    {
      id: 2,
      name: "Anuwar Hussen",
      userId: "3421",
      company: "Ulstore.org",
      email: "anuwarhossen380@gmail.com",
      phone: "+1 (555) 987-6543",
      contact: "01788521380",
      receivables: "USD 35,234.00",
      status: "Accepted",
      avatar: "/api/placeholder/40/40",
      isPremium: false,
      plan: "Basic",
      registrationDate: "15 February 2025",
      accountType: "Email",
      lastLogin: "1 day ago",
      totalOrders: 32,
      memberSince: "February 2025",
      sustainability: 60
    },
    {
      id: 3,
      name: "Hasan Khan",
      userId: "2847",
      company: "Ulstore.org",
      email: "hasankhan@gmail.com",
      phone: "+1 (555) 246-8135",
      contact: "01893531209",
      receivables: "USD 12,643.00",
      status: "Pending",
      avatar: "/api/placeholder/40/40",
      isPremium: true,
      plan: "Premium",
      registrationDate: "20 January 2025",
      accountType: "Google",
      lastLogin: "3 days ago",
      totalOrders: 18,
      memberSince: "January 2025",
      sustainability: 75
    },
    {
      id: 4,
      name: "Jaman Khan",
      userId: "1953",
      company: "Ulstore.org",
      email: "jamankhan@gmail.com",
      phone: "+1 (555) 369-2580",
      contact: "01893531209",
      receivables: "USD 23,123.00",
      status: "Cancel",
      avatar: "/api/placeholder/40/40",
      isPremium: false,
      plan: "Basic",
      registrationDate: "05 December 2024",
      accountType: "Email",
      lastLogin: "1 week ago",
      totalOrders: 12,
      memberSince: "December 2024",
      sustainability: 45
    },
    {
      id: 5,
      name: "Herry Kane",
      userId: "2746",
      company: "Ulstore.org",
      email: "herrykane@gmail.com",
      phone: "+1 (555) 147-2589",
      contact: "01893531209",
      receivables: "USD 17,890.00",
      status: "Accepted",
      avatar: "/api/placeholder/40/40",
      isPremium: true,
      plan: "Premium",
      registrationDate: "10 January 2025",
      accountType: "Google",
      lastLogin: "5 hours ago",
      totalOrders: 28,
      memberSince: "January 2025",
      sustainability: 90
    },
    {
      id: 6,
      name: "Matt Henry",
      userId: "3682",
      company: "Ulstore.org",
      email: "matthenry@gmail.com",
      phone: "+1 (555) 753-9514",
      contact: "01893531209",
      receivables: "USD 14,159.00",
      status: "Accepted",
      avatar: "/api/placeholder/40/40",
      isPremium: false,
      plan: "Basic",
      registrationDate: "25 February 2025",
      accountType: "Email",
      lastLogin: "2 days ago",
      totalOrders: 21,
      memberSince: "February 2025",
      sustainability: 55
    },
    // Additional mock data for pagination
    {
      id: 7,
      name: "Sarah Wilson",
      userId: "5829",
      company: "Ulstore.org",
      email: "sarah.wilson@gmail.com",
      phone: "+1 (555) 852-7410",
      contact: "01893531209",
      receivables: "USD 19,500.00",
      status: "Accepted",
      avatar: "/api/placeholder/40/40",
      isPremium: true,
      plan: "Premium",
      registrationDate: "12 March 2025",
      accountType: "Google",
      lastLogin: "30 minutes ago",
      totalOrders: 35,
      memberSince: "March 2025",
      sustainability: 95
    },
    {
      id: 8,
      name: "David Chen",
      userId: "4162",
      company: "Ulstore.org",
      email: "david.chen@gmail.com",
      phone: "+1 (555) 963-7418",
      contact: "01893531209",
      receivables: "USD 28,750.00",
      status: "Pending",
      avatar: "/api/placeholder/40/40",
      isPremium: false,
      plan: "Basic",
      registrationDate: "08 February 2025",
      accountType: "Email",
      lastLogin: "4 hours ago",
      totalOrders: 23,
      memberSince: "February 2025",
      sustainability: 70
    },
    // Add more entries for pagination demo
    {
      id: 9,
      name: "Emily Johnson",
      userId: "7394",
      company: "Ulstore.org",
      email: "emily.j@gmail.com",
      phone: "+1 (555) 159-7532",
      contact: "01893531209",
      receivables: "USD 31,200.00",
      status: "Accepted",
      avatar: "/api/placeholder/40/40",
      isPremium: true,
      plan: "Premium",
      registrationDate: "18 January 2025",
      accountType: "Google",
      lastLogin: "1 hour ago",
      totalOrders: 42,
      memberSince: "January 2025",
      sustainability: 88
    },
    {
      id: 10,
      name: "Michael Brown",
      userId: "8261",
      company: "Ulstore.org",
      email: "m.brown@gmail.com",
      phone: "+1 (555) 741-9630",
      contact: "01893531209",
      receivables: "USD 16,890.00",
      status: "Cancel",
      avatar: "/api/placeholder/40/40",
      isPremium: false,
      plan: "Basic",
      registrationDate: "30 December 2024",
      accountType: "Email",
      lastLogin: "2 weeks ago",
      totalOrders: 8,
      memberSince: "December 2024",
      sustainability: 30
    }
  ];

  // Stats data
  const statsData = [
  {
    title: "Total customers",
    value: "2,420",
    change: "+20%",
    changeType: "positive",
    period: "last month",
    subtitle: "6 From South Africa"
  },
  {
    title: "Members",
    value: "1,210",
    change: "+15%",
    changeType: "positive",
    period: "last month",
    subtitle: "7 Active Retailers"
  },
  {
    title: "Premium Members",
    value: "847",
    change: "+8%",
    changeType: "positive",
    period: "last month",
    subtitle: "Upgraded this month"
  }
];

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'adm-cus-status-accepted';
      case 'pending':
        return 'adm-cus-status-pending';
      case 'cancel':
        return 'adm-cus-status-cancel';
      default:
        return 'adm-cus-status-default';
    }
  };

  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCustomer(null);
  };

  return (
    <div className="adm-cus-container">
      <div className="adm-cus-header">
        <h1 className="adm-cus-title">Customers</h1>
        <div className="adm-cus-header-actions">
          <button className="adm-cus-export-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="adm-cus-stats-grid">
        {statsData.map((stat, index) => (
          <CustomerStatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Search and Controls */}
      <div className="adm-cus-search-and-controls">
        <div className="adm-cus-search-container">
          <div className="adm-cus-search-wrapper">
            <svg className="adm-cus-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <input
              type="text"
              placeholder="Search"
              className="adm-cus-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="adm-cus-control-buttons">
          <button className="adm-cus-filter-btn">Filter by</button>
          <button className="adm-cus-sort-btn">Sort by</button>
          <div className="adm-cus-view-toggle">
            <button
              className={`adm-cus-view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <img src={viewMode === 'list' ? whiteListIcon : blackListIcon} alt="List view" />
            </button>
            <button
              className={`adm-cus-view-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
            >
              <img src={viewMode === 'cards' ? whiteGridIcon : blackGridIcon} alt="Card view" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        <CustomersTable 
          customers={paginatedCustomers}
          onCustomerClick={handleCustomerClick}
          getStatusClass={getStatusClass}
        />
      ) : (
        <div className="adm-cus-cards-grid">
          {paginatedCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              getStatusClass={getStatusClass}
              onClick={() => handleCustomerClick(customer)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <CustomersPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredCustomers.length}
        itemsPerPage={itemsPerPage}
      />

      {/* Modal */}
      {showModal && selectedCustomer && (
        <CustomerModal
          customer={selectedCustomer}
          onClose={handleCloseModal}
          getStatusClass={getStatusClass}
        />
      )}
    </div>
  );
};

export default Customers;