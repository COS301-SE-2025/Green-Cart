import React, { useState, useEffect } from 'react';
import { getAllProducts, getUnverifiedProducts, getProductStats, verifyProduct } from '../../../admin-services/adminProductService';
import ProductVerification from '../ProductVerification';
import toast from 'react-hot-toast';
import '../../styles/admin/tabs/Products.css';

const Products = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    verifiedCount: 0,
    unverifiedCount: 0,
    totalValue: '0.00'
  });
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);

  useEffect(() => {
    loadProductsData();
  }, []);

  useEffect(() => {
    filterProductsByTab();
  }, [activeTab, products]);

  const loadProductsData = async () => {
    setLoading(true);
    try {
      const [allProductsResponse, statsResponse] = await Promise.all([
        getAllProducts(),
        getProductStats()
      ]);

      if (allProductsResponse.status === 200) {
        setProducts(allProductsResponse.data || []);
      }

      if (statsResponse.status === 200) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Error loading products data:', error);
      toast.error('Failed to load products data');
    } finally {
      setLoading(false);
    }
  };

  const filterProductsByTab = () => {
    let filtered = [...products];
    
    switch (activeTab) {
      case 'Verified':
        filtered = products.filter(product => product.verified === true);
        break;
      case 'Unverified':
        filtered = products.filter(product => product.verified === false);
        break;
      case 'All':
      default:
        // Show all products
        break;
    }
    
    setFilteredProducts(filtered);
  };

  const handleImageClick = (imageSrc) => {
    setSelectedImage(imageSrc);
  };

  const closeImageOverlay = () => {
    setSelectedImage(null);
  };

  const handleQuickVerify = async (productId, event) => {
    event.stopPropagation();
    try {
      await verifyProduct(productId);
      toast.success('Product verified successfully!');
      await loadProductsData(); // Refresh data
    } catch (error) {
      console.error('Error verifying product:', error);
      toast.error('Failed to verify product');
    }
  };

  const handleOpenVerificationModal = () => {
    setVerificationModalOpen(true);
  };

  const handleCloseVerificationModal = () => {
    setVerificationModalOpen(false);
  };

  const handleProductVerified = async () => {
    await loadProductsData(); // Refresh data when a product is verified
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatPrice = (price) => {
    if (!price) return 'R 0.00';
    return `R ${parseFloat(price).toFixed(2)}`;
  };

  return (
    <div className="products-content">
      <div className="content-header">
        <h1>Products</h1>
        <div className="header-actions">
          <button 
            className="verification-button"
            onClick={handleOpenVerificationModal}
          >
            Start Verification
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-number">{stats.totalProducts}</div>
          <div className="stat-label">Total Products</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">R{stats.totalValue}</div>
          <div className="stat-label">Total Value</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.unverifiedCount}</div>
          <div className="stat-label">Unverified Items</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['All', 'Verified', 'Unverified'].map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {tab === 'Unverified' && stats.unverifiedCount > 0 && (
              <span className="tab-badge">{stats.unverifiedCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Products Table */}
      <div className="products-table">
        {loading ? (
          <div className="table-loading">
            <div className="loading-spinner"></div>
            <span>Loading products...</span>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Description</th>
                <th>Brand</th>
                <th>Unit Price</th>
                <th>Quantity</th>
                <th>Added Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className={!product.verified ? 'unverified-row' : ''}>
                    <td>
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="product-image"
                          onClick={() => handleImageClick(product.images[0])}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/40x40/7BB540/FFFFFF?text=IMG';
                          }}
                        />
                      ) : (
                        <div className="product-image-placeholder">
                          <span>IMG</span>
                        </div>
                      )}
                    </td>
                    <td className="product-description">
                      <div className="product-name">{product.name}</div>
                      <div className="product-desc-text">{product.description}</div>
                    </td>
                    <td>{product.brand || 'N/A'}</td>
                    <td>{formatPrice(product.price)}</td>
                    <td>{product.quantity || 0}</td>
                    <td>{formatDate(product.created_at)}</td>
                    <td>
                      <span className={`status-badge ${product.verified ? 'verified' : 'unverified'}`}>
                        {product.verified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td>
                      {!product.verified && (
                        <button
                          className="quick-verify-btn"
                          onClick={(e) => handleQuickVerify(product.id, e)}
                          title="Quick Verify"
                        >
                          ✓
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-products">
                    {activeTab === 'Unverified' 
                      ? 'No unverified products found' 
                      : `No ${activeTab.toLowerCase()} products found`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Image Overlay */}
      {selectedImage && (
        <div className="image-overlay" onClick={closeImageOverlay}>
          <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeImageOverlay}>
              ×
            </button>
            <img src={selectedImage} alt="Product" className="overlay-image" />
          </div>
        </div>
      )}

      {/* Product Verification Modal */}
      <ProductVerification
        isOpen={verificationModalOpen}
        onClose={handleCloseVerificationModal}
        onProductVerified={handleProductVerified}
      />
    </div>
  );
};

export default Products;