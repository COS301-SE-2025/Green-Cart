import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatsOverview from '../components/retailer/StatsOverview';
import ProductCarousel from '../components/retailer/ProductCarousel';
import SalesChart from '../components/retailer/SalesChart';

import './styles/RetailerDashboard.css';

export default function RetailerDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Mock data for development
    const mockDashboardData = {
        stats: {
            totalRevenue: 87450.50,
            totalProductsSold: 1247,
            activeProducts: 156,
            totalOrders: 76
        },
        products: [
            {
                id: 1,
                name: "Eco-Friendly Water Bottle",
                image: "/src/assets/images/product1.jpg",
                price: 29.99,
                stock: 45,
                sold: 234,
                rating: 4.8,
                sustainability: 89
            },
            {
                id: 2,
                name: "Solar-Powered Charger",
                image: "/src/assets/images/product2.jpg",
                price: 75.99,
                stock: 12,
                sold: 167,
                rating: 4.6,
                sustainability: 92
            },
            {
                id: 3,
                name: "Bamboo Kitchen Set",
                image: "/src/assets/images/product3.jpg",
                price: 45.50,
                stock: 28,
                sold: 198,
                rating: 4.9,
                sustainability: 95
            },
            {
                id: 4,
                name: "Organic Cotton T-Shirt",
                image: "/src/assets/images/product4.jpg",
                price: 35.00,
                stock: 67,
                sold: 312,
                rating: 4.5,
                sustainability: 78
            },
            {
                id: 5,
                name: "Recycled Paper Notebook",
                image: "/src/assets/images/product5.jpg",
                price: 12.99,
                stock: 89,
                sold: 445,
                rating: 4.7,
                sustainability: 85
            },
            {
                id: 6,
                name: "Hemp Backpack",
                image: "/src/assets/images/product6.jpg",
                price: 89.99,
                stock: 23,
                sold: 89,
                rating: 4.4,
                sustainability: 88
            }
        ],
        salesData: [
            { month: 'Jan', sales: 12500 },
            { month: 'Feb', sales: 19000 },
            { month: 'Mar', sales: 15600 },
            { month: 'Apr', sales: 23400 },
            { month: 'May', sales: 18900 },
            { month: 'Jun', sales: 26700 }
        ]
    };

    useEffect(() => {
        // Check if user is logged in and is a retailer
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/Login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Simulate API call
        setTimeout(() => {
            setDashboardData(mockDashboardData);
            setLoading(false);
        }, 1000);
    }, [navigate]);

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-error">
                    <h2>Access Denied</h2>
                    <p>You must be logged in as a retailer to access this dashboard.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Retailer Dashboard</h1>
                <p>Welcome back, {user.name || user.email}!</p>

                {/* Add product Button */}
                <div className="add-product">
                    <button className="add-product-button">Add Product</button>
                </div>
                
            </div>

            {/* Stats Overview */}
            <StatsOverview stats={dashboardData.stats} />

            {/* Product Carousel */}
            <ProductCarousel products={dashboardData.products} />

            {/* Sales Chart */}
            <SalesChart salesData={dashboardData.salesData} />
        </div>
    );
}
