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
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState([]);
  
  // Simulate loading products from an API
  useEffect(() => {
    setIsLoading(true);
    
    fetchProducts().then(() => {
      setIsLoading(false);
    }).catch(() => {
      alert("Failed to load products. Please try again later.");
      setIsLoading(false);
    });
    
  }, []);

  async function fetchProducts() {
    // apiKey will be removed from this request in the next iteration
    const api = "someKey";
    const fromItem = 0;
    const count = 20;

    try{
      const response = await fetchAllProducts({ apiKey: api, fromItem, count });
      setProducts(response.data || []);
      setImages(response.images || []);
    }catch(error){
      console.error("Error fetching products:", error);

    }

  }

  return (
    <div className="home">
      <SearchBar className="home-search-bar" />
      
      {isLoading ? (
        <div className="loading">Loading products...</div>
      ) : (
        <>
          <h1>Just In</h1>
          <div className="product-list">
            {products.map((product, i) => (
              <Product key={product.id} product={product} image={images[i]} />
            ))}
          </div>
          
          {/* <h1>Best Sellers</h1>
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
          </div> */}
        </>
      )}
    </div>
  );
}