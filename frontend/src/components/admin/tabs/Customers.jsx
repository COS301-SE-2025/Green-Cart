// Customers.jsx
import React, { useState, useEffect } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/admin/tabs/Customers.css';
import CustomerCard from '../elements/CustomerCard';
import CustomerStatsCard from '../elements/CustomerStatsCard';
import GenericModal from '../elements/GenericModal';
import CustomersTable from '../elements/CustomersTable';
import GenericPagination from '../elements/GenericPagination';
import { getCustomersPageData } from '../../../admin-services/adminService';

//icons
import blackGridIcon from '../icons/blackGridIcon.png';
import blackListIcon from '../icons/blackListIcon.png';
import whiteGridIcon from '../icons/whiteGridIcon.png';
import whiteListIcon from '../icons/whiteListIcon.png';
import retailerBadgeIcon from '../icons/retailerBadgeIcon.png';
import exportIcon from '../icons/exportIcon.png';

const Customers = () => {
  const [viewMode, setViewMode] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data state
  const [customers, setCustomers] = useState([]);
  const [statsData, setStatsData] = useState([]);
  
  const itemsPerPage = 8;

  // Sort and Filter states (keep existing)
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filters, setFilters] = useState({
    types: [],
    countries: [],
    carbonFootprint: {
      min: '',
      max: ''
    }
  });
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  // Load data on component mount
  useEffect(() => {
    loadCustomersData();
  }, []);

  const loadCustomersData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getCustomersPageData();
      
      if (response.status === 200) {
        setCustomers(response.data.customers);
        setStatsData(response.data.stats);
      } else {
        throw new Error(response.message || 'Failed to load customers data');
      }
      
    } catch (err) {
      setError('Failed to load customers data');
      console.error('Error loading customers:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Stats data

  // Keep all your existing filter and sort functions...
  const getFilteredCustomers = () => {
    let filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.retailerName && customer.retailerName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Apply filters
    if (filters.types.length > 0) {
      filtered = filtered.filter(customer =>
        filters.types.includes(customer.type)
      );
    }

    if (filters.countries.length > 0) {
      filtered = filtered.filter(customer =>
        filters.countries.some(country => 
          customer.countryCode && customer.countryCode.includes(country.replace('+', ''))
        )
      );
    }

    if (filters.carbonFootprint.min !== '' || filters.carbonFootprint.max !== '') {
      filtered = filtered.filter(customer => {
        const sustainability = customer.sustainability;
        const min = filters.carbonFootprint.min === '' ? 0 : parseFloat(filters.carbonFootprint.min);
        const max = filters.carbonFootprint.max === '' ? 100 : parseFloat(filters.carbonFootprint.max);
        return sustainability >= min && sustainability <= max;
      });
    }

    return filtered;
  };

  // Sort customers
  const getSortedCustomers = (customersList) => {
    if (!sortBy) return customersList;

    return [...customersList].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'username':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'type':
          aValue = a.type.toLowerCase();
          bValue = b.type.toLowerCase();
          break;
        case 'userId':
          aValue = a.userId.toLowerCase();
          bValue = b.userId.toLowerCase();
          break;
        case 'carbonFootprint':
          aValue = a.sustainability;
          bValue = b.sustainability;
          break;
        default:
          return 0;
      }

      if (sortBy === 'carbonFootprint') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      } else {
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      }
    });
  };

  const filteredCustomers = getSortedCustomers(getFilteredCustomers());

  // Pagination logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCustomer(null);
  };

  const handleViewProfile = () => {
    console.log('Navigate to full profile for customer:', selectedCustomer.userId);
    handleCloseModal();
  };

  const formatCustomerDataForModal = (customer) => {
    if (!customer) return {};
    
    return {
      userId: customer.userId,
      fullUserId: customer.fullUserId,
      type: customer.type,
      accountType: customer.accountType, // Mock data
      registrationDate: customer.registrationDate,
      email: customer.email,
      contact: customer.contact,
      phone: customer.phone,
      status: customer.status,
      sustainability: `${customer.sustainability}%`, // Mock data
      retailerName: customer.retailerName,
      retailerDescription: customer.retailerDescription,
      countryCode: customer.countryCode,
      createdAt: customer.createdAt
    };
  };

  // Sort handlers
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Filter handlers
  const handleTypeFilter = (type) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type];
    
    setFilters(prev => ({
      ...prev,
      types: newTypes
    }));
    setCurrentPage(1);
  };

  const handleCountryFilter = (country) => {
    const newCountries = filters.countries.includes(country)
      ? filters.countries.filter(c => c !== country)
      : [...filters.countries, country];
    
    setFilters(prev => ({
      ...prev,
      countries: newCountries
    }));
    setCurrentPage(1);
  };

  const handleCarbonFootprintFilter = (field, value) => {
    const numValue = parseFloat(value);
    
    if (field === 'min' && filters.carbonFootprint.max !== '' && numValue > parseFloat(filters.carbonFootprint.max)) {
      return; // Don't allow min to be greater than max
    }
    
    if (field === 'max' && filters.carbonFootprint.min !== '' && numValue < parseFloat(filters.carbonFootprint.min)) {
      return; // Don't allow max to be less than min
    }

    setFilters(prev => ({
      ...prev,
      carbonFootprint: {
        ...prev.carbonFootprint,
        [field]: value
      }
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      types: [],
      countries: [],
      carbonFootprint: {
        min: '',
        max: ''
      }
    });
    setCurrentPage(1);
  };

  const countries = ['South Africa', 'Brazil', 'UK', 'USA', 'Australia', 'New Zealand'];
  const types = ['Retailer', 'Customer'];

  if (loading) {
    return (
      <div className="adm-cus-container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          fontSize: '16px',
          color: '#6b7280'
        }}>
          <div className="adm-ord-table-custom-loader">
            <svg className="adm-ord-table-circular" viewBox="25 25 50 50">
              <circle 
                className="adm-ord-table-path" 
                cx="50" 
                cy="50" 
                r="20" 
                fill="none" 
                strokeWidth="2" 
                strokeMiterlimit="10"
              />
            </svg>
          </div>
          Loading customers...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="adm-cus-container">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          gap: '16px'
        }}>
          <div style={{ fontSize: '16px', color: '#dc2626' }}>{error}</div>
          <button 
            onClick={loadCustomersData}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1f2937',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="adm-cus-container">
      <div className="adm-cus-header">
        <h1 className="adm-cus-title">Customers</h1>
        <div className="adm-cus-header-actions">
          <button className="adm-cus-export-btn">
            <img src={exportIcon} alt="Export" className="adm-cus-export-icon" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="adm-cus-stats-grid">
        {statsData.map((stat, index) => (
          <CustomerStatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Search and Controls */}
      <div className="adm-cus-search-and-controls">
        <div className="adm-cus-search-container">
          <div className="adm-cus-search-wrapper">
            <svg className="adm-cus-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <input
              type="text"
              placeholder="Search"
              className="adm-cus-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="adm-cus-control-buttons">
          {/* Filter Dropdown */}
          <Dropdown show={showFilterDropdown} onToggle={(isOpen) => setShowFilterDropdown(isOpen)} autoClose={true}>
            <Dropdown.Toggle 
              variant="outline-primary"
              id="filter-dropdown"
              className="adm-cus-filter-btn"
            >
              Filter by
            </Dropdown.Toggle>
            <Dropdown.Menu className="adm-cus-filter-menu">
              <div className="filter-section">
                <h6>Type</h6>
                {types.map(type => (
                  <div key={type} className="filter-checkbox">
                    <input
                      type="checkbox"
                      id={`type-${type}`}
                      checked={filters.types.includes(type)}
                      onChange={() => handleTypeFilter(type)}
                    />
                    <label htmlFor={`type-${type}`}>{type}</label>
                  </div>
                ))}
              </div>
              
              <div className="filter-section">
                <h6>Country</h6>
                {countries.map(country => (
                  <div key={country} className="filter-checkbox">
                    <input
                      type="checkbox"
                      id={`country-${country}`}
                      checked={filters.countries.includes(country)}
                      onChange={() => handleCountryFilter(country)}
                    />
                    <label htmlFor={`country-${country}`}>{country}</label>
                  </div>
                ))}
              </div>

              <div className="filter-section">
                <h6>Carbon Footprint</h6>
                <div className="filter-range">
                  <input
                    type="number"
                    placeholder="Min"
                    min="0"
                    max="100"
                    value={filters.carbonFootprint.min}
                    onChange={(e) => handleCarbonFootprintFilter('min', e.target.value)}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    min="0"
                    max="100"
                    value={filters.carbonFootprint.max}
                    onChange={(e) => handleCarbonFootprintFilter('max', e.target.value)}
                  />
                </div>
              </div>

              <div className="filter-actions">
                <button onClick={clearFilters} className="clear-filters-btn">
                  Clear All
                </button>
              </div>
            </Dropdown.Menu>
          </Dropdown>

          {/* Sort Dropdown */}
          <Dropdown>
            <Dropdown.Toggle 
              variant="outline-secondary" 
              id="sort-dropdown"
              className="adm-cus-sort-btn"
            >
              Sort by {sortBy && `(${sortBy} ${sortOrder})`}
            </Dropdown.Toggle>
            <Dropdown.Menu className="adm-cus-sort-menu">
              <Dropdown.Item onClick={() => handleSort('email')}>
                Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleSort('username')}>
                Username {sortBy === 'username' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleSort('type')}>
                Type {sortBy === 'type' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleSort('userId')}>
                User ID {sortBy === 'userId' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleSort('carbonFootprint')}>
                Carbon Footprint {sortBy === 'carbonFootprint' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <div className="adm-cus-view-toggle">
            <button
              className={`adm-cus-view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <img src={viewMode === 'list' ? whiteListIcon : blackListIcon} alt="List view" />
            </button>
            <button
              className={`adm-cus-view-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
            >
              <img src={viewMode === 'cards' ? whiteGridIcon : blackGridIcon} alt="Card view" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        <CustomersTable 
          customers={paginatedCustomers}
          onCustomerClick={handleCustomerClick}
        />
      ) : (
        <div className="adm-cus-cards-grid">
          {paginatedCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onClick={() => handleCustomerClick(customer)}
              retailerIcon={retailerBadgeIcon}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <GenericPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredCustomers.length}
        itemsPerPage={itemsPerPage}
      />

      {/* Modal */}
      {showModal && selectedCustomer && (
        <GenericModal
          isOpen={showModal}
          onClose={handleCloseModal}
          data={formatCustomerDataForModal(selectedCustomer)}
          title={selectedCustomer.name}
          subtitle={`UserId: ${selectedCustomer.userId}`}
          showViewProfileButton={true}
          onViewProfile={handleViewProfile}
        />
      )}
    </div>
  );
};

export default Customers;