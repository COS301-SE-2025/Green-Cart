import React from 'react';
import OrderCard from './OrderCard';
import '../styles/orders/OrderList.css';

export default function OrderList({ orders, onViewDetails, onCancelOrder }) {
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
                {orders.map((order) => (
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