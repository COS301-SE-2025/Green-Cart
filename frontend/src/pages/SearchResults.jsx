import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSearch } from '../components/search/SearchProvider';
import Product from '../components/product/Product';
import SearchBar from '../components/search/SearchBar';
import { products } from '../data/products';
import './styles/SearchResults.css';

export default function SearchResults() {
  const location = useLocation();
  const { performSearch, isSearching } = useSearch();
  const [results, setResults] = useState([]);
  const [displayQuery, setDisplayQuery] = useState('');
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    
    console.log('SearchResults effect - query:', query);
    setDisplayQuery(query);
    
    try {
      setError(null);
      
      if (query) {
        // Perform search with the query
        const searchResults = performSearch(query, products);
        setResults(searchResults);
      } else {
        // If no query, show all products
        setResults(products);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("An error occurred during search. Please try again.");
      setResults([]);
    }
  }, [location.search]); // Remove performSearch from dependencies
  
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
              {results.map(product => (
                <Product key={product.id} product={product} />
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