import { useState, useEffect } from 'react';
import Product from '../components/product/Product';
import SearchBar from '../components/search/SearchBar';
// import { products, images } from '../data/products';
import { fetchAllProducts } from '../product-services/fetchAllProducts'
import './styles/Home.css';

// Grouped by categories
// const justInProducts = products.slice(0, 3);
// const bestSellerProducts = products.slice(3, 5);
// const featuredProducts = products.slice(5);


export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState([]);
  const [ratings, setRatings] = useState([]);
  
  // Simulate loading products from an API
  useEffect(() => {
    // setIsLoading(true);
    
    fetchProducts().then(() => {

      setTimeout(() => {
        setIsLoading(false);
      }, 300)
      // setIsLoading(false);
    }).catch(() => {
      alert("Failed to load products. Please try again later.");
      setIsLoading(false);
    });
    
  }, []);

  async function fetchProducts() {
    const fromItem = 0;
    const count = 20;

    try{
      const response = await fetchAllProducts({fromItem, count });
      setProducts(response.data || []);
      setImages(response.images || []);
      setRatings(response.rating || []);

    }catch(error){
      console.error("Error fetching products:", error);

    }

  }
  
  return (
    <div className="home">
      <SearchBar className="home-search-bar" />
      
      <h1>Just In</h1>
      
      {isLoading ? (
        <>
          {/* Loading indicator */}
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <span className="loading-text">Loading eco-friendly products...</span>
          </div>
          {/* Simple loading skeleton cards */}
          <div className="product-list">
            {[...Array(12)].map((_, index) => (
              <div key={index} className="product-skeleton">
                <div className="skeleton-image"></div>
                <div className="skeleton-content">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-price"></div>
                  <div className="skeleton-badge"></div>
                </div>
              </div>
            ))}
          </div>
          
          
        </>
      ) : (
        <div className="product-list">
          {products.map((product, i) => (
            <Product key={product.id} product={product} image={images[i]} product_rating={parseInt(ratings[i])} />
          ))}
        </div>
      )}
    </div>
  );
}