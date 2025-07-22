import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles/Orders.css";
import { fetchAllOrders } from "../order-services/fetchAllOrders";  
import { cancelOrder } from "../order-services/cancelOrder"; // Assuming you have a cancelOrder function
import { useEffect, useState } from "react";


function useOrders() {
  const [retrievedOrders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userID, setUserID] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = JSON.parse(localStorage.getItem("user"));
    if (!userId) {
      navigate("/login");
      return;
    }
    setUserID(userId.id);

    fetchAllOrders({ userID: userId.id, fromItem: 0, count: 100 })
      .then((data) => {
        setOrders(data.orders);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  const refreshOrders = () => {
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
  const { retrievedOrders: retrievedOrders, loading, error, userID, refreshOrders } = useOrders();

  // if (loading) return <div className="orders-container"><p>Loading...</p></div>;
  if (loading) return (
    <div className="orders-loading-container">
      <div className="orders-loading">
        <div className="loading-spinner"></div>
        <span>Loading your Orders...</span>
      </div>
    </div>
  );

  if (error) return <div className="orders-container"><p>Error: {error.message || error.toString()}</p></div>;

  return (
    <div className="orders-container">
      <h2>My Orders</h2>
      {retrievedOrders.length === 0 ? (
        <p>You have no past orders.</p>
      ) : (
        <ul className="orders-list">
          {retrievedOrders.map((order) => {
            const isCancelled = order.state === 'Cancelled'|| order.state ==='In Transit' || order.state === 'Delivered';
            return (
              <li key={order.id} className="order-item">
                <p><strong>Order ID:</strong> {order.id}</p>
                <p><strong>Status:</strong> {order.state}</p>
                <button
                  className='logout-button'
                  disabled={isCancelled}
                  style={{
                    backgroundColor: isCancelled ? 'grey' : '',
                    cursor: isCancelled ? 'not-allowed' : 'pointer',
                  }}
                  onClick={async () => {
                    if (!isCancelled) {
                      await cancelOrder(userID, order.id);
                      refreshOrders();
                    }
                  }}
                >
                  Cancel
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
