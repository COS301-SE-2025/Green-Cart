const API_URL = "http://localhost:8000/cart/add";

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