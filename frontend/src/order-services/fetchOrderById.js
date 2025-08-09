import axios from "axios";

export const fetchOrderById = async ({ userID, orderID }) => {
  try {
    const response = await axios.post("https://api.greencart-cos301.co.za/orders/getOrderByID", {
      userID,
      orderID,
    });

    const { order, products, quantities, average_sustainability, images, rating } = response.data;

    const total = products.reduce((sum, product, index) => {
      const price = parseFloat(product.price || 0);
      const qty = quantities[index] || 0;
      return sum + price * qty;
    }, 0);

    return {
      ...order,
      products,
      images,
      rating,
      quantities,
      total: total.toFixed(2),
      average_sustainability: parseFloat(average_sustainability || 0).toFixed(2),
    };
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    throw error;
  }
};
