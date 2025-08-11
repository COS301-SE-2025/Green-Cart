const API_URL = "http://localhost:8000/products/FetchProduct";

export const fetchProduct = async ({ product_id }) => {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                product_id
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