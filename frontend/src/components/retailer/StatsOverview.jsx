import React from 'react';
import '../styles/retailer/StatsOverview.css';

export default function StatsOverview({ stats }) {
    const statItems = [
        {
            key: 'totalRevenue',
            title: 'Total Revenue',
            value: stats.totalRevenue.toLocaleString("en-ZA", {
                style: "currency",
                currency: "ZAR"
            }),
            icon: '💰',
            color: '#22c55e'
        },
        {
            key: 'totalProductsSold',
            title: 'Products Sold',
            value: stats.totalProductsSold.toLocaleString(),
            icon: '📦',
            color: '#3b82f6'
        },
        {
            key: 'activeProducts',
            title: 'Active Products',
            value: stats.activeProducts,
            icon: '🛍️',
            color: '#f59e0b'
        },
        {
            key: 'totalOrders',
            title: 'Total Orders',
            value: stats.totalOrders,
            icon: '📋',
            color: '#8b5cf6'
        }
    ];

    return (
        <div className="stats-overview">
            <h2 className="stats-title">Overview</h2>
            <div className="stats-grid">
                {statItems.map((item) => (
                    <div key={item.key} className="stat-card">
                        <div 
                            className="stat-icon"
                            style={{ backgroundColor: item.color }}
                        >
                            {item.icon}
                        </div>
                        <div className="stat-content">
                            <h3>{item.title}</h3>
                            <div className="stat-value">{item.value}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}