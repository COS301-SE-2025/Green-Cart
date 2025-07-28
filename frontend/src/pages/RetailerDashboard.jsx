import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatsOverview from '../components/retailer/StatsOverview';
import ProductCarousel from '../components/retailer/ProductCarousel';
import SalesChart from '../components/retailer/SalesChart';
import AddProduct from '../components/retailer/AddProduct';
import EditProduct from '../components/retailer/EditProduct';

import './styles/RetailerDashboard.css';

export default function RetailerDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/Login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        const fetchDashboardData = async () => {
            try {
                const retailerId = 3; // 🔁 Use parsedUser.id when backend supports dynamic users

                const metricsRes = await fetch(`http://localhost:8000/retailer/metrics/${retailerId}`);
                const productsRes = await fetch(`http://localhost:8000/retailer/products/${retailerId}`);

                const [metricsJson, productsJson] = await Promise.all([
                    metricsRes.json(),
                    productsRes.json()
                ]);

                if (metricsJson.status === 200 && productsJson.status === 200) {
                    const metrics = metricsJson.data;
                    const transformedData = {
                        stats: {
                            totalRevenue: metrics.total_revenue,
                            totalProductsSold: metrics.total_units_sold,
                            activeProducts: metrics.total_products,
                            totalOrders: 0,
                            avgSustainability: metrics.avg_sustainability_rating,
                            availability: metrics.availability
                        },
                        products: productsJson.data,
                        salesData: metrics.monthly_revenue.map(m => ({
                            month: m.month,
                            sales: m.revenue
                        }))
                    };

                    setDashboardData(transformedData);
                } else {
                    console.error("Failed to load dashboard data");
                }
            } catch (err) {
                console.error("API Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    const handleOpenAddProduct = () => setIsAddProductModalOpen(true);
    const handleCloseAddProduct = () => setIsAddProductModalOpen(false);

    const handleProductAdded = (newProduct) => {
        setDashboardData(prev => ({
            ...prev,
            products: [newProduct, ...prev.products],
            stats: {
                ...prev.stats,
                activeProducts: prev.stats.activeProducts + 1
            }
        }));
    };

    const handleEditProduct = (product) => {
        setSelectedProduct(product);
        setIsEditProductModalOpen(true);
    };

    const handleCloseEditProduct = () => {
        setIsEditProductModalOpen(false);
        setSelectedProduct(null);
    };

    const handleProductUpdated = (updatedProduct) => {
        setDashboardData(prev => ({
            ...prev,
            products: prev.products.map(product =>
                product.id === updatedProduct.id ? updatedProduct : product
            )
        }));
    };

    if (loading) {
        return (
            <div className="dashboard-loading-container">
                <div className="dashboard-loading">
                    <div className="loading-spinner"></div>
                    <span>Loading Dashboard...</span>
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

                <div className="add-product">
                    <button
                        className="add-product-button"
                        onClick={handleOpenAddProduct}
                    >
                        Add Product
                    </button>
                    <button
                        className="add-product-button"
                        style={{ marginLeft: '1rem' }}
                        onClick={() => navigate('/retailer/products')}
                    >
                        View All Products
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <StatsOverview stats={dashboardData.stats} />

            {/* Product Carousel */}
            <ProductCarousel
                products={dashboardData.products}
                onEditProduct={handleEditProduct}
            />

            {/* Sales Chart */}
            <SalesChart salesData={dashboardData.salesData} />

            {/* Add Product Modal */}
            <AddProduct
                isOpen={isAddProductModalOpen}
                onClose={handleCloseAddProduct}
                onProductAdded={handleProductAdded}
            />

            {/* Edit Product Modal */}
            <EditProduct
                isOpen={isEditProductModalOpen}
                onClose={handleCloseEditProduct}
                onProductUpdated={handleProductUpdated}
                product={selectedProduct}
            />
        </div>
    );
}
