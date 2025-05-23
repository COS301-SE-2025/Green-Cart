import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Product from '../components/product/Product';
import './styles/Home.css';


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
    // image: 'https://via.placeholder.com/150'
    image: 'https://picsum.photos/200/300'
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
    image: 'https://picsum.photos/200/300'
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
    image: 'https://picsum.photos/200/300'
  }
];

export default function Home() {

    // Mock api call to fetch products
    // const fetchProducts = async () => {
    //     try {
    //         const response = await fetch('https://api.example.com/products');
    //         if (!response.ok) {
    //             throw new Error('Network response was not ok');
    //         }
    //         const data = await response.json();
    //         setProducts(data);
    //     } catch (error) {
    //         console.error('Error fetching products:', error);

    //     }
    
    // };

    return (
        <>
          <div className='home'>
            <h1>Just in</h1>
            <div className="product-list">
                {products.map(product => (
                    <Product key={product.id} product={product} />
                ))}
            </div>
            <h1>Best Sellers</h1>
            <div className="product-list">
                {products.map(product => (
                    <Product key={product.id} product={product} />
                ))}
            </div>

            <h1>Featured</h1>
            <div className="product-list">
                {products.map(product => (
                    <Product key={product.id} product={product} />
                ))}
            </div>
          </div>
            
        </>
    );
}