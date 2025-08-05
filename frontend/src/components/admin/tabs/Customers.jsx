import React, { useState } from 'react';
import '../../styles/admin/tabs/Customers.css';
import CustomerCard from '../elements/CustomerCard';
import CustomerStatsCard from '../elements/CustomerStatsCard';
import CustomerModal from '../elements/CustomerModal';

const Customers = () => {
  const [viewMode, setViewMode] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Updated customer data with premium status
  const customers = [
    {
      id: 1,
      name: "Tahsan Khan",
      userId: "4568",
      company: "Ulstore.org",
      email: "Khan036@gmail.com",
      phone: "066-083-2696",
      contact: "066-083-2696",
      receivables: "USD 43,648.00",
      status: "Accepted",
      avatar: "/api/placeholder/40/40",
      isPremium: true,
      registrationDate: "02 March 2025",
      accountType: "Google",
      lastLogin: "2 hours ago",
      totalOrders: 45,
      memberSince: "March 2025"
    },
    {
      id: 2,
      name: "Anuwar Hussen",
      userId: "3421",
      company: "Ulstore.org",
      email: "anuwarhossen380@gmail.com",
      phone: "01788521380",
      contact: "01788521380",
      receivables: "USD 35,234.00",
      status: "Accepted",
      avatar: "/api/placeholder/40/40",
      isPremium: false,
      registrationDate: "15 February 2025",
      accountType: "Email",
      lastLogin: "1 day ago",
      totalOrders: 32,
      memberSince: "February 2025"
    },
    {
      id: 3,
      name: "Hasan Khan",
      userId: "2847",
      company: "Ulstore.org",
      email: "hasankhan@gmail.com",
      phone: "01893531209",
      contact: "01893531209",
      receivables: "USD 12,643.00",
      status: "Pending",
      avatar: "/api/placeholder/40/40",
      isPremium: true,
      registrationDate: "20 January 2025",
      accountType: "Google",
      lastLogin: "3 days ago",
      totalOrders: 18,
      memberSince: "January 2025"
    },
    {
      id: 4,
      name: "Jaman Khan",
      userId: "1953",
      company: "Ulstore.org",
      email: "jamankhan@gmail.com",
      phone: "01893531209",
      contact: "01893531209",
      receivables: "USD 23,123.00",
      status: "Cancel",
      avatar: "/api/placeholder/40/40",
      isPremium: false,
      registrationDate: "05 December 2024",
      accountType: "Email",
      lastLogin: "1 week ago",
      totalOrders: 12,
      memberSince: "December 2024"
    },
    {
      id: 5,
      name: "Herry Kane",
      userId: "2746",
      company: "Ulstore.org",
      email: "herrykane@gmail.com",
      phone: "01893531209",
      contact: "01893531209",
      receivables: "USD 17,890.00",
      status: "Accepted",
      avatar: "/api/placeholder/40/40",
      isPremium: true,
      registrationDate: "10 January 2025",
      accountType: "Google",
      lastLogin: "5 hours ago",
      totalOrders: 28,
      memberSince: "January 2025"
    },
    {
      id: 6,
      name: "Matt Henry",
      userId: "3682",
      company: "Ulstore.org",
      email: "matthenry@gmail.com",
      phone: "01893531209",
      contact: "01893531209",
      receivables: "USD 14,159.00",
      status: "Accepted",
      avatar: "/api/placeholder/40/40",
      isPremium: false,
      registrationDate: "25 February 2025",
      accountType: "Email",
      lastLogin: "2 days ago",
      totalOrders: 21,
      memberSince: "February 2025"
    }
  ];

  // Stats data
  const statsData = [
    {
      title: "Total Customers",
      value: "2,425",
      change: "+16%",
      changeType: "positive",
      period: "last month"
    },
    {
      title: "Active Customers",
      value: "456",
      change: "-5%",
      changeType: "negative",
      period: "last month"
    },
    {
      title: "New Customers",
      value: "1,132",
      change: "+18%",
      changeType: "positive",
      period: "last month"
    },
    {
      title: "Today Join",
      value: "324",
      change: "-22%",
      changeType: "negative",
      period: "last month"
    }
  ];

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      </div>

      {/* Stats Cards */}
      <div className="adm-cus-stats-grid">
        {statsData.map((stat, index) => (
          <CustomerStatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Controls */}
      <div className="adm-cus-controls">
        <div className="adm-cus-search-container">
          <input
            type="text"
            placeholder="Search..."
            className="adm-cus-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="adm-cus-control-buttons">
          <button className="adm-cus-filter-btn">Filter by</button>
          <button className="adm-cus-sort-btn">Sort by</button>
          <div className="adm-cus-view-toggle">
            <button
              className={`adm-cus-view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <span className="adm-cus-list-icon">☰</span>
            </button>
            <button
              className={`adm-cus-view-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
            >
              <span className="adm-cus-grid-icon">⊞</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        <div className="adm-cus-table-container">
          <table className="adm-cus-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>User ID</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th>Receivables</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} onClick={() => handleCustomerClick(customer)} className="adm-cus-clickable-row">
                  <td>
                    <div className="adm-cus-customer-info">
                      <div className="adm-cus-avatar-container">
                        <img
                          src={customer.avatar}
                          alt={customer.name}
                          className="adm-cus-avatar"
                        />
                        {customer.isPremium && <div className="adm-cus-premium-badge">G</div>}
                      </div>
                      <span className="adm-cus-name">{customer.name}</span>
                    </div>
                  </td>
                  <td>{customer.userId}</td>
                  <td>
                    <div className="adm-cus-email-container">
                      <span className="adm-cus-email-icon">✉️</span>
                      {customer.email}
                    </div>
                  </td>
                  <td>
                    <div className="adm-cus-phone-container">
                      <span className="adm-cus-phone-icon">📞</span>
                      {customer.phone}
                    </div>
                  </td>
                  <td className="adm-cus-receivables">{customer.receivables}</td>
                  <td>
                    <span className={`adm-cus-status ${getStatusClass(customer.status)}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td>
                    <div className="adm-cus-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="adm-cus-action-btn">🗑️</button>
                      <button className="adm-cus-action-btn">✏️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="adm-cus-cards-grid">
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              getStatusClass={getStatusClass}
              onClick={() => handleCustomerClick(customer)}
            />
          ))}
        </div>
      )}

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