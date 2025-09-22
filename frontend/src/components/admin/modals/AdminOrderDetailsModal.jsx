import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import '../../styles/admin/modals/AdminOrderDetailsModal.css';

const AdminOrderDetailsModal = ({ 
  isOpen, 
  onClose, 
  order, 
  onUpdateOrderState 
}) => {
  const [selectedState, setSelectedState] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);

  // FIXED: Update selectedState when order changes
  useEffect(() => {
    if (order?.status) {
      setSelectedState(order.status);
    }
  }, [order]);

  // Order states based on your backend enum
  const orderStates = [
    'Preparing Order',
    'Ready for Delivery', 
    'In Transit',
    'Delivered',
    'Cancelled'
  ];

  // Map display states to backend states
  const stateMapping = {
    'Pending': 'Preparing Order',
    'Shipping': 'In Transit',
    'Delivered': 'Delivered',
    'Returned': 'Cancelled',
    'Canceled': 'Cancelled'
  };

  // Get the backend state from display state
  const getBackendState = (displayState) => {
    return stateMapping[displayState] || displayState;
  };

  // Get color for order state
  const getStateColor = (state) => {
    const colors = {
      'Preparing Order': '#f59e0b',
      'Ready for Delivery': '#3b82f6', 
      'In Transit': '#8b5cf6',
      'Delivered': '#10b981',
      'Cancelled': '#ef4444',
      'Pending': '#f59e0b',
      'Shipping': '#8b5cf6',
      'Returned': '#ef4444',
      'Canceled': '#ef4444'
    };
    return colors[state] || '#6b7280';
  };

  // Get state icon
  const getStateIcon = (state) => {
    const icons = {
      'Preparing Order': '🔄',
      'Ready for Delivery': '📦',
      'In Transit': '🚚',
      'Delivered': '✅',
      'Cancelled': '❌',
      'Pending': '⏳',
      'Shipping': '🚚',
      'Returned': '↩️',
      'Canceled': '❌'
    };
    return icons[state] || '📋';
  };

  const handleUpdateState = async () => {
    if (!selectedState || selectedState === order.status) {
      toast.error('Please select a different state');
      return;
    }

    setIsUpdating(true);
    try {
      // Convert display state to backend state if needed
      const backendState = getBackendState(selectedState);
      
      await onUpdateOrderState(order.orderId, backendState);
      toast.success(`Order state updated to ${selectedState}`);
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to update order state');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    // FIXED: Reset selectedState when closing
    setSelectedState('');
    setShowStateDropdown(false);
    onClose();
  };

  if (!isOpen || !order) return null;

  return (
    <div className="admin-order-modal-overlay" onClick={handleClose}>
      <div className="admin-order-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-order-modal-header">
          <div className="order-modal-title-section">
            <h2>Order Details</h2>
            <span className="order-modal-id">{order.orderId}</span>
          </div>
          <button className="order-modal-close" onClick={handleClose}>×</button>
        </div>

        <div className="admin-order-modal-body">
          {/* Order Summary */}
          <div className="order-modal-section">
            <h3 className="order-modal-section-title">Order Information</h3>
            <div className="order-modal-info-grid">
              <div className="order-modal-info-item">
                <span className="order-modal-label">Order ID:</span>
                <span className="order-modal-value">{order.orderId}</span>
              </div>
              <div className="order-modal-info-item">
                <span className="order-modal-label">Customer:</span>
                <span className="order-modal-value">{order.customer}</span>
              </div>
              <div className="order-modal-info-item">
                <span className="order-modal-label">Order Date:</span>
                <span className="order-modal-value">{order.date}</span>
              </div>
              <div className="order-modal-info-item">
                <span className="order-modal-label">Delivery Address:</span>
                <span className="order-modal-value">{order.address}</span>
              </div>
              <div className="order-modal-info-item">
                <span className="order-modal-label">Current Status:</span>
                <span 
                  className="order-modal-status-badge"
                  style={{ 
                    backgroundColor: getStateColor(order.status),
                    color: 'white'
                  }}
                >
                  {getStateIcon(order.status)} {order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items (Mock data - replace with actual items) */}
          <div className="order-modal-section">
            <h3 className="order-modal-section-title">Order Items</h3>
            <div className="order-modal-items">
              <div className="order-modal-item">
                <div className="order-item-info">
                  <span className="order-item-name">Organic Vegetables Pack</span>
                  <span className="order-item-details">Quantity: 2 × R25.99</span>
                </div>
                <span className="order-item-total">R51.98</span>
              </div>
              <div className="order-modal-item">
                <div className="order-item-info">
                  <span className="order-item-name">Fresh Fruits Bundle</span>
                  <span className="order-item-details">Quantity: 1 × R45.50</span>
                </div>
                <span className="order-item-total">R45.50</span>
              </div>
              <div className="order-modal-total">
                <span className="order-total-label">Total Amount:</span>
                <span className="order-total-value">R97.48</span>
              </div>
            </div>
          </div>

          {/* Order State Management */}
          <div className="order-modal-section">
            <h3 className="order-modal-section-title">Update Order Status</h3>
            <div className="order-state-controls">
              <div className="order-state-selector">
                <label className="order-state-label">New Status:</label>
                <div className="order-state-dropdown-container">
                  <button 
                    className="order-state-dropdown-btn"
                    onClick={() => setShowStateDropdown(!showStateDropdown)}
                  >
                    <span className="selected-state">
                      {getStateIcon(selectedState)} {selectedState}
                    </span>
                    <svg 
                      className={`dropdown-arrow ${showStateDropdown ? 'open' : ''}`}
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none"
                    >
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                  
                  {showStateDropdown && (
                    <div className="order-state-dropdown-menu">
                      {orderStates.map((state) => (
                        <button
                          key={state}
                          className={`order-state-option ${selectedState === state ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedState(state);
                            setShowStateDropdown(false);
                          }}
                        >
                          {getStateIcon(state)} {state}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="order-state-actions">
                <button 
                  className="order-state-cancel-btn"
                  onClick={handleClose}
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button 
                  className="order-state-update-btn"
                  onClick={handleUpdateState}
                  disabled={isUpdating || selectedState === order.status}
                >
                  {isUpdating ? (
                    <>
                      <div className="order-loading-spinner"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Status'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Order Timeline (Optional) */}
          <div className="order-modal-section">
            <h3 className="order-modal-section-title">Order Timeline</h3>
            <div className="order-timeline">
              <div className="timeline-item completed">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <span className="timeline-title">Order Placed</span>
                  <span className="timeline-date">{order.date}</span>
                </div>
              </div>
              <div className={`timeline-item ${['Preparing Order', 'Ready for Delivery', 'In Transit', 'Delivered'].includes(order.status) ? 'completed' : ''}`}>
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <span className="timeline-title">Order Confirmed</span>
                  <span className="timeline-date">Processing...</span>
                </div>
              </div>
              <div className={`timeline-item ${['In Transit', 'Delivered'].includes(order.status) ? 'completed' : ''}`}>
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <span className="timeline-title">In Transit</span>
                  <span className="timeline-date">
                    {order.status === 'In Transit' ? 'En route' : 'Pending'}
                  </span>
                </div>
              </div>
              <div className={`timeline-item ${order.status === 'Delivered' ? 'completed' : ''}`}>
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <span className="timeline-title">Delivered</span>
                  <span className="timeline-date">
                    {order.status === 'Delivered' ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailsModal;