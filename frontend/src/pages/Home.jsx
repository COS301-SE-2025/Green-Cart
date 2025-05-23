import { useState, useEffect } from 'react';
import Product from '../components/product/Product';
import SearchBar from '../components/search/SearchBar';
import { products } from '../data/products';
import './styles/Home.css';

// Grouped by categories
const justInProducts = products.slice(0, 3);
const bestSellerProducts = products.slice(3, 5);
const featuredProducts = products.slice(5);

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  
  // Simulate loading products from an API
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="home">
      <SearchBar className="home-search-bar" />
      
      {isLoading ? (
        <div className="loading">Loading products...</div>
      ) : (
        <>
          <h1>Just In</h1>
          <div className="product-list">
            {justInProducts.map(product => (
              <Product key={product.id} product={product} />
            ))}
          </div>
          
          <h1>Best Sellers</h1>
          <div className="product-list">
            {bestSellerProducts.map(product => (
              <Product key={product.id} product={product} />
            ))}
          </div>

          <h1>Featured Products</h1>
          <div className="product-list">
            {featuredProducts.map(product => (
              <Product key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}