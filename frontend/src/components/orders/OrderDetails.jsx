import React, { useState, useEffect } from 'react';
import { fetchOrderById } from '../../order-services/fetchOrderById';
import '../styles/orders/OrderDetails.css';

export default function OrderDetails({ isOpen, onClose, order, userID }) {
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && order) {
            setLoading(true);
            setError(null);
            
            fetchOrderById({ 
                userID, 
                orderID: order.id, 
                fromItem: 0, 
                count: 10 
            })
            .then((data) => {
                setOrderDetails(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err);
                setLoading(false);
            });
        }
    }, [isOpen, order, userID]);

    if (!isOpen) return null;

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending': return '#f59e0b';
            case 'confirmed': return '#3b82f6';
            case 'in transit': return '#8b5cf6';
            case 'delivered': return '#22c55e';
            case 'cancelled': return '#ef4444';
            default: return '#64748b';
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content order-details-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="order-header-info">
                        <h2>Order #{order.id}</h2>
                        <div 
                            className="order-status-badge large"
                            style={{ backgroundColor: getStatusColor(order.state) }}
                        >
                            {order.state}
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose} aria-label="Close modal">
                        ✕
                    </button>
                </div>

                <div className="order-details-content">
                    {loading ? (
                        <div className="loading-section">
                            <div className="loading-spinner"></div>
                            <span>Loading order details...</span>
                        </div>
                    ) : error ? (
                        <div className="error-section">
                            <p>Error loading order details: {error.message}</p>
                        </div>
                    ) : orderDetails ? (
                        <>
                            {/* Order Summary */}
                            <div className="order-summary-section">
                                <h3>Order Summary</h3>
                                <div className="order-info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Order Date:</span>
                                        <span className="info-value">
                                            {new Date(order.created_at).toLocaleDateString('en-ZA', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Cart ID:</span>
                                        <span className="info-value">#{order.cart_id}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Total Items:</span>
                                        <span className="info-value">{orderDetails.products?.length || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Products */}
                            <div className="order-products-section">
                                <h3>Products ({orderDetails.products?.length || 0})</h3>
                                <div className="products-list">
                                    {orderDetails.products?.map((product, index) => (
                                        <div key={product.id} className="product-item">
                                            <div className="product-image">
                                                <img 
                                                    src={orderDetails.images?.[index] || '/placeholder-image.jpg'} 
                                                    alt={product.name}
                                                    onError={(e) => {
                                                        e.target.src = '/placeholder-image.jpg';
                                                    }}
                                                />
                                            </div>
                                            <div className="product-info">
                                                <h4 className="product-name">{product.name}</h4>
                                                <p className="product-brand">{product.brand || 'Unknown Brand'}</p>
                                                <div className="product-sustainability">
                                                    <span className="sustainability-badge small">
                                                        🌱 {Math.floor(orderDetails.rating?.[index] || 75)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="product-details">
                                                <div className="product-quantity">
                                                    Qty: {orderDetails.quantities?.[index] || 1}
                                                </div>
                                                <div className="product-price">
                                                    {Number(product.price).toLocaleString("en-ZA", {
                                                        style: "currency",
                                                        currency: "ZAR"
                                                    })}
                                                </div>
                                                <div className="product-total">
                                                    Total: {(Number(product.price) * (orderDetails.quantities?.[index] || 1)).toLocaleString("en-ZA", {
                                                        style: "currency",
                                                        currency: "ZAR"
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Total */}
                            <div className="order-total-section">
                                <div className="total-calculation">
                                    <div className="total-row">
                                        <span>Subtotal:</span>
                                        <span>
                                            {orderDetails.products?.reduce((sum, product, index) => 
                                                sum + (Number(product.price) * (orderDetails.quantities?.[index] || 1)), 0
                                            ).toLocaleString("en-ZA", {
                                                style: "currency",
                                                currency: "ZAR"
                                            })}
                                        </span>
                                    </div>
                                    <div className="total-row">
                                        <span>Shipping:</span>
                                        <span>R 73.99</span>
                                    </div>
                                    <div className="total-row final-total">
                                        <span>Total:</span>
                                        <span>
                                            {(orderDetails.products?.reduce((sum, product, index) => 
                                                sum + (Number(product.price) * (orderDetails.quantities?.[index] || 1)), 0
                                            ) + 73.99).toLocaleString("en-ZA", {
                                                style: "currency",
                                                currency: "ZAR"
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="no-details">
                            <p>No order details available.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}