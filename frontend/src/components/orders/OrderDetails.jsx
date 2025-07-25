import React, { useEffect, useState } from "react";
import { fetchOrderById } from "../../order-services/fetchOrderById";
import "../styles/orders/OrderDetails.css";

export default function OrderDetails({ isOpen, onClose, order, userID }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && order && userID) {
      setLoading(true);
      console.log("Fetching order details for:", order.id, "user:", userID);

      fetchOrderById({ userID, orderID: order.id })
        .then((data) => {
          console.log("Raw fetched data:", data);

          const combined = data.products.map((product, i) => {
            const price = parseFloat(product.price);
            const image = data.images?.[i] || null;
            const rating = data.rating?.[i] || "N/A";
            const qty = data.quantities?.[i] || 0;

            console.log(`Product ${i} - Price:`, product.price, "Parsed:", price);
            console.log(`Image: ${image} | Quantity: ${qty} | Rating: ${rating}`);

            return {
              ...product,
              image,
              sustainability: rating,
              quantity: qty,
              parsedPrice: price,
              subtotal: price * qty,
            };
          });

          const totalPrice = combined.reduce((sum, p) => sum + p.subtotal, 0);
          const averageSustainability = parseFloat(data.average_sustainability || 0);

          setDetails({
            ...data,
            products: combined,
            total: totalPrice.toFixed(2),
            average_sustainability: averageSustainability.toFixed(2),
          });

          setLoading(false);
        })
        .catch((error) => {
          console.error("Failed to load order details", error);
          setLoading(false);
        });
    }
  }, [isOpen, order, userID]);

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getEstimatedDelivery = (orderDate) => {
    const date = new Date(orderDate);
    date.setDate(date.getDate() + 5);
    return date.toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="order-details-overlay" onClick={onClose}>
      <div className="order-details-container" onClick={(e) => e.stopPropagation()}>
        <button className="order-details-close" onClick={onClose}>×</button>

        {loading ? (
          <div className="order-details-loading">
            <div className="spinner"></div>
            <p>Loading order details...</p>
          </div>
        ) : details ? (
          <>
            <div className="order-section">
              <h3 className="section-title">Item Details</h3>
              <div className="order-product-info">
                {details.products.map((product, idx) => (
                  <div className="order-product-row" key={product.id}>
                    <div className="order-product-img">
                      {product.image ? (
                        <img src={product.image} alt={product.name} />
                      ) : (
                        <div style={{ width: "100px", height: "100px", backgroundColor: "#ccc" }} />
                      )}
                    </div>
                    <div className="order-product-meta">
                      <p className="order-product-name">{product.name}</p>
                      <div className="order-product-grid">
                        <div><span className="label">Quantity:</span> {product.quantity}</div>
                        <div><span className="label">Price:</span> R{product.parsedPrice.toFixed(2)}</div>
                        <div><span className="label">Sustainability:</span> 🌱 {product.sustainability}/100</div>
                        <div><span className="label">Subtotal:</span> R{product.subtotal.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-section">
              <h3 className="section-title">Order Summary</h3>
              <div className="order-summary-grid">
                <div><span className="label">Order Number:</span> #{order.id}</div>
                <div><span className="label">Date:</span> {formatDate(order.created_at)}</div>
                <div><span className="label">Status:</span> <span className="status-tag">{order.state}</span></div>
                <div><span className="label">Total:</span> R{details.total}</div>
                <div><span className="label">Total Sustainability:</span> 🌱 {details.average_sustainability}/100</div>
              </div>
            </div>

            <div className="order-section">
              <h3 className="section-title">Shipment</h3>
              <p><span className="label">Estimated Arrival:</span> {getEstimatedDelivery(order.created_at)}</p>
            </div>

            <button className="order-track-button">Track Order</button>
          </>
        ) : (
          <p className="order-error">Failed to load order details.</p>
        )}
      </div>
    </div>
  );
}
