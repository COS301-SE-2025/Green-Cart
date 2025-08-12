// Customers.jsx
import React, { useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import '../../styles/admin/tabs/Customers.css';
import CustomerCard from '../elements/CustomerCard';
import CustomerStatsCard from '../elements/CustomerStatsCard';
import GenericModal from '../elements/GenericModal';
import CustomersTable from '../elements/CustomersTable';
import GenericPagination from '../elements/GenericPagination';

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
  const itemsPerPage = 8;

  // Sort and Filter states
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
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Enhanced customer data with more entries for pagination
  const customers = [
    {
      id: 1,
      name: "Tahsan Khan",
      userId: "TK4568",
      company: "Ulstore.org",
      email: "Khan036@gmail.com",
      phone: "+27 (555) 123-4567",
      contact: "066-083-2696",
      receivables: "USD 43,648.00",
      status: "Accepted",
      avatar: "/api/placeholder/40/40",
      isRetailer: true,
      type: "Retailer",
      registrationDate: "02 March 2025",
      accountType: "Google",
      lastLogin: "2 hours ago",
      totalOrders: 45,
      memberSince: "March 2025",
      sustainability: 85,
      country: "South Africa"
    },
    {
      id: 2,
      name: "Anuwar Hussen",
      userId: "AH3421",
      company: "Ulstore.org",
      email: "anuwarhossen380@gmail.com",
      phone: "+1 (555) 987-6543",
      contact: "01788521380",
      receivables: "USD 35,234.00",
      status: "Accepted",
      avatar: "/api/placeholder/40/40",
      isRetailer: false,
      type: "Customer",
      registrationDate: "15 February 2025",
      accountType: "Email",
      lastLogin: "1 day ago",
      totalOrders: 32,
      memberSince: "February 2025",
      sustainability: 60,
      country: "USA"
    },
    {
      id: 3,
      name: "Hasan Khan",
      userId: "HK2847",
      company: "Ulstore.org",
      email: "hasankhan@gmail.com",
      phone: "+55 (555) 246-8135",
      contact: "01893531209",
      receivables: "USD 12,643.00",
      status: "Pending",
      avatar: "/api/placeholder/40/40",
      isRetailer: true,
      type: "Retailer",
      registrationDate: "20 January 2025",
      accountType: "Google",
      lastLogin: "3 days ago",
      totalOrders: 18,
      memberSince: "January 2025",
      sustainability: 75,
      country: "Brazil"
    },
    {
      id: 4,
      name: "Jaman Khan",
      userId: "JK1953",
      company: "Ulstore.org",
      email: "jamankhan@gmail.com",
      phone: "+44 (555) 369-2580",
      contact: "01893531209",
      receivables: "USD 23,123.00",
      status: "Cancel",
      avatar: "/api/placeholder/40/40",
      isRetailer: false,
      type: "Customer",
      registrationDate: "05 December 2024",
      accountType: "Email",
      lastLogin: "1 week ago",
      totalOrders: 12,
      memberSince: "December 2024",
      sustainability: 45,
      country: "UK"
    },
    {
      id: 5,
      name: "Herry Kane",
      userId: "HK2746",
      company: "Ulstore.org",
      email: "herrykane@gmail.com",
      phone: "+61 (555) 147-2589",
      contact: "01893531209",
      receivables: "USD 17,890.00",
      status: "Accepted",
      avatar: "/api/placeholder/40/40",
      isRetailer: true,
      type: "Retailer",
      registrationDate: "10 January 2025",
      accountType: "Google",
      lastLogin: "5 hours ago",
      totalOrders: 28,
      memberSince: "January 2025",
      sustainability: 90,
      country: "Australia"
    },
    {
      id: 6,
      name: "Matt Henry",
      userId: "MH3682",
      company: "Ulstore.org",
      email: "matthenry@gmail.com",
      phone: "+64 (555) 753-9514",
      contact: "01893531209",
      receivables: "USD 14,159.00",
      status: "Accepted",
      avatar: "/api/placeholder/40/40",
      isRetailer: false,
      type: "Customer",
      registrationDate: "25 February 2025",
      accountType: "Email",
      lastLogin: "2 days ago",
      totalOrders: 21,
      memberSince: "February 2025",
      sustainability: 55,
      country: "New Zealand"
    },
    // Additional mock data for pagination
    {
      id: 7,
      name: "Sarah Wilson",
      userId: "SW5829",
      company: "Ulstore.org",
      email: "sarah.wilson@gmail.com",
      phone: "+27 (555) 852-7410",
      contact: "01893531209",
      receivables: "USD 19,500.00",
      status: "Accepted",
      avatar: "/api/placeholder/40/40",
      isRetailer: true,
      type: "Retailer",
      registrationDate: "12 March 2025",
      accountType: "Google",
      lastLogin: "30 minutes ago",
      totalOrders: 35,
      memberSince: "March 2025",
      sustainability: 95,
      country: "South Africa"
    },
    {
      id: 8,
      name: "David Chen",
      userId: "DC4162",
      company: "Ulstore.org",
      email: "david.chen@gmail.com",
      phone: "+1 (555) 963-7418",
      contact: "01893531209",
      receivables: "USD 28,750.00",
      status: "Pending",
      avatar: "/api/placeholder/40/40",
      isRetailer: false,
      type: "Customer",
      registrationDate: "08 February 2025",
      accountType: "Email",
      lastLogin: "4 hours ago",
      totalOrders: 23,
      memberSince: "February 2025",
      sustainability: 70,
      country: "USA"
    },
    {
      id: 9,
      name: "Emily Johnson",
      userId: "EJ7394",
      company: "Ulstore.org",
      email: "emily.j@gmail.com",
      phone: "+55 (555) 159-7532",
      contact: "01893531209",
      receivables: "USD 31,200.00",
      status: "Accepted",
      avatar: "/api/placeholder/40/40",
      isRetailer: true,
      type: "Retailer",
      registrationDate: "18 January 2025",
      accountType: "Google",
      lastLogin: "1 hour ago",
      totalOrders: 42,
      memberSince: "January 2025",
      sustainability: 88,
      country: "Brazil"
    },
    {
      id: 10,
      name: "Michael Brown",
      userId: "MB8261",
      company: "Ulstore.org",
      email: "m.brown@gmail.com",
      phone: "+44 (555) 741-9630",
      contact: "01893531209",
      receivables: "USD 16,890.00",
      status: "Cancel",
      avatar: "/api/placeholder/40/40",
      isRetailer: false,
      type: "Customer",
      registrationDate: "30 December 2024",
      accountType: "Email",
      lastLogin: "2 weeks ago",
      totalOrders: 8,
      memberSince: "December 2024",
      sustainability: 30,
      country: "UK"
    }
  ];

  // Stats data
  const statsData = [
    {
      title: "Total users",
      value: "2,420",
      change: "+20%",
      changeType: "positive",
      period: "last month",
      subtitle: "South Africa: 200"
    },
    {
      title: "Customers",
      value: "1,210",
      change: "+15%",
      changeType: "positive",
      period: "last month",
      subtitle: "With Pending Orders: 7"
    },
    {
      title: "Retailers",
      value: "847",
      change: "+8%",
      changeType: "positive",
      period: "last month",
      subtitle: "New This Month: 10"
    }
  ];

  // Filter customers based on search and filters
  const getFilteredCustomers = () => {
    let filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply filters
    if (filters.types.length > 0) {
      filtered = filtered.filter(customer =>
        filters.types.includes(customer.type)
      );
    }

    if (filters.countries.length > 0) {
      filtered = filtered.filter(customer =>
        filters.countries.includes(customer.country)
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
      type: customer.type,
      accountType: customer.accountType,
      registrationDate: customer.registrationDate,
      email: customer.email,
      contact: customer.contact,
      phone: customer.phone,
      memberSince: customer.memberSince,
      lastLogin: customer.lastLogin,
      totalOrders: customer.totalOrders,
      receivables: customer.receivables,
      status: customer.status,
      company: customer.company,
      sustainability: `${customer.sustainability}%`
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
          <Dropdown show={showFilterDropdown} onToggle={setShowFilterDropdown}>
            <Dropdown.Toggle 
              variant="outline-secondary" 
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