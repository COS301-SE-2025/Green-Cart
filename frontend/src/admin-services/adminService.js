// adminService.js (Updated with customers functionality)

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

// ======================= CUSTOMERS DATA PROCESSING =======================
/**
 * Helper function to truncate user ID
 */
const truncateId = (id) => {
    if (!id) return 'unknown';
    const firstHyphenIndex = id.indexOf('-');
    if (firstHyphenIndex === -1) return id;
    return `${id.substring(0, firstHyphenIndex)}-****`;
};

/**
 * Helper function to replace null values with 'unknown'
 */
const replaceNullWithUnknown = (value) => {
    return value === null || value === undefined || value === '' ? 'unknown' : value;
};

/**
 * Mock carbon footprint data (commented as requested)
 */
const getMockCarbonFootprint = () => {
    // Mock data: Generate random carbon footprint between 30-95
    return Math.floor(Math.random() * (95 - 30 + 1)) + 30;
};

/**
 * Mock registration type
 */
const getMockRegistrationType = () => {
    const types = ['Google', 'Email', 'Facebook'];
    return types[Math.floor(Math.random() * types.length)];
};

/**
 * Calculate age from date of birth
 */
const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

/**
 * Check if user is young adult (17-30)
 */
const isYoungAdult = (dateOfBirth) => {
    const age = calculateAge(dateOfBirth);
    return age !== null && age >= 17 && age <= 30;
};

/**
 * Check if created this month
 */
const isCreatedThisMonth = (createdAt) => {
    if (!createdAt) return false;
    const today = new Date();
    const createdDate = new Date(createdAt);
    return (
        createdDate.getMonth() === today.getMonth() &&
        createdDate.getFullYear() === today.getFullYear()
    );
};

/**
 * Calculate percentage change (mock for now - you can implement based on historical data)
 */
/**
 * Calculate real percentage change based on created_at dates
 */
const calculateRealPercentageChange = (data, getUserDate = (item) => item.created_at) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Get previous month and year
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Count items in current month
    const currentMonthCount = data.filter(item => {
        const itemDate = new Date(getUserDate(item));
        return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
    }).length;

    console.log(`Current Month Count: ${currentMonthCount}`);
    
    // Count items in previous month
    const previousMonthCount = data.filter(item => {
        const itemDate = new Date(getUserDate(item));
        return itemDate.getMonth() === previousMonth && itemDate.getFullYear() === previousYear;
    }).length;
    
    console.log(`Previous Month Count: ${previousMonthCount}`);
    // Calculate percentage change
    if (previousMonthCount === 0) {
        
        return currentMonthCount > 0 ? 100 : 0;
    }
    
    return Math.round(((currentMonthCount - previousMonthCount) / previousMonthCount) * 100);
};

/**
 * Get customers page data - Transform API data for customers page
 */
/**
 * Get customers page data - Transform API data for customers page (Updated with real percentage changes)
 */
