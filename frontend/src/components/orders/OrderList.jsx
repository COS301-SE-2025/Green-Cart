import React, { useEffect, useState } from 'react';
import OrderCard from './OrderCard';
import { fetchOrderById } from '../../order-services/fetchOrderById';
import '../styles/orders/OrderList.css';

export default function OrderList({ orders, onViewDetails, onCancelOrder, userID }) {
  const [detailedOrders, setDetailedOrders] = useState([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false); // ADDED: Loading state

  useEffect(() => {
    console.log("🔍 useEffect triggered");
    console.log("orders received:", orders);
    console.log("userID received:", userID);

    async function loadDetails() {
      setIsLoadingDetails(true); // ADDED: Set loading to true
      try {
        const enriched = await Promise.all(
          orders.map(async (order) => {
            try {
              const full = await fetchOrderById({ userID, orderID: order.id });
              return {
                ...order,
                total: full.total,
                average_sustainability: full.average_sustainability,
              };
            } catch (error) {
              console.error(`❌ Failed to fetch order ${order.id}`, error);
              return order; // fallback to original
            }
          })
        );

        console.log("✅ Enriched Orders:", enriched);
        setDetailedOrders(enriched);
      } catch (outerError) {
        console.error("❌ Error enriching orders:", outerError);
        setDetailedOrders(orders); // ADDED: Fallback to original orders
      } finally {
        setIsLoadingDetails(false); // ADDED: Set loading to false
      }
    }

    if (orders.length && userID) {
      console.log("🚀 Calling loadDetails...");
      loadDetails();
    } else {
      console.warn("⛔ Skipped loading order details (missing orders or userID)");
      setDetailedOrders(orders); // ADDED: Set orders even if details can't be loaded
      setIsLoadingDetails(false); // ADDED: Ensure loading is false
    }
  }, [orders, userID]);

  if (orders.length === 0) {
    return (
      <div className="orders-empty-state">
        <div className="empty-icon">📦</div>
        <h3>No Orders Found</h3>
        <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
        <button 
          className="btn btn-primary"
          onClick={() => window.location.href = '/Home'}
        >
          Start Shopping
        </button>
      </div>
    );
  }

  // ADDED: Show loading skeleton while loading details
  if (isLoadingDetails && detailedOrders.length === 0) {
    return (
      <div className="orders-list">
        <div className="orders-header">
          <h2>Your Orders ({orders.length})</h2>
          <div className="orders-summary">
            <span>Loading order details...</span>
          </div>
        </div>
        
        <div className="orders-loading-skeleton">
          {[...Array(Math.min(orders.length, 3))].map((_, index) => (
            <div key={index} className="order-card-skeleton">
              <div className="skeleton-header">
                <div className="skeleton-line skeleton-short"></div>
                <div className="skeleton-badge"></div>
              </div>
              <div className="skeleton-body">
                <div className="skeleton-line skeleton-medium"></div>
                <div className="skeleton-line skeleton-long"></div>
              </div>
              <div className="skeleton-actions">
                <div className="skeleton-button"></div>
                <div className="skeleton-button"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="orders-list">
      <div className="orders-header">
        <h2>Your Orders ({orders.length})</h2>
        <div className="orders-summary">
          <span>
            {isLoadingDetails ? 
              "Loading order details..." : 
              "Showing all orders"
            }
          </span>
        </div>
      </div>
      
      <div className="orders-grid">
        {detailedOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onViewDetails={onViewDetails}
            onCancelOrder={onCancelOrder}
          />
        ))}
      </div>
    </div>
  );
}