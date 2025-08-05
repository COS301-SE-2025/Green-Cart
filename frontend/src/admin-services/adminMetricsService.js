const API_BASE_URL = "https://api.greencart-cos301.co.za/admin";

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
