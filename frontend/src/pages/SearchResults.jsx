import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSearch } from '../components/search/SearchProvider';
import Product from '../components/product/Product';
import SearchBar from '../components/search/SearchBar';
// import { products } from '../data/products';
import { searchProducts } from '../product-services/searchProducts';
import './styles/SearchResults.css';

export default function SearchResults() {
  const location = useLocation();
  const [isSearching, setSearching ] = useState(null);
  const [results, setResults] = useState([]);
  const [images, setImages] = useState([]);
  const [displayQuery, setDisplayQuery] = useState(null);
  const [error, setError] = useState(null);

  async function search_products(){
    //apiKey will removed from this request in the next iteration
    const apiKey = "someKey";
    const fromItem = 0;
    const count = 20;
    try {
      const response = await searchProducts({ apiKey, search: displayQuery, fromItem, count });
      setResults(response.data || []);
      setImages(response.images || []);
      
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again later.");
    }
  }
  
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const query = params.get('q') || '';
  setDisplayQuery(query);
  setSearching(true);
}, [location.search]);

useEffect(() => {
  if (displayQuery !== null) { // or add any other condition you want
    search_products().finally(() => setSearching(false));
  }
}, [displayQuery]);
  
  return (
    <div className="search-results">
      <SearchBar className="search-results-bar" />
      
      <div className="search-results-container">
        {displayQuery ? (
          <h1>Search Results for "{displayQuery}"</h1>
        ) : (
          <h1>All Products</h1>
        )}
        
        {error ? (
          <div className="search-error">{error}</div>
        ) : isSearching ? (
          <div className="searching">Searching products...</div>
        ) : results.length > 0 ? (
          <>
            <p className="results-count">
              {displayQuery ? `${results.length} products found` : `${results.length} products available`}
            </p>
            <div className="product-list">
              {results.map((product, i) => (
                <Product key={product.id} product={product} image={images[i]} />
              ))}
            </div>
          </>
        ) : (
          <div className="no-results">
            <h2>No products found</h2>
            <p>We couldn't find any products matching "{displayQuery}". Try using different keywords or browse our categories.</p>
          </div>
        )}
      </div>
    </div>
  );
}