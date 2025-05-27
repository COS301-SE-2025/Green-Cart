import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSearch } from './SearchProvider';
import '../styles/search/SearchBar.css';

export default function SearchBar({ className = '' }) {
  const { searchQuery } = useSearch();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Only sync with URL parameters, not with searchQuery from context
  useEffect(() => {
    if (location.pathname === '/search') {
      const params = new URLSearchParams(location.search);
      const urlQuery = params.get('q') || '';
      setQuery(urlQuery);
    } else {
      setQuery('');
    }
  }, [location.pathname, location.search]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Ensure query isn't empty
    if (!query || !query.trim()) {
        console.log('Empty Search, naviate back to Home');
        navigate('/Home');
      return;
    }
    
    const trimmedQuery = query.trim();
    console.log('Submitting search for:', trimmedQuery);
    
    // Navigate to search page with query
    navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  return (
    <div className={`search-bar-container ${className}`}>
      <div className="search-bar">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Search eco-friendly products..."
            value={query}
            onChange={handleInputChange}
            aria-label="Search products"
          />
          <button type="submit" aria-label="Search">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}