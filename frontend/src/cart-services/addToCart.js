const API_URL = "https://api.greencart-cos301.co.za/cart/add";

export const addToCart = async ({user_id, product_id, quantity}) => {
    try {
        const response = await fetch(API_URL+`?user_id=${user_id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                product_id,
                quantity
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};