import React from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createOrder } from '../order-services/createOrder'; // Assuming you have a createOrder function
import './styles/Checkout.css';

export default function Checkout() {
    const navigate = useNavigate();

    const handlePlaceOrder = async () => {
        const params = new URLSearchParams(window.location.search);
        const cart_id = params.get('cart_id');
        console.log('Cart ID:', cart_id);

        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            toast.error('Please log in to place an order.', {
                duration: 5000,
            })
            navigate('/login');
            return;
        }

        // Show loading toast
        // Show loading toast
        const loadingToast = toast.loading('Placing your order...');

        try {
            const order = await createOrder({ userID: user.id, cartID: cart_id });
            console.log('Order created successfully:', order);
            
            // Dismiss loading toast and show success
            toast.dismiss(loadingToast);
            toast.success(
                `Order placed successfully! Your order ID is ${order.order_id}`,
                {
                    duration: 6000,
                    style: {
                        maxWidth: '500px',
                    },
                }
            );
            
            // Navigate after a short delay to let user see the success message
            setTimeout(() => {
                navigate('/orders');
            }, 1500);

        } catch (error) {
            console.error('Error placing order:', error);
            
            // Dismiss loading toast and show error
            toast.dismiss(loadingToast);
            toast.error('Failed to place order. Please try again later.', {
                duration: 5000,
            });
        }
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
