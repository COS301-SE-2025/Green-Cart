import { useState, useEffect, useCallback } from 'react';
import Product from '../components/product/Product';
import SearchBar from '../components/search/SearchBar';
import FilterSort from '../components/filter/FilterSort';
// import { products, images } from '../data/products';
import { fetchAllProducts } from '../product-services/fetchAllProducts'
import './styles/Home.css';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState([]);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState(['name', 'ASC']);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [ratings, setRatings] = useState([]);
  const [isSticky, setIsSticky] = useState(true);
  
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const api = "someKey"; // Replace with your actual API key
      const fromItem = 0;
      const count = 40;

      const apiFilters = {};
      if(filters.category) {
        apiFilters.category = filters.category;
      }

      const response = await fetchAllProducts({
        apiKey: api,
        fromItem,
        count,
        filter: Object.keys(apiFilters).length > 0 ? apiFilters : undefined,
        sort: sort
      });

      let fetchedProducts = response.data || [];
      let fetchedImages = response.images || [];
      const fetchedRatings  = response.rating || [];
      
      // Apply client-side filters that backend doesn't support yet
      fetchedProducts = fetchedProducts.filter(product => {
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
        
        // Updated this code, it was working with random values at first, now it uses the actual ratings
       if (filters.sustainability) {
          const originalIndex = (response.data || []).findIndex(p => p.id === product.id);
          const actualRating = fetchedRatings[originalIndex] || 0;
          
          switch (filters.sustainability) {
            case 'good':
              if (actualRating < 70) return false;
              break;
            case 'fair':
              if (actualRating < 50 || actualRating >= 70) return false;
              break;
            case 'needs_work':
              if (actualRating >= 50) return false;
              break;
          }
        }
        
        return true;
      });
      
      // Update images array to match filtered products
      const filteredImages = fetchedProducts.map((product, index) => {
        const originalIndex = (response.data || []).findIndex(p => p.id === product.id);
        return fetchedImages[originalIndex] || '';
      });

      // Update ratings array to match filtered products 
      const filteredRatings = fetchedProducts.map((product) => {
        const originalIndex = (response.data || []).findIndex(p => p.id === product.id);
        return fetchedRatings[originalIndex] || 0;
      });
      
      setProducts(fetchedProducts);
      setImages(filteredImages);
      setRatings(filteredRatings);

    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again later.");
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  }, [filters, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
  }; 

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const heroSection = document.querySelector('.hero-section');

    if (!heroSection) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(entry.isIntersecting); // true when hero is in view
      },
      { threshold: 0.1 } // trigger when at least 10% is visible
    );

    observer.observe(heroSection);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="home">
      {/* Search Section */}
      <section className={`search-section ${isSticky ? 'sticky' : ''}`}>
        <SearchBar className="home-search-bar" />
      </section>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1 className="hero-title">New in Homeware</h1>
            <p className="hero-description">
              Upgrade your home with planet-friendly essentials that blend style, function, and sustainability.
            </p>
          </div>
        </div>
      </section>
      
      {/* Mobile Filter Toggle */}
      <button className="mobile-filter-toggle" onClick={toggleSidebar}>
        <span className="filter-icon">🔍</span>
        Filters & Sort
      </button>

      <div className="home-layout">
        {/* Sidebar Filters */}
        <aside className={`home-sidebar ${isSidebarOpen ? 'open' : ''}`}>
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
        <main className="home-main">
          <div className="home-header">
            {!isLoading && !error && (
              <p className="products-count">
                {products.length} eco-friendly products available
              </p>
            )}
          </div>
          
          {error ? (
            <div className="error-message">
              <h3>Oops! Something went wrong</h3>
              <p>{error}</p>
              <button onClick={fetchProducts} className="retry-btn">
                Try Again
              </button>
            </div>
          ) : isLoading ? (
            <>
              <div className="loading-indicator">
                <div className="loading-spinner"></div>
                <span className="loading-text">Loading eco-friendly products...</span>
              </div>
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
          ) : products.length > 0 ? (
             <div className="product-list">
              {products.map((product, i) => (
              <Product key={product.id} product={product} image={images[i]} product_rating={parseFloat(ratings[i]) || 0} />
            ))}
        </div>
          ) : (
            <div className="no-products">
              <h3>No products found</h3>
              <p>Try adjusting your filters or search criteria.</p>
              <button onClick={() => setFilters({})} className="clear-filters-btn">
                Clear All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}