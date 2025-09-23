import React from 'react';

const OrdersTable = ({ orders, onOrderClick }) => {
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
                    //  color: 'white',
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