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
    }catch (error) {
        throw error;
    }

};