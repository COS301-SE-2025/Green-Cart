// const API_BASE_URL = `${import.meta.env.VITE_API_URL}/admin`;

import { API_BASE_URL as BASE_URL } from '../config/api.js';

const API_BASE_URL = BASE_URL + '/admin';

/**
 * Consolidated Admin Service
 * Contains all admin-related API calls
 */

// ======================= METRICS =======================
/**
 * Get admin dashboard metrics
 */
export const getAdminMetrics = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/metrics`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Failed to fetch admin metrics");
        }

        return data;
    } catch (error) {
        console.error("Error fetching admin metrics:", error);
        throw error;
    }
};

/**
 * Get orders metrics
 */
export const getOrdersMetrics = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/metrics`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch orders metrics");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching orders metrics:", error);
        throw error;
    }
};

// ======================= PRODUCTS =======================
/**
 * Get all unverified products
 */
export const getUnverifiedProducts = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/unverified`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Failed to fetch unverified products");
        }

        return data;
    } catch (error) {
        console.error("Error fetching unverified products:", error);
        throw error;
    }
};

/**
 * Get a specific unverified product by ID
 */
export const getUnverifiedProduct = async (productId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/unverified/${productId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Failed to fetch unverified product");
        }

        return data;
    } catch (error) {
        console.error("Error fetching unverified product:", error);
        throw error;
    }
};

/**
 * Verify a product by ID
 */
export const verifyProduct = async (productId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}/verify`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Failed to verify product");
        }

        return data;
    } catch (error) {
        console.error("Error verifying product:", error);
        throw error;
    }
};

/**
 * Get the next unverified product for review
 */
export const getNextUnverifiedProduct = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/next-unverified`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Failed to fetch next unverified product");
        }

        return data;
    } catch (error) {
        console.error("Error fetching next unverified product:", error);
        throw error;
    }
};

/**
 * Get all products (for admin overview)
 */
export const getAllProducts = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Failed to fetch all products");
        }

        return data;
    } catch (error) {
        console.error("Error fetching all products:", error);
        throw error;
    }
};

/**
 * Update a product's basic information
 */
export const updateProduct = async (productId, productData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(productData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Failed to update product");
        }

        return data;
    } catch (error) {
        console.error("Error updating product:", error);
        throw error;
    }
};

/**
 * Get sustainability ratings for a product
 */
export const getProductSustainability = async (productId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}/sustainability`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Failed to fetch sustainability data");
        }

        return data;
    } catch (error) {
        console.error("Error fetching sustainability data:", error);
        throw error;
    }
};

// ======================= USERS & RETAILERS =======================
/**
 * Get all users
 */
export const getAllUsers = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Failed to fetch users");
        }

        return data;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
};

/**
 * Get product statistics for admin dashboard
 */
export const getProductStats = async () => {
    try {
        const [allProducts, unverifiedProducts] = await Promise.all([
            getAllProducts(),
            getUnverifiedProducts()
        ]);

        const totalProducts = allProducts.data?.length || 0;
        const unverifiedCount = unverifiedProducts.data?.length || 0;
        const verifiedCount = totalProducts - unverifiedCount;

        // Calculate total value (this would ideally come from a dedicated endpoint)
        const totalValue = allProducts.data?.reduce((sum, product) => {
            return sum + (parseFloat(product.price) || 0);
        }, 0) || 0;

        return {
            status: 200,
            data: {
                totalProducts,
                verifiedCount,
                unverifiedCount,
                totalValue: totalValue.toFixed(2)
            }
        };
    } catch (error) {
        console.error("Error calculating product stats:", error);
        throw error;
    }
};

/**
 * Get all retailers
 */
