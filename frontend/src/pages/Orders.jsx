import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/Orders.css";
import { fetchAllOrders } from "../order-services/fetchAllOrders";  
import { cancelOrder } from "../order-services/cancelOrder"; // Assuming you have a cancelOrder function
import  toast  from "react-hot-toast";
import OrderList from "../components/orders/OrderList";
import OrderDetails from "../components/orders/OrderDetails";
import ConfirmationModal from "../components/modals/ConfirmationModal";
import { useConfirmation } from "../hooks/useConfirmation";

function useOrders() {
  const [retrievedOrders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userID, setUserID] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate("/login");
      return;
    }
    setUserID(user.id);

    fetchAllOrders({ userID: user.id, fromItem: 0, count: 100 })
      .then((data) => {
        setOrders(data.orders);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [navigate]);

  const refreshOrders = () => {
    if (!userID) return;

    setLoading(true);
    fetchAllOrders({ userID, fromItem: 0, count: 100 })
      .then((data) => {
        setOrders(data.orders);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  };

  return { retrievedOrders, loading, error, userID, refreshOrders };
}

export default function Orders() {
  const { retrievedOrders, loading, error, userID, refreshOrders } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const { confirmationState, showConfirmation } = useConfirmation();

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsOrderDetailsOpen(false);
    setSelectedOrder(null);
  };

  const handleCancelOrder = async (order) => {
    const canCancel = !['cancelled', 'delivered', 'in transit'].includes(order.state.toLowerCase());

    if (!canCancel) {
      toast.error('This order cannot be cancelled.', {
        duration: 5000,
      });
      return;
    }

    const confirmed = await showConfirmation({
      title: 'Cancel Order',
      message: `Are you sure you want to cancel order #${order.id}? This action cannot be undone and any payment will be refunded within 3-5 business days.`,
      confirmText: 'Yes, Cancel Order',
      cancelText: 'Keep Order',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      await cancelOrder(userID, order.id);
      toast.success('Order cancelled successfully!', {
        duration: 5000,
      });
      await refreshOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order. Please try again or contact support.', {
        duration: 5000,
      });
    }
  };

  if (loading) {
    return (
      <div className="orders-loading-container">
        <div className="orders-loading">
          <div className="loading-spinner"></div>
          <span>Loading your Orders...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-container">
        <div className="orders-error">
          <h2>Error Loading Orders</h2>
          <p>{error.message || 'Something went wrong while loading your orders.'}</p>
          <button className="btn btn-primary" onClick={refreshOrders}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header-section">
        <h1>My Orders</h1>
        <p>Track and manage all your orders in one place</p>
      </div>

      <OrderList
        orders={retrievedOrders}
        userID={userID}
        onViewDetails={handleViewDetails}
        onCancelOrder={handleCancelOrder}
      />

      <OrderDetails
        isOpen={isOrderDetailsOpen}
        onClose={handleCloseDetails}
        order={selectedOrder}
        userID={userID}
      /> 

      {/* Our custom Confirmation Modal */}
      <ConfirmationModal {...confirmationState} />
    </div>
  );
}
