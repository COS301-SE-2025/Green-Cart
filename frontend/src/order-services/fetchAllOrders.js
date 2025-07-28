import axios from "axios";

export const fetchAllOrders = async ({ userID }) => {
  try {
    const response = await axios.post("http://localhost:8000/orders/getAllOrders", {
      userID,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all orders:", error);
    throw error;
  }
};
