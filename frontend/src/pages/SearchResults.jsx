import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useSearch } from '../components/search/SearchProvider';
import Product from '../components/product/Product';
import SearchBar from '../components/search/SearchBar';
import FilterSort from '../components/filter/FilterSort';

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
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState(['name', 'ASC']);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

const search_products = useCallback(async () => {
    setSearching(true);
    setError(null);
    
    try {
      const apiKey = "someKey";
      const fromItem = 0;
      const count = 50; // Increased for better filtering results
      
      // Transform filters for API
      const apiFilters = {};
      if (filters.category) {
        apiFilters.category = filters.category;
      }
      
      const response = await searchProducts({ 
        apiKey, 
        search: displayQuery || '', 
        fromItem, 
        count,
        filter: Object.keys(apiFilters).length > 0 ? apiFilters : undefined,
        sort: sort
      });
      
      let searchResults = response.data || [];
      let searchImages = response.images || [];
      
      // Apply client-side filters that backend doesn't support yet
      searchResults = searchResults.filter(product => {
        // Stock filter
        if (filters.in_stock === 'true' && !product.in_stock) return false;
        if (filters.in_stock === 'false' && product.in_stock) return false;
        
        // Price range filter
        if (filters.price_range) {
          const price = Number(product.price) || 0;
          switch (filters.price_range) {
            case '0-50':
              if (price >= 50) return false;
              break;
            case '50-100':
              if (price < 50 || price >= 100) return false;
              break;
            case '100-200':
              if (price < 100 || price >= 200) return false;
              break;
            case '200+':
              if (price < 200) return false;
              break;
          }
        }
        
        // Sustainability filter (mock implementation)
        if (filters.sustainability) {
          const mockRating = Math.floor(Math.random() * 60) + 25;
          switch (filters.sustainability) {
            case 'good':
              if (mockRating < 70) return false;
              break;
            case 'fair':
              if (mockRating < 50 || mockRating >= 70) return false;
              break;
            case 'needs_work':
              if (mockRating >= 50) return false;
              break;
          }
        }
        
        return true;
      });
      
      // Update images array to match filtered results
      const filteredImages = searchResults.map((product, index) => {
        const originalIndex = (response.data || []).findIndex(p => p.id === product.id);
        return searchImages[originalIndex] || '';
      });
      
      setResults(searchResults);
      setImages(filteredImages);
      
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again later.");
    } finally {
      setSearching(false);
    }
  }, [displayQuery, filters, sort]);

  // Handle URL parameter changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    setDisplayQuery(query);
  }, [location.search]);

  // Trigger search when displayQuery, filters, or sort change
  useEffect(() => {
    if (displayQuery !== null) {
      search_products();
    }
  }, [search_products, displayQuery]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  return (

    <div className="search-results">
      <SearchBar className="search-results-bar" />
      
      {/* Mobile Filter Toggle */}
      <button className="mobile-filter-toggle" onClick={toggleSidebar}>
        <span className="filter-icon">🔍</span>
        Filters & Sort
      </button>

      <div className="search-results-layout">
        {/* Sidebar Filters */}
        <aside className={`search-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h3>Filters & Sorting</h3>
            <button className="close-sidebar" onClick={toggleSidebar}>
              ✕
            </button>
          </div>
          
          <FilterSort
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
            initialFilters={filters}
            initialSort={sort}
            showFilters={true}
            showSort={true}
            className="sidebar-filters"
          />
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

        {/* Main Content */}
        <main className="search-results-main">
          <div className="search-results-header">
            {displayQuery ? (
              <h1>Search Results for "{displayQuery}"</h1>
            ) : (
              <h1>All Products</h1>
            )}
            
            {!isSearching && !error && (
              <p className="results-summary">
                {displayQuery 
                  ? `${results.length} products found` 
                  : `${results.length} products available`
                }
              </p>
            )}
          </div>
          
          {error ? (
            <div className="search-error">
              <h3>Oops! Something went wrong</h3>
              <p>{error}</p>
              <button onClick={search_products} className="retry-btn">
                Try Again
              </button>
            </div>
          ) : isSearching ? (
            <>
              <div className="loading-indicator">
                <div className="loading-spinner"></div>
                <span className="loading-text">Searching products...</span>
              </div>
              <div className="product-list">
                {[...Array(8)].map((_, index) => (
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
          ) : results.length > 0 ? (
            <div className="product-list">
              {results.map((product, i) => (
                <Product key={product.id} product={product} image={images[i]} />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <h2>No products found</h2>
              <p>
                {displayQuery 
                  ? `We couldn't find any products matching "${displayQuery}". Try using different keywords or adjusting your filters.`
                  : 'No products available with the current filters.'
                }
              </p>
              <div className="no-results-actions">
                <button onClick={() => setFilters({})} className="clear-filters-btn">
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}