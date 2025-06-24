import { useState, useEffect } from 'react';
import '../styles/filter/FilterSort.css';

export default function FilterSort({ 
  onFilterChange, 
  onSortChange, 
  initialFilters = {}, 
  initialSort = ['name', 'ASC'],
  showFilters = true,
  showSort = true,
  className = ''
}) {
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState(initialSort);
  const [categories, setCategories] = useState([
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Food & Beverages',
    'Health & Beauty',
    'Sports & Outdoors',
    'Books & Media',
    'Automotive'
  ]);

  useEffect(() => {
    onFilterChange?.(filters);
  }, [filters, onFilterChange]);

  useEffect(() => {
    onSortChange?.(sort);
  }, [sort, onSortChange]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value === 'all' ? '' : value
    }));
  };

  const handleSortChange = (field, order) => {
    setSort([field, order]);
  };

  const clearFilters = () => {
    setFilters({});
    setSort(['name', 'ASC']);
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => value && value !== '').length;
  };

  return (
    <div className={`filter-sort-sidebar ${className}`}>
      {/* Sort Section */}
      {showSort && (
        <div className="filter-section">
          <h4>Sort Products</h4>
          <select 
            value={`${sort[0]}-${sort[1]}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              handleSortChange(field, order);
            }}
            className="filter-select"
          >
            <option value="name-ASC">Name (A-Z)</option>
            <option value="name-DESC">Name (Z-A)</option>
            <option value="price-ASC">Price (Low to High)</option>
            <option value="price-DESC">Price (High to Low)</option>
            <option value="created_at-DESC">Newest First</option>
            <option value="created_at-ASC">Oldest First</option>
          </select>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <>
          <div className="filter-section">
            <h4>Category</h4>
            <select 
              value={filters.category || 'all'}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-section">
            <h4>Availability</h4>
            <div className="filter-radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="availability"
                  value="all"
                  checked={!filters.in_stock}
                  onChange={() => handleFilterChange('in_stock', '')}
                />
                <span className="radio-label">All Products</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="availability"
                  value="in_stock"
                  checked={filters.in_stock === 'true'}
                  onChange={() => handleFilterChange('in_stock', 'true')}
                />
                <span className="radio-label">In Stock Only</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="availability"
                  value="out_of_stock"
                  checked={filters.in_stock === 'false'}
                  onChange={() => handleFilterChange('in_stock', 'false')}
                />
                <span className="radio-label">Out of Stock</span>
              </label>
            </div>
          </div>

          <div className="filter-section">
            <h4>Price Range</h4>
            <div className="filter-radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="price_range"
                  value="all"
                  checked={!filters.price_range}
                  onChange={() => handleFilterChange('price_range', '')}
                />
                <span className="radio-label">All Prices</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="price_range"
                  value="0-50"
                  checked={filters.price_range === '0-50'}
                  onChange={() => handleFilterChange('price_range', '0-50')}
                />
                <span className="radio-label">Under R50</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="price_range"
                  value="50-100"
                  checked={filters.price_range === '50-100'}
                  onChange={() => handleFilterChange('price_range', '50-100')}
                />
                <span className="radio-label">R50 - R100</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="price_range"
                  value="100-200"
                  checked={filters.price_range === '100-200'}
                  onChange={() => handleFilterChange('price_range', '100-200')}
                />
                <span className="radio-label">R100 - R200</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="price_range"
                  value="200+"
                  checked={filters.price_range === '200+'}
                  onChange={() => handleFilterChange('price_range', '200+')}
                />
                <span className="radio-label">Over R200</span>
              </label>
            </div>
          </div>

          <div className="filter-section">
            <h4>Sustainability Rating</h4>
            <div className="filter-radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="sustainability"
                  value="all"
                  checked={!filters.sustainability}
                  onChange={() => handleFilterChange('sustainability', '')}
                />
                <span className="radio-label">All Ratings</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="sustainability"
                  value="good"
                  checked={filters.sustainability === 'good'}
                  onChange={() => handleFilterChange('sustainability', 'good')}
                />
                <span className="radio-label">🌿 Good (70+)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="sustainability"
                  value="fair"
                  checked={filters.sustainability === 'fair'}
                  onChange={() => handleFilterChange('sustainability', 'fair')}
                />
                <span className="radio-label">🌱 Fair (50-69)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="sustainability"
                  value="needs_work"
                  checked={filters.sustainability === 'needs_work'}
                  onChange={() => handleFilterChange('sustainability', 'needs_work')}
                />
                <span className="radio-label">⚠️ Needs Work (Below 50)</span>
              </label>
            </div>
          </div>

          {getActiveFilterCount() > 0 && (
            <div className="filter-actions">
              <button onClick={clearFilters} className="clear-filters-btn">
                Clear All Filters ({getActiveFilterCount()})
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}