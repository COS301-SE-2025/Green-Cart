import React from 'react';
import '../styles/orders/OrderCard.css';

export default function OrderCard({ order, onViewDetails, onCancelOrder }) {
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return '#f59e0b';
            case 'confirmed':
                return '#3b82f6';
            case 'in transit':
                return '#8b5cf6';
            case 'delivered':
                return '#22c55e';
            case 'cancelled':
                return '#ef4444';
            default:
                return '#64748b';
        }
    };

    const getSustainabilityColor = (rating) => {
        if (rating >= 70) return '#22c55e';
        if (rating >= 50) return '#eab308';
        return '#f97316';
    };

    const canCancel = !['cancelled', 'delivered', 'in transit'].includes(order.state.toLowerCase());
    const formattedDate = new Date(order.created_at).toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    // Mock data - in real app, this would come from the order data
    const mockPrice = Math.floor(Math.random() * 2000) + 100;
    const mockSustainability = Math.floor(Math.random() * 40) + 60;

    return (
        <div className="order-card">
            <div className="order-card-header">
                <div className="order-id-section">
                    <span className="order-id">#{order.id}</span>
                    <span className="order-date">{formattedDate}</span>
                </div>
                <div 
                    className="order-status-badge"
                    style={{ backgroundColor: getStatusColor(order.state) }}
                >
                    {order.state}
                </div>
            </div>

            <div className="order-card-body">
                <div className="order-price">
                    {mockPrice.toLocaleString("en-ZA", {
                        style: "currency",
                        currency: "ZAR"
                    })}
                </div>
                
                <div className="order-sustainability">
                    <div 
                        className="sustainability-order-badge"
                        style={{ backgroundColor: getSustainabilityColor(mockSustainability) }}
                    >
                        <span className="sustainability-icon">🌱</span>
                        <span className="sustainability-score">{mockSustainability}</span>
                    </div>
                </div>
            </div>

            <div className="order-card-actions">
                <button 
                    className="btn btn-view"
                    onClick={() => onViewDetails(order)}
                >
                    View Details
                </button>
                <button 
                    className={`btn btn-cancel ${!canCancel ? 'disabled' : ''}`}
                    disabled={!canCancel}
                    onClick={() => onCancelOrder(order)}
                >
                    {canCancel ? 'Cancel Order' : 'Cannot Cancel'}
                </button>
            </div>
        </div>
    );
}