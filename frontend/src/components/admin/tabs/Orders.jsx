import React, { useState } from 'react';
import CustomersPagination from '../elements/CustomersPagination';
import './Orders.css';

const Orders = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedView, setSelectedView] = useState('table');
  const [orderFilter, setOrderFilter] = useState('On Delivery');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - you would replace this with actual data
  const orders = [
    {
      orderId: '#0014ABCD',
      customer: 'Theresa',
      date: '17 May 2025',
      address: '32 Danmondi → 82 Subidbaz',
      status: 'Pending'
    },
    {
      orderId: '#0013ABGS',
      customer: 'Devon',
      date: '18 May 2025',
      address: '21 Savar → 24 New Market',
      status: 'Shipping'
    },
    {
      orderId: '#0016ABLL',
      customer: 'Cameron',
      date: '18 May 2025',
      address: 'Devtakhum → Dhaka 1120',
      status: 'Delivered'
    },
    {
      orderId: '#0018ABAA',
      customer: 'Darlene',
      date: '17 May 2025',
      address: '42 Dulukahpa → 82 Subidbaz',
      status: 'Returned'
    },
    {
      orderId: '#0013ABGG',
      customer: 'Darlene',
      date: '14 May 2025',
      address: '64 Handipas → 212 Laksam',
      status: 'Shipping'
    }
  ];

  const totalPages = Math.ceil(orders.length / 10);
  const itemsPerPage = 10;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleExport = () => {
    console.log('Export orders');
  };

  const orderTabs = ['On Delivery', 'Pending', 'Shipping', 'Delivered', 'Canceled', 'Returned'];

  const getStatusColor = (status) => {
    const colors = {
      'Pending': '#f59e0b',
      'Shipping': '#3b82f6',
      'Delivered': '#10b981',
      'Returned': '#ef4444',
      'Canceled': '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  return (
    <div className="adm-ord-container">
      {/* Header */}
      <div className="adm-ord-header">
        <h1 className="adm-ord-title">Orders</h1>
        <div className="adm-ord-header-actions">
          <button className="adm-ord-export-btn" onClick={handleExport}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2"/>
              <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2"/>
              <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="adm-ord-stats-grid">
        <div className="adm-ord-stats-card">
          <div className="adm-ord-stats-header">
            <div className="adm-ord-stats-title-section">
              <h3 className="adm-ord-stats-title">Order Overview</h3>
              <p className="adm-ord-stats-subtitle">Week</p>
            </div>
          </div>
          <div className="adm-ord-stats-content">
            <div className="adm-ord-stats-value-row">
              <div className="adm-ord-stats-main">
                <div className="adm-ord-stats-label">Total Order</div>
                <div className="adm-ord-stats-value">2,520</div>
                <div className="adm-ord-stats-change">
                  <span className="adm-ord-change positive">+10.5%</span>
                  <span className="adm-ord-comparison">Compared to last week</span>
                </div>
              </div>
            </div>
          </div>
          {/* Order breakdown */}
          <div className="adm-ord-breakdown">
            <div className="adm-ord-breakdown-item">
              <span className="adm-ord-breakdown-label">Active Order</span>
              <span className="adm-ord-breakdown-value">123</span>
            </div>
            <div className="adm-ord-breakdown-item">
              <span className="adm-ord-breakdown-label">Pending Order</span>
              <span className="adm-ord-breakdown-value">157</span>
            </div>
            <div className="adm-ord-breakdown-item">
              <span className="adm-ord-breakdown-label">On Delivery</span>
              <span className="adm-ord-breakdown-value">530</span>
            </div>
            <div className="adm-ord-breakdown-item">
              <span className="adm-ord-breakdown-label">Delivered</span>
              <span className="adm-ord-breakdown-value">1710</span>
            </div>
          </div>
        </div>

        <div className="adm-ord-stats-card">
          <div className="adm-ord-stats-header">
            <div className="adm-ord-stats-title-section">
              <h3 className="adm-ord-stats-title">Revenue</h3>
              <p className="adm-ord-stats-subtitle">Last Month</p>
            </div>
          </div>
          <div className="adm-ord-stats-content">
            <div className="adm-ord-stats-value-row">
              <div className="adm-ord-stats-main">
                <div className="adm-ord-stats-label">Total Revenue</div>
                <div className="adm-ord-stats-value">$116K</div>
                <div className="adm-ord-stats-change">
                  <span className="adm-ord-change negative">-7.2%</span>
                  <span className="adm-ord-comparison">Compared to last week</span>
                </div>
              </div>
            </div>
          </div>
          {/* Revenue breakdown */}
          <div className="adm-ord-breakdown">
            <div className="adm-ord-breakdown-item">
              <span className="adm-ord-breakdown-label">Online</span>
              <span className="adm-ord-breakdown-value">$74K</span>
            </div>
            <div className="adm-ord-breakdown-item">
              <span className="adm-ord-breakdown-label">Cash</span>
              <span className="adm-ord-breakdown-value">$42K</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Tabs */}
      <div className="adm-ord-tabs">
        {orderTabs.map((tab) => (
          <button
            key={tab}
            className={`adm-ord-tab ${orderFilter === tab ? 'active' : ''}`}
            onClick={() => setOrderFilter(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search and Controls */}
      <div className="adm-ord-search-and-controls">
        <div className="adm-ord-search-container">
          <div className="adm-ord-search-wrapper">
            <svg className="adm-ord-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <input
              type="text"
              className="adm-ord-search-input"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="adm-ord-control-buttons">
          <button className="adm-ord-filter-btn">
            Filter by
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
          <button className="adm-ord-sort-btn">
            Sort by
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
          <div className="adm-ord-view-toggle">
            <button
              className={`adm-ord-view-btn ${selectedView === 'table' ? 'active' : ''}`}
              onClick={() => setSelectedView('table')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
            <button
              className={`adm-ord-view-btn ${selectedView === 'card' ? 'active' : ''}`}
              onClick={() => setSelectedView('card')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="4" stroke="currentColor" strokeWidth="2"/>
                <rect x="3" y="9" width="18" height="4" stroke="currentColor" strokeWidth="2"/>
                <rect x="3" y="15" width="18" height="4" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="adm-ord-table-container">
        <table className="adm-ord-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Address</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={index}>
                <td className="adm-ord-order-id">{order.orderId}</td>
                <td className="adm-ord-customer">{order.customer}</td>
                <td className="adm-ord-date">{order.date}</td>
                <td className="adm-ord-address">{order.address}</td>
                <td>
                  <span 
                    className="adm-ord-status"
                    style={{ 
                      backgroundColor: `${getStatusColor(order.status)}20`,
                      color: getStatusColor(order.status)
                    }}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <CustomersPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalItems={orders.length}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
};

export default Orders;