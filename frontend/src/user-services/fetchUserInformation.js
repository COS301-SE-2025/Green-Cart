const API_URL = "http://localhost:8000/users";

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