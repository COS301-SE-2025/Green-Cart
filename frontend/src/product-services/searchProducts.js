const API_URL = "http://localhost:8000/products/SearchProducts";

export const searchProducts = async ({ apiKey, search, filter, sort, fromItem, count }) => {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                apiKey,
                search,
                filter,
                sort,
                fromItem,
                count
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Fetching product failed");
        }

        return data;
    } catch (error) {
        throw error;
    }
};