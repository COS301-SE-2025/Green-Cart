import React, { createContext, useContext, useEffect, useState } from "react";
import { addToCart } from "../../cart-services/addToCart"; 
import { viewCart } from "../../cart-services/viewCart";
import { fetchProduct } from "../../product-services/fetchProduct";
import { removeFromCart } from "../../cart-services/removeFromCart";
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [cartID, setCartID] = useState(null);

    const refreshCart = async (user_id) => {
        const response = await viewCart({ user_id });

        // Fetch all product details in parallel
        const products = await Promise.all(
            response.items.map(async (item) => {
                if(item.quantity <= 0){
                    await remove_From_Cart({ user_id, product_id: item.product_id });
                    return null; // Skip this item if quantity is 0 or less
                }

                const product = await fetchProduct({ product_id: item.product_id });
                return { ...product, quantity: item.quantity };
            })
        );
        setCartItems(products);
        setCartID(response.id);
        console.log("Cart items refreshed:", cartItems);
    };

    const add_To_Cart = async (user_id, product_id, quantity, deleteFlag = false) => {
        if (deleteFlag){
            await remove_From_Cart(user_id, product_id);
            // Refresh the cart after removing an item
            await refreshCart(user_id);
            return;
        }

        try {
            await addToCart({ user_id, product_id, quantity });
        
        } catch (error) {
            console.log("Error adding to cart:", error);
            toast.error("Not enough stock available");
        }
        // Refresh the cart after adding an item
        await refreshCart(user_id);
    };


    const remove_From_Cart = async (user_id, id) => {
        try{
            await removeFromCart({ user_id, product_id: id });
        } catch (error) {
            console.error("Error removing from cart:", error);
        }
        // Refresh the cart after removing an item
        await refreshCart(user_id);
    };

    return (
        <CartContext.Provider value={{ cartItems, refreshCart, add_To_Cart, remove_From_Cart, cartID}}>
            {children}
        </CartContext.Provider>
    );
}
