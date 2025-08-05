const API_BASE_URL = "https://api.greencart-cos301.co.za/admin";

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
