import React, { useState, useEffect } from 'react';
import '../styles/retailer/StatsOverview.css';


const useCountAnimation = (targetValue, duration = 2000, delay = 0) => {
    const [currentValue, setCurrentValue] = useState(0);

    useEffect(() => {
        let startTime;
        let animationFrame;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp + delay;

            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);

            setCurrentValue(Math.floor(targetValue * easeOut));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                setCurrentValue(targetValue);
            }
        };

        const timeoutId = setTimeout(() => {
            animationFrame = requestAnimationFrame(animate);
        }, delay);

        return () => {
            clearTimeout(timeoutId);
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [targetValue, duration, delay]);

    return currentValue;
};

// Component for animated stat value
const AnimatedStatValue = ({ value, isRevenue, delay = 0 }) => {
    const numericValue = typeof value === 'string' ?
        parseFloat(value.replace(/[^\d.-]/g, '')) : value;

    const animatedValue = useCountAnimation(numericValue, 2000, delay);

    if (isRevenue) {
        return animatedValue.toLocaleString("en-ZA", {
            style: "currency",
            currency: "ZAR"
        });
    }

    return animatedValue.toLocaleString();
};

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
            key: 'averageSustainabilityRating',
            title: 'Avg Sustainability',
            value: stats.avgSustainability,
            icon: '📋',
            color: '#8b5cf6'
        }

    ];

    return (
        <div className="stats-overview">
            <h2 className="stats-overview-title">Overview</h2>
            <div className="stats-overview-stats-grid">
                {statItems.map((item) => (
                    <div key={item.key} className="stats-overview-stat-card">
                        <div
                            className="stats-overview-stat-icon"
                            style={{ backgroundColor: item.color }}
                        >
                            {item.icon}
                        </div>
                        <div className="stats-overview-stat-content">
                            <h3>{item.title}</h3>
                            <div className="stats-overview-stat-value">
                                <AnimatedStatValue
                                    value={item.value}
                                    isRevenue={item.isRevenue}
                                    delay={item.delay}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}