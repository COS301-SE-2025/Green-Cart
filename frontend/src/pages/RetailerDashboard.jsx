import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RetailerNavbar from '../components/RetailerNavbar';
import StatsOverview from '../components/retailer/StatsOverview';
import ProductCarousel from '../components/retailer/ProductCarousel';
import SalesChart from '../components/retailer/SalesChart';
import AddProduct from '../components/retailer/AddProduct';
import EditProduct from '../components/retailer/EditProduct';
import { getRetailerUser, isRetailerAuthenticated } from '../user-services/retailerAuthService';

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
        const loadDashboard = async () => {
            setLoading(true);
            
            try {
                // Step 1: Get authenticated user data
                const retailerData = localStorage.getItem('retailer_user');
                let currentUser = null;
                
                if (retailerData) {
                    currentUser = JSON.parse(retailerData);
                    console.log("Found retailer user in localStorage:", currentUser);
                } else {
                    // Fallback to regular user authentication
                    const userData = localStorage.getItem('userData');
                    if (!userData) {
                        console.log("No user data found, redirecting to login");
                        navigate('/Login');
                        return;
                    }
                    currentUser = JSON.parse(userData);
                    console.log("Using regular user data:", currentUser);
                }

                setUser(currentUser);

                // Step 2: Determine retailer ID
                let retailerId = null;
                
                // Try to get retailer_id from the user data first
                if (currentUser.retailer_id) {
                    retailerId = currentUser.retailer_id;
                    console.log("Found retailer_id in user data:", retailerId);
                } else if (currentUser.id && typeof currentUser.id === 'number') {
                    // If the user data contains a numeric ID, it might be the retailer ID
                    retailerId = currentUser.id;
                    console.log("Using numeric user ID as retailer_id:", retailerId);
                } else if (currentUser.shops && currentUser.shops.length > 0) {
                    // If there are shops, use the first shop's ID
                    retailerId = currentUser.shops[0].id;
                    console.log("Using first shop ID as retailer_id:", retailerId);
                } else if (currentUser.user_id || currentUser.id) {
                    // Try to fetch retailer ID using user_id
                    const userId = currentUser.user_id || currentUser.id;
                    console.log("Attempting to fetch retailer by user_id:", userId);
                    
                    try {
                        const response = await fetch(`http://localhost:8000/retailer/by-user/${userId}`);
                        if (response.ok) {
                            const data = await response.json();
                            if (data.data && data.data.id) {
                                retailerId = data.data.id;
                                console.log("Fetched retailer_id from API:", retailerId);
                                
                                // Update localStorage with the retailer_id
                                const updatedUser = { ...currentUser, retailer_id: retailerId };
                                localStorage.setItem('retailer_user', JSON.stringify(updatedUser));
                                setUser(updatedUser);
                            }
                        }
                    } catch (error) {
                        console.error("Error fetching retailer by user_id:", error);
                    }
                }

                // Step 3: If we still don't have retailer_id, show error
                if (!retailerId) {
                    console.error("Could not determine retailer ID");
                    setDashboardData(null);
                    setLoading(false);
                    return;
                }
              
                const metricsRes = await fetch(`https://api.greencart-cos301.co.za/retailer/metrics/${retailerId}`);
                const productsRes = await fetch(`https://api.greencart-cos301.co.za/retailer/products/${retailerId}`);
                console.log("Final retailer ID:", retailerId);

                // Step 4: Fetch dashboard data
                const [metricsResponse, productsResponse] = await Promise.all([
                    fetch(`http://localhost:8000/retailer/metrics/${retailerId}`),
                    fetch(`http://localhost:8000/retailer/products/${retailerId}`)
                ]);

                console.log("API Response Status:", {
                    metrics: metricsResponse.status,
                    products: productsResponse.status
                });

                const [metricsData, productsData] = await Promise.all([
                    metricsResponse.json(),
                    productsResponse.json()
                ]);

                console.log("API Response Data:", { metricsData, productsData });

                // Step 5: Transform and set dashboard data
                const metrics = metricsData.data || {};
                const products = productsData.data || [];

                const dashboardData = {
                    stats: {
                        totalRevenue: metrics.total_revenue || 0,
                        totalProductsSold: metrics.total_units_sold || 0,
                        activeProducts: metrics.total_products || 0,
                        totalOrders: 0,
                        avgSustainability: metrics.avg_sustainability_rating || 0,
                        availability: metrics.availability || 0
                    },
                    products: products,
                    salesData: (metrics.monthly_revenue || []).map(m => ({
                        month: m.month,
                        sales: m.revenue
                    }))
                };

                console.log("Final dashboard data:", dashboardData);
                setDashboardData(dashboardData);

            } catch (error) {
                console.error("Dashboard loading error:", error);
                // Set empty data instead of null to prevent error screen
                setDashboardData({
                    stats: {
                        totalRevenue: 0,
                        totalProductsSold: 0,
                        activeProducts: 0,
                        totalOrders: 0,
                        avgSustainability: 0,
                        availability: 0
                    },
                    products: [],
                    salesData: []
                });
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
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

    if (!dashboardData) {
        return (
            <>
                <RetailerNavbar />
                <div className="dashboard-container">
                    <div className="dashboard-error">
                        <h2>Unable to Load Dashboard</h2>
                        <p>Could not determine the retailer account for this user.</p>
                        <p>Please ensure you are logged in with a valid retailer account.</p>
                        <div style={{ marginTop: '1rem' }}>
                            <button 
                                onClick={() => navigate('/retailer-auth')} 
                                style={{ 
                                    marginRight: '1rem', 
                                    padding: '0.5rem 1rem', 
                                    backgroundColor: '#4CAF50', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '4px', 
                                    cursor: 'pointer' 
                                }}
                            >
                                Go to Login
                            </button>
                            <button 
                                onClick={() => window.location.reload()} 
                                style={{ 
                                    padding: '0.5rem 1rem', 
                                    backgroundColor: '#2196F3', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '4px', 
                                    cursor: 'pointer' 
                                }}
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <RetailerNavbar />
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h1>Dashboard</h1>
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
        </>
    );
}
