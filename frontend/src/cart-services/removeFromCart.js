const API_URL = "https://api.greencart-cos301.co.za/cart/remove";

export const removeFromCart = async ({ user_id, product_id }) => {
    try {
        const response = await fetch(API_URL+`?user_id=${user_id}&product_id=${product_id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            
        });
        if (!response.ok) {
            throw new Error("Failed to remove item from cart");
        }
    } catch (error) {
        console.error("Error removing from cart:", error);
    }
};