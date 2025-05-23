import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const SearchContext = createContext();

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}

// Simple fuzzy matching function
function fuzzyMatch(text, query) {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Exact match gets highest score
  if (textLower.includes(queryLower)) {
    return 1.0;
  }
  
  // Split query into words for partial matching
  const queryWords = queryLower.split(' ').filter(word => word.length > 1);
  let matchCount = 0;
  
  queryWords.forEach(word => {
    if (textLower.includes(word)) {
      matchCount++;
    }
  });
  
  // Return score based on how many words matched
  return queryWords.length > 0 ? matchCount / queryWords.length : 0;
}

// Calculate relevance score for a product
function calculateRelevance(product, query) {
  const nameScore = fuzzyMatch(product.name, query) * 0.4;
  const descriptionScore = fuzzyMatch(product.description, query) * 0.2;
  const categoryScore = fuzzyMatch(product.category, query) * 0.2;
  const brandScore = fuzzyMatch(product.brand, query) * 0.2;
  
  return nameScore + descriptionScore + categoryScore + brandScore;
}

export function SearchProvider({ children }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const location = useLocation();
  
  // Memoize the search function with custom fuzzy search
  const performSearch = useCallback((query, productsToSearch) => {
    if (!query || !query.trim()) {
      setSearchResults([]);
      return [];
    }
    
    setIsSearching(true);
    
    try {
      const normalizedQuery = query.toLowerCase().trim();
      console.log('Custom fuzzy searching for:', normalizedQuery);
      
      // Calculate relevance scores for all products
      const scoredResults = productsToSearch.map(product => ({
        ...product,
        relevanceScore: calculateRelevance(product, normalizedQuery)
      }));
      
      // Filter out products with very low relevance (threshold: 0.1)
      const filteredResults = scoredResults.filter(product => product.relevanceScore > 0.1);
      
      // Sort by relevance score (highest first)
      const sortedResults = filteredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      console.log('Custom fuzzy search results found:', sortedResults.length);
      setSearchResults(sortedResults);
      return sortedResults;
    } catch (error) {
      console.error("Error searching products:", error);
      setSearchResults([]);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Update search state based on current route and URL parameters
  useEffect(() => {
    console.log('Location changed:', location.pathname, location.search);
    
    if (location.pathname === '/search') {
      const params = new URLSearchParams(location.search);
      const query = params.get('q') || '';
      console.log('Setting search query to:', query);
      setSearchQuery(query);
    } else if (location.pathname === '/Home') {
      // Clear search state when on home page
      console.log('Clearing search state for Home page');
      setSearchQuery('');
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [location.pathname, location.search]);

  // Clear search state
  const clearSearch = useCallback(() => {
    console.log('Clearing search state');
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  }, []);

  const value = {
    searchQuery,
    searchResults,
    isSearching,
    performSearch,
    clearSearch
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}