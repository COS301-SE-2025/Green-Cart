const API_URL = "https://api.greencart-cos301.co.za/orders/cancelOrder";

export const cancelOrder = async (userID, orderID) => {
    try {
        const response = await fetch(API_URL, {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ userID, orderID })
        });


    } catch (error) {
        throw error;
    }
}