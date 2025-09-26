import React from 'react';

const OrdersTable = ({ orders, loading = false, onOrderClick }) => {
  const getStatusColor = (status) => {
    const colors = {
      'Preparing Order': '#f59e0b',
      'Ready for Delivery': '#3b82f6',
      'In Transit': '#10b981',
      'Delivered': '#ef4444',
      'Cancelled': '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="orders-table-wrapper">
        <div className="orders-table-loading-container">
          <div className="orders-table-loading-content">
            <div className="orders-table-spinner">
              <svg className="orders-table-spinner-svg" viewBox="25 25 50 50">
                <circle 
                  className="orders-table-spinner-circle" 
                  cx="50" 
                  cy="50" 
                  r="20" 
                  fill="none" 
                  stroke="#1f2937"
                  strokeWidth="2" 
                  strokeMiterlimit="10"
                />
              </svg>
            </div>
            <span className="orders-table-loading-text">Loading orders table...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
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
            <tr 
              key={index} 
              className="clickable-order-row"
              onClick={() => onOrderClick && onOrderClick(order)}
            >
              <td className="adm-ord-order-id">{order.order_id}</td>
              <td className="adm-ord-customer">{order.user_email}</td>
              <td className="adm-ord-date">{order.date}</td>
              <td className="adm-ord-address">{order.address}</td>
              <td>
                <span 
                  className="adm-ord-status"
                  style={{ 
                    color: getStatusColor(order.state),
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  {order.state}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;