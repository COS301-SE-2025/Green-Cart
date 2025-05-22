import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';  

//This mock data will be replaced with the data from the backend
const products = [
  {
    id: 1,
    name: 'Product 1',
    description: 'Description of Product 1',
    price: 100,
    category: 'Category 1',
    in_stock: true,
    quantity: 10,
    brand: 'Brand 1',
    retailer: 'Retailer 1',
    image: 'https://via.placeholder.com/150'
  },
  {
    id: 2,
    name: 'Product 2',
    description: 'Description of Product 2',
    price: 200,
    category: 'Category 2',
    in_stock: true,
    quantity: 1,
    brand: 'Brand 2',
    retailer: 'Retailer 2',
    image: 'https://via.placeholder.com/150'
  },
  {
    id: 3,
    name: 'Product 3',
    description: 'Description of Product 3',
    price: 300,
    category: 'Category 3',
    in_stock: false,
    quantity: 0,
    brand: 'Brand 3',
    retailer: 'Retailer 3',
    image: 'https://via.placeholder.com/150'
  }
];

export default function ViewProduct() {
    const { id } = useParams();
    const navigate = useNavigate();

    const product = products.find(product => product.id === parseInt(id));
    if (!product) {
        return <div>Product not found</div>;
    }

    const handleAddToCart = async () => {
        // Logic to add the product to the cart
        console.log(`Added ${product.name} to the cart`);
    };

    const handleBuyNow = async (product) => {
        // Logic to buy the product now
        console.log(`Buying ${product.name} now`);
    };

    const handleAddToWishlist = async (product) => {
        // Logic to add the product to the wishlist
        console.log(`Added ${product.name} to the wishlist`);
    };

    return (
        <div className='view-product'>
            <div className='product-image'>
                <img src={product.image} alt={product.name} />
            </div>
            <div className='product-details'>
                <h1>{product.name}</h1>
                <p>{product.description}</p>
                <p>Price: R{product.price}</p>
                <p>Category: {product.category}</p>
                <p>In Stock: {product.in_stock ? 'Yes' : 'No'}</p>
                <p>Quantity: {product.quantity}</p>
                <p>Brand: {product.brand}</p>
                <p>Retailer: {product.retailer}</p>
            </div>
            {/* BUTTONS FOR ADDING TO CART, Buy Now, Add to wishlist */}
            {/* <div className='product-actions'>
                <button onClick={handleAddToCart}>Add to Cart</button>
                <button onClick={handleBuyNow}>Buy Now</button>
                <button onClick={() => handleAddToWishlist(product)}>Add to Wishlist</button>
            </div> */}
        </div>
    );
}