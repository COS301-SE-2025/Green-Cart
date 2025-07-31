const API_URL = "https://api.greencart-cos301.co.za/products/FetchAllProducts";

export const fetchAllProducts = async ({filter, sort, fromItem, count }) => {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                filter,
                sort,
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