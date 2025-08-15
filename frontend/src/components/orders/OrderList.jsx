import React, { useEffect, useState } from 'react';
import OrderCard from './OrderCard';
import { fetchOrderById } from '../../order-services/fetchOrderById';
import '../styles/orders/OrderList.css';

export default function OrderList({ orders, onViewDetails, onCancelOrder, userID }) {
  const [detailedOrders, setDetailedOrders] = useState([]);

  useEffect(() => {
    console.log("🔍 useEffect triggered");
    console.log("orders received:", orders);
    console.log("userID received:", userID);

    async function loadDetails() {
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
      }
    }

    if (orders.length && userID) {
      console.log("🚀 Calling loadDetails...");
      loadDetails();
    } else {
      console.warn("⛔ Skipped loading order details (missing orders or userID)");
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

  return (
    <div className="orders-list">
      <div className="orders-header">
        <h2>Your Orders ({orders.length})</h2>
        <div className="orders-summary">
          <span>Showing all orders</span>
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
