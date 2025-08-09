const API_URL = "https://api.greencart-cos301.co.za/auth/signup";

export const signup = async ({ name, email, password }) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Signup failed");
    }

    return data;
  } catch (error) {
    throw error;
  }
};
