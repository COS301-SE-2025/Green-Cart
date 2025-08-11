const API_URL = "http://localhost:8000/cart";

export const viewCart =  async ({user_id}) => {
    try{
        const response = await fetch(API_URL + `/${user_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Fetching cart failed");
        }

        return data;

    }catch (error) {
        throw error;
    }
}