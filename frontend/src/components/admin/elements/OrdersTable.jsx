import React from 'react';

const OrdersTable = ({ orders }) => {
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
  );
};

export default OrdersTable;