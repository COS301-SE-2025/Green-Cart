import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Checkout.css';

export default function Checkout() {
    const navigate = useNavigate();

    const handlePlaceOrder = () => {
        alert("Order placed successfully (mock)");
        navigate("/Home");
    };

    return (
        <div className="checkout-container">
            <h1>Checkout</h1>

            <div className="checkout-section">
                <h2>Shipping Information</h2>
                <input type="text" placeholder="Full Name" />
                <input type="text" placeholder="Address" />
                <input type="text" placeholder="City" />
                <input type="text" placeholder="Postal Code" />
            </div>

            <div className="checkout-section">
                <h2>Payment Information</h2>

                <div className="payment-icons">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" alt="MasterCard" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple Pay" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" />
                </div>

                <input type="text" placeholder="Card Number" />
                <input type="text" placeholder="Expiry Date (MM/YY)" />
                <input type="text" placeholder="CVV" />
            </div>

            <button className="place-order-button" onClick={handlePlaceOrder}>
                Place Order
            </button>
        </div>
    );
}
