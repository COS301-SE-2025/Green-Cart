const API_URL = "http://localhost:8000/auth/signup"; // Adjust if hosted elsewhere

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
