const API_URL = "http://localhost:8000/products/FetchAllProducts";

export const fetchAllProducts = async ({ apiKey, filter, sort, fromItem, count }) => {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                apiKey,
                fromItem,
                count
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Fetching products failed");
        }

        return data;
    } catch (error) {
        throw error;
    }
};