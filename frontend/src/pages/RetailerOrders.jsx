import React, { useState, useEffect } from 'react';
import RetailerNavbar from '../components/RetailerNavbar';
import { getRetailerUser } from '../user-services/retailerAuthService';
import toast from 'react-hot-toast';
import './styles/RetailerOrders.css';

const RetailerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const retailerUser = getRetailerUser();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/retailer/orders?shop_id=${retailerUser.id}`);
      // const data = await response.json();
      
      // Mock data for now
      const mockOrders = [
        {
          id: 1,
          order_number: 'ORD-001',
          customer_name: 'John Doe',
          customer_email: 'john@example.com',
          total_amount: 89.99,
          status: 'pending',
          created_at: '2025-01-08T10:30:00Z',
          items: [
            { name: 'Organic Apples', quantity: 2, price: 15.99 },
            { name: 'Fresh Spinach', quantity: 1, price: 8.50 }
          ]
        },
        {
          id: 2,
          order_number: 'ORD-002',
          customer_name: 'Jane Smith',
          customer_email: 'jane@example.com',
          total_amount: 45.50,
          status: 'processing',
          created_at: '2025-01-08T09:15:00Z',
          items: [
            { name: 'Organic Bananas', quantity: 3, price: 12.99 }
          ]
        },
        {
          id: 3,
          order_number: 'ORD-003',
          customer_name: 'Bob Johnson',
          customer_email: 'bob@example.com',
          total_amount: 125.75,
          status: 'completed',
          created_at: '2025-01-07T16:45:00Z',
          items: [
            { name: 'Organic Vegetables Pack', quantity: 1, price: 25.99 },
            { name: 'Fresh Herbs', quantity: 2, price: 18.50 }
          ]
        }
      ];
      
      setOrders(mockOrders);
    } catch (error) {
      toast.error('Failed to fetch orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/retailer/orders/${orderId}/status`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status: newStatus })
      // });
      
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      toast.success('Order status updated successfully');
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'processing': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  if (loading) {
    return (
      <>
        <RetailerNavbar />
        <div className="retailer-orders-container">
          <div className="orders-loading">
            <div className="loading-spinner"></div>
            <span>Loading orders...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <RetailerNavbar />
      <div className="retailer-orders-container">
        <div className="orders-header">
          <h1>Orders Management</h1>
          <p>Manage and track your shop's orders</p>
        </div>

        <div className="orders-filters">
          <button 
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All Orders ({orders.length})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('pending')}
          >
            Pending ({orders.filter(o => o.status === 'pending').length})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'processing' ? 'active' : ''}`}
            onClick={() => setFilterStatus('processing')}
          >
            Processing ({orders.filter(o => o.status === 'processing').length})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('completed')}
          >
            Completed ({orders.filter(o => o.status === 'completed').length})
          </button>
        </div>

        <div className="orders-list">
          {filteredOrders.length === 0 ? (
            <div className="no-orders">
              <h3>No orders found</h3>
              <p>No orders match the selected filter.</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>{order.order_number}</h3>
                    <p className="customer-info">
                      {order.customer_name} - {order.customer_email}
                    </p>
                    <p className="order-date">
                      {new Date(order.created_at).toLocaleDateString()} at{' '}
                      {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  
                  <div className="order-meta">
                    <div className="order-total">
                      ${order.total_amount.toFixed(2)}
                    </div>
                    <div 
                      className="order-status"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                  </div>
                </div>

                <div className="order-items">
                  <h4>Items:</h4>
                  <ul>
                    {order.items.map((item, index) => (
                      <li key={index}>
                        {item.quantity}x {item.name} - ${item.price.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="order-actions">
                  {order.status === 'pending' && (
                    <button 
                      className="action-btn processing"
                      onClick={() => updateOrderStatus(order.id, 'processing')}
                    >
                      Start Processing
                    </button>
                  )}
                  {order.status === 'processing' && (
                    <button 
                      className="action-btn completed"
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                    >
                      Mark Complete
                    </button>
                  )}
                  {order.status !== 'cancelled' && order.status !== 'completed' && (
                    <button 
                      className="action-btn cancelled"
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default RetailerOrders;
