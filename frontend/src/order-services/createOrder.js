const API_URL = "https://api.greencart-cos301.co.za/orders/createOrder";

export const createOrder = async ({ userID, cartID }) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userID,
                cartID
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to create order');
        }
        return data;

    } catch (error) {
        throw error;
    }
}