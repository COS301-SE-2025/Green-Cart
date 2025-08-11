import axios from "axios";

export const fetchAllOrders = async ({ userID }) => {
  try {
    const response = await axios.post("https://api.greencart-cos301.co.za/orders/getAllOrders", {
      userID,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all orders:", error);
    throw error;
  }
};
