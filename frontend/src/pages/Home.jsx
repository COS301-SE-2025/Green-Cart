import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Product from '../components/Product/Product';
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

export default function Home() {
    return (
        <>
            <h1>Product List</h1>
            <div className="product-list">
                {products.map(product => (
                    <Product key={product.id} product={product} />
                ))}
            </div>
        </>
    );
}