export const getCustomersPageData = async () => {
    try {
        const [usersResponse, retailersResponse] = await Promise.all([
            getAllUsers(),
            getAllRetailers()
        ]);

        const users = usersResponse.data || [];
        const retailers = retailersResponse.data || [];

        // Create retailer lookup by user_id
        const retailerLookup = retailers.reduce((acc, retailer) => {
            if (retailer.user_id) {
                acc[retailer.user_id] = retailer;
            }
            return acc;
        }, {});

        // Transform users data (existing code remains the same)
        const transformedCustomers = users.map(user => {
            const isRetailer = retailerLookup[user.id];
            const retailerInfo = isRetailer ? retailerLookup[user.id] : null;

            return {
                id: user.id,
                name: replaceNullWithUnknown(user.name),
                userId: truncateId(user.id),
                fullUserId: user.id,
                email: replaceNullWithUnknown(user.email),
                phone: replaceNullWithUnknown(user.telephone),
                contact: replaceNullWithUnknown(user.telephone),
                countryCode: replaceNullWithUnknown(user.country_code),
                dateOfBirth: user.date_of_birth,
                createdAt: user.created_at,
                
                type: isRetailer ? 'Retailer' : 'Customer',
                isRetailer: !!isRetailer,
                
                retailerName: retailerInfo ? replaceNullWithUnknown(retailerInfo.name) : null,
                retailerDescription: retailerInfo ? replaceNullWithUnknown(retailerInfo.description) : null,
                
                registrationDate: new Date(user.created_at).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                }),
                
                accountType: getMockRegistrationType(),
                sustainability: getMockCarbonFootprint(),
                status: 'Accepted',
                avatar: `/api/placeholder/40/40`,
            };
        });

        // Calculate stats
        const totalUsers = users.length;
        const retailersWithUserAccounts = retailers.filter(r => r.user_id);
        const totalRetailers = retailersWithUserAccounts.length;
        const totalCustomers = totalUsers - totalRetailers;

        // South Africa users (country code +27)
        const southAfricaUsers = users.filter(user => user.country_code === '+27').length;

        // Young adults (17-30 years old)
        const youngAdults = users.filter(user => isYoungAdult(user.date_of_birth)).length;

        // Retailers added this month
        const retailersThisMonth = retailersWithUserAccounts.filter(retailer => 
            isCreatedThisMonth(
                users.find(u => u.id === retailer.user_id)?.created_at
            )
        ).length;

        // Calculate REAL percentage changes based on created_at field
        const usersChange = calculateRealPercentageChange(users);
        const customersData = users.filter(user => !retailerLookup[user.id]);
        const customersChange = calculateRealPercentageChange(customersData);
        
        // For retailers, we need to get the user creation dates for retailers with user accounts
        const retailerUsersData = retailersWithUserAccounts.map(retailer => 
            users.find(u => u.id === retailer.user_id)
        ).filter(Boolean);
        const retailersChange = calculateRealPercentageChange(retailerUsersData);

        // Stats data
        const statsData = [
            {
                title: "Total users",
                value: totalUsers.toLocaleString(),
                change: `${usersChange > 0 ? '+' : ''}${usersChange}%`,
                changeType: usersChange >= 0 ? "positive" : "negative",
                period: "last month",
                subtitle: `South Africa: ${southAfricaUsers}`
            },
            {
                title: "Customers",
                value: totalCustomers.toLocaleString(),
                change: `${customersChange > 0 ? '+' : ''}${customersChange}%`,
                changeType: customersChange >= 0 ? "positive" : "negative",
                period: "last month",
                subtitle: `Young Adults: ${youngAdults}`
            },
            {
                title: "Retailers",
                value: totalRetailers.toLocaleString(),
                change: `${retailersChange > 0 ? '+' : ''}${retailersChange}%`,
                changeType: retailersChange >= 0 ? "positive" : "negative",
                period: "last month",
                subtitle: `New This Month: ${retailersThisMonth}`
            }
        ];

        return {
            status: 200,
            data: {
                customers: transformedCustomers,
                stats: statsData,
                totalUsers,
                totalCustomers,
                totalRetailers,
                southAfricaUsers,
                youngAdults,
                retailersThisMonth
            }
        };

    } catch (error) {
        console.error('Error getting customers page data:', error);
        return {
            status: 500,
            message: "Failed to fetch customers data",
            data: {
                customers: [],
                stats: [],
                totalUsers: 0,
                totalCustomers: 0,
                totalRetailers: 0,
                southAfricaUsers: 0,
                youngAdults: 0,
                retailersThisMonth: 0
            }
        };
    }
};

/**
 * Filter customers by type
 */
export const filterCustomersByType = (customers, type) => {
    return customers.filter(customer => customer.type.toLowerCase() === type.toLowerCase());
};

/**
 * Get customers by country code
 */
export const getCustomersByCountry = (customers, countryCode) => {
    return customers.filter(customer => customer.countryCode === countryCode);
};

/**
 * Search customers
 */
export const searchCustomers = (customers, searchTerm) => {
    if (!searchTerm) return customers;
    
    const term = searchTerm.toLowerCase();
    return customers.filter(customer => 
        customer.name.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term) ||
        customer.userId.toLowerCase().includes(term) ||
        (customer.retailerName && customer.retailerName.toLowerCase().includes(term))
    );
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