export const getAllRetailers = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/retailers`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Failed to fetch retailers");
        }

        return data;
    } catch (error) {
        console.error("Error fetching retailers:", error);
        throw error;
    }
};

// ======================= DASHBOARD DATA =======================
/**
 * Fetch all dashboard data in one call
 */
export const getDashboardData = async () => {
    try {
        const [usersRes, retailersRes, productsRes] = await Promise.all([
            getAllUsers(),
            getAllRetailers(),
            getAllProducts()
        ]);

        return {
            users: usersRes,
            retailers: retailersRes,
            products: productsRes
        };
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        throw error;
    }
};

/**
 * Calculate statistics from dashboard data
 */
export const calculateDashboardStats = (dashboardData) => {
    const { users, retailers, products } = dashboardData;
    
    // Extract data arrays
    const usersData = users?.data || [];
    const retailersData = retailers?.data || [];
    const productsData = products?.data || [];
    
    // Filter products
    const verifiedProducts = productsData.filter(product => product.verified);
    const unverifiedProducts = productsData.filter(product => !product.verified);
    
    // Calculate totals
    const totalUsers = usersData.length;
    const totalRetailers = retailersData.length;
    const totalProducts = productsData.length;
    const verifiedCount = verifiedProducts.length;
    const unverifiedCount = unverifiedProducts.length;
    
    // Calculate revenue and units
    const totalRevenue = verifiedProducts.reduce((sum, product) => {
        return sum + (parseFloat(product.price) || 0);
    }, 0);
    
    const totalUnits = verifiedProducts.reduce((sum, product) => {
        return sum + (parseInt(product.quantity) || 0);
    }, 0);
    
    const unverifiedUnits = unverifiedProducts.reduce((sum, product) => {
        return sum + (parseInt(product.quantity) || 0);
    }, 0);
    
    // Calculate out of stock products
    const outOfStock = verifiedProducts.filter(product => !product.in_stock).length;
    
    // MOCKED DATA - Comment: These values need real API endpoints
    const totalRevenueToRetailer = totalRevenue * 0.15; // Mock: 15% commission to platform
    const averageUnitsByRetailer = totalRetailers > 0 ? Math.round(totalUnits / totalRetailers) : 0;
    const averageDeliveryTime = '2.5 days'; // Mock: needs delivery analytics API
    
    // Mock growth rates (needs historical data from API)
    const userGrowthRate = 15.6; // Mock: needs time-series user data
    const retailerGrowthRate = 12.7; // Mock: needs time-series retailer data
    const verifiedProductsGrowthRate = -12.7; // Mock: needs historical verification data
    const unverifiedProductsGrowthRate = -12.7; // Mock: needs historical unverified data
    
    // Mock weekly changes (needs historical data)
    const weeklyUserChange = Math.round(totalUsers * 0.028); // Mock: 2.8% weekly change
    const weeklyRetailerChange = Math.round(totalRetailers * 0.098); // Mock: 9.8% weekly change
    const weeklyVerifiedChange = Math.round(verifiedCount * -0.22); // Mock: -22% weekly change
    const weeklyUnverifiedChange = Math.round(unverifiedCount * -0.22); // Mock: -22% weekly change
    
    return {
        users: {
            total: totalUsers,
            growthRate: userGrowthRate,
            weeklyChange: weeklyUserChange,
            // Additional details
            newThisMonth: Math.round(totalUsers * 0.116), // Mock: needs monthly data
            activeUsers: Math.round(totalUsers * 0.727), // Mock: needs activity tracking
            averageOrderValue: 'R127.50', // Mock: needs order data
            topLocation: 'South Africa', // Mock: needs location analytics
        },
        retailers: {
            total: totalRetailers,
            growthRate: retailerGrowthRate,
            weeklyChange: weeklyRetailerChange,
            // Additional details
            newThisMonth: Math.round(totalRetailers * 0.069), // Mock: needs monthly data
            activeRetailers: Math.round(totalRetailers * 0.744), // Mock: needs activity tracking
            averageDeliveryTime: averageDeliveryTime, // Mock: needs delivery API
            topCategory: 'Electronics', // Mock: needs category analytics
        },
        verifiedProducts: {
            total: verifiedCount,
            growthRate: verifiedProductsGrowthRate,
            weeklyChange: weeklyVerifiedChange,
            // Updated details as requested
            totalRevenue: totalRevenue.toFixed(2),
            totalRevenueToRetailer: totalRevenueToRetailer.toFixed(2), // Mock: needs commission data
            outOfStock: outOfStock,
            totalUnits: totalUnits,
            averageUnitsByRetailer: averageUnitsByRetailer,
            averageVerificationTime: '2.5 days', // Mock: needs verification analytics
        },
        unverifiedProducts: {
            total: unverifiedCount,
            growthRate: unverifiedProductsGrowthRate,
            weeklyChange: weeklyUnverifiedChange,
            // Updated details as requested
            totalUnits: unverifiedUnits,
            rejected: Math.round(unverifiedCount * 0.092), // Mock: needs rejection data
            averageWaitTime: '5.2 days', // Mock: needs review time analytics
            rejectionRate: '8.5%', // Mock: needs rejection analytics
        }
    };
};