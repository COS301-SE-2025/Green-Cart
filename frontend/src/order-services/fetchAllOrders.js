const API_URL = "http://localhost:8000/orders/getAllOrders";

export const fetchAllOrders = async ({userID, fromItem, count}) => {
    try{
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userID,
                fromItem,
                count
            })
        })

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch orders');
        }
        return data;

    }catch (error) {
        throw error;
    }
    
}