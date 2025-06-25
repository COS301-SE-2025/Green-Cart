import React from "react";
import "./styles/Cart.css";
import { useCart } from "../components/cart/CartContext";
import { useNavigate } from "react-router-dom"; // 

export default function Cart() {
  const { cartItems, removeFromCart } = useCart();
  const navigate = useNavigate(); //

  const total = cartItems
    .reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
    .toFixed(2);

  return (
    <div className="cart-container">
      <h2>My Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className="cart-list">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item-row">
                <div className="product-cart-details">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="product-cart-image"
                  />
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p>
                      {Number(item.price).toLocaleString("en-ZA", {
                        style: "currency",
                        currency: "ZAR",
                      })}{" "}
                      × {item.quantity}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="remove-btn"
                >
                  Remove
                </button>
              </div>
            ))}
          </ul>

          <div className="cart-total">
            Total:{" "}
            {Number(total).toLocaleString("en-ZA", {
              style: "currency",
              currency: "ZAR",
            })}
          </div>

          {}
          <button className="checkout-btn" onClick={() => navigate("/checkout")}>
            Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
}
