const API_URL = "https://api.greencart-cos301.co.za/users";

export async function fetchUserInformation(userId){
    try{
        const response = await fetch (API_URL + `/${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        })

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Fetching user information failed");
        }

        return data;

    }catch (error) {
        throw error;
    }

}