import { API_BASE_URL } from "../config/api.js";

export async function checkUserExists(email) {
  const response = await fetch(`${API_BASE_URL}/auth/check-user/${encodeURIComponent(email)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to check user");
  }

  return response.json();
}