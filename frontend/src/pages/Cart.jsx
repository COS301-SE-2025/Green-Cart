import React, { use, useState, useEffect} from "react";
import "./styles/Cart.css";
import { useCart } from "../components/cart/CartContext";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const { cartItems, remove_From_Cart, add_To_Cart, refreshCart } = useCart();
  const navigate = useNavigate();
  const [shippingOption, setShippingOption] = useState("standard");
  const [applyGreenPoints, setApplyGreenPoints] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const userId = JSON.parse(localStorage.getItem("user"));
    if (userId) {
      if(!refresh){
        refreshCart(userId.id);
        setRefresh(true);
      } 
    }else navigate("/login");
  }, [refreshCart]);


  const userId = JSON.parse(localStorage.getItem("user"));

  if(!userId) {
    navigate("/login");
    return null; // Prevent rendering if user is not logged in
  }

  if(!refresh){
    refreshCart(userId.id);
    setRefresh(true);
  }

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.data.price) * item.quantity, 0);
  const shippingCost = shippingOption === "standard" ? 73.99 : shippingOption === "express" ? 149.99 : 0;
  const greenPointsDiscount = applyGreenPoints ? 400.99 : 0;
  const totalWithoutGreenPoints = subtotal + shippingCost;
  const finalTotal = totalWithoutGreenPoints - greenPointsDiscount;

  // Green points calculation (assuming 1 point per R10 spent)
  const greenPointsEarned = Math.floor(subtotal / 10);

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <div className="empty-cart">
          <h2>My Cart</h2>
          <p>Your cart is empty.</p>
          <button 
            className="continue-shopping-btn"
            onClick={() => navigate("/Home")}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-content">
        {/* Left Column - Cart Items */}
        <div className="cart-items-section">
          <div className="cart-header">
            <h2>My Cart</h2>
            <span className="item-count">{cartItems.length} Items</span>
          </div>
          
          <div className="cart-table-header">
            <span>PRODUCT DETAILS</span>
            <span>QUANTITY</span>
            <span>PRICE</span>
            <span>TOTAL</span>
          </div>

          <div className="cart-items-list">
            {cartItems.map((item, i) => (
              <div key={item.id} className="cart-item-row">
                <div className="product-details">
                  <img
                    src={item.images[0]}
                    alt={item.data.name}
                    className="product-image"
                  />
                  <div className="product-info">
                    <h4>{item.data.name}</h4>
                    <p className="product-brand">{item.data.brand || 'Green Cart'}</p>
                    <button
                      onClick={() => remove_From_Cart(userId.id,item.data.id)}
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="quantity-controls">
                  <button
                    className="quantity-btn"
                    onClick={() => add_To_Cart(userId.id,item.data.id, -1, item.quantity <= 1)}
                  >
                    −
                  </button>
                  <span className="quantity-display">{item.quantity}</span>
                  <button
                    className="quantity-btn"
                    onClick={() => add_To_Cart(userId.id,item.data.id, 1)}
                  >
                    +
                  </button>
                </div>

                <div className="item-price">
                  {Number(item.data.price).toLocaleString("en-ZA", {
                    style: "currency",
                    currency: "ZAR",
                  })}
                </div>

                <div className="item-total">
                  {Number(item.data.price * item.quantity).toLocaleString("en-ZA", {
                    style: "currency",
                    currency: "ZAR",
                  })}
                </div>
              </div>
            ))}
          </div>

          <button 
            className="continue-shopping"
            onClick={() => navigate("/Home")}
          >
            ← continue shopping
          </button>
        </div>

        {/* Right Column - Order Summary */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          
          <div className="summary-row">
            <span>{cartItems.length} Items</span>
            <span>
              {subtotal.toLocaleString("en-ZA", {
                style: "currency",
                currency: "ZAR",
              })}
            </span>
          </div>

          <div className="shipping-section">
            <label htmlFor="shipping">Shipping</label>
            <select
              id="shipping"
              value={shippingOption}
              onChange={(e) => setShippingOption(e.target.value)}
              className="shipping-select"
            >
              <option value="standard">Standard</option>
              <option value="express">Express</option>
              <option value="free">Free (Orders over R500)</option>
            </select>
            <div className="shipping-cost">
              {shippingCost > 0 ? 
                shippingCost.toLocaleString("en-ZA", {
                  style: "currency",
                  currency: "ZAR",
                }) : "Free"
              }
            </div>
          </div>

          <div className="green-points-section">
            <div className="points-row">
              <span>Green Points</span>
              <span>{greenPointsEarned}</span>
            </div>
            <div className="points-discount">
              -{greenPointsDiscount.toLocaleString("en-ZA", {
                style: "currency",
                currency: "ZAR",
              })}
            </div>
          </div>

          <div className="summary-row total-without-points">
            <span>Total (without Green-Points)</span>
            <span>
              {totalWithoutGreenPoints.toLocaleString("en-ZA", {
                style: "currency",
                currency: "ZAR",
              })}
            </span>
          </div>

          <button 
            className={`apply-points-btn ${applyGreenPoints ? 'applied' : ''}`}
            onClick={() => setApplyGreenPoints(!applyGreenPoints)}
          >
            {applyGreenPoints ? 'Remove Green-Points' : 'Apply Green-Points'}
          </button>

          <div className="final-total">
            <span>Total</span>
            <span>
              {finalTotal.toLocaleString("en-ZA", {
                style: "currency",
                currency: "ZAR",
              })}
            </span>
          </div>

          <button 
            className="checkout-btn"
            onClick={() => navigate("/checkout")}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}