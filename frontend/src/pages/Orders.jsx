import React from "react";
import "./styles/Orders.css";

const mockOrders = [
  { id: 1001, date: "2024-05-10", total: 102.98, items: 3 },
  { id: 1002, date: "2024-04-22", total: 49.99, items: 1 },
  { id: 1003, date: "2024-04-18", total: 68.90, items: 2 },
  { id: 1004, date: "2024-04-12", total: 24.50, items: 1 },
  { id: 1005, date: "2024-03-31", total: 210.00, items: 5 },
  { id: 1006, date: "2024-03-15", total: 38.95, items: 2 },
  { id: 1007, date: "2024-03-05", total: 79.99, items: 3 },
  { id: 1008, date: "2024-02-20", total: 150.75, items: 4 },
  { id: 1009, date: "2024-02-10", total: 33.25, items: 2 },
  { id: 1010, date: "2024-01-29", total: 120.60, items: 3 },
];

export default function Orders() {
  return (
    <div className="orders-container">
      <h2>My Orders</h2>
      {mockOrders.length === 0 ? (
        <p>You have no past orders.</p>
      ) : (
        <ul className="orders-list">
          {mockOrders.map((order) => (
            <li key={order.id} className="order-item">
              <p><strong>Order ID:</strong> {order.id}</p>
              <p><strong>Date:</strong> {order.date}</p>
              <p><strong>Total:</strong> {order.total.toLocaleString("en-ZA", { style: "currency", currency: "ZAR" })}</p>
              <p><strong>Items:</strong> {order.items}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
