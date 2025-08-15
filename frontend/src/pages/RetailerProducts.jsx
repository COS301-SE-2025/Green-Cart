import React, { useState, useEffect } from 'react';
import EditProduct from '../components/retailer/EditProduct';
import RetailerNavbar from '../components/RetailerNavbar';
import { useNavigate } from 'react-router-dom';
import { isRetailerAuthenticated } from '../user-services/retailerAuthService';
import { API_BASE_URL } from '../config/api.js';
import '../components/styles/retailer/ProductCarousel.css';
import './styles/RetailerDashboard.css';
import './styles/RetailerProducts.css';

export default function RetailerProducts() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [retailerId, setRetailerId] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        const loadRetailerProducts = async () => {
            // Check for retailer authentication
            if (!isRetailerAuthenticated()) {
                navigate('/retailer-auth');
                return;
            }

            // Get retailer ID dynamically
            const retailerData = localStorage.getItem('retailer_user');
            let currentUser = null;
            
            if (retailerData) {
                currentUser = JSON.parse(retailerData);
                console.log("Found retailer user in localStorage:", currentUser);
            } else {
                // Fallback to regular user authentication
                const userData = localStorage.getItem('userData');
                if (!userData) {
                    console.log("No user data found, redirecting to login");
                    navigate('/retailer-auth');
                    return;
                }
                currentUser = JSON.parse(userData);
                console.log("Using regular user data:", currentUser);
            }

            // Determine retailer ID using same logic as dashboard
            let resolvedRetailerId = null;
            
            if (currentUser.retailer_id) {
                resolvedRetailerId = currentUser.retailer_id;
                console.log("Found retailer_id in user data:", resolvedRetailerId);
            } else if (currentUser.id && typeof currentUser.id === 'number') {
                resolvedRetailerId = currentUser.id;
                console.log("Using numeric user ID as retailer_id:", resolvedRetailerId);
            } else if (currentUser.shops && currentUser.shops.length > 0) {
                resolvedRetailerId = currentUser.shops[0].id;
                console.log("Using first shop ID as retailer_id:", resolvedRetailerId);
            } else if (currentUser.user_id || currentUser.id) {
                const userId = currentUser.user_id || currentUser.id;
                console.log("Attempting to fetch retailer by user_id:", userId);
                
                try {
                    const response = await fetch(`${API_BASE_URL}/retailer/by-user/${userId}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.data && data.data.id) {
                            resolvedRetailerId = data.data.id;
                            console.log("Fetched retailer_id from deployed API:", resolvedRetailerId);
                            
                            // Update localStorage with the retailer_id
                            const updatedUser = { ...currentUser, retailer_id: resolvedRetailerId };
                            localStorage.setItem('retailer_user', JSON.stringify(updatedUser));
                        }
                    }
                } catch (error) {
                    console.error("Error fetching retailer by user_id from deployed API:", error);
                }
            }

            if (!resolvedRetailerId) {
                console.error("Could not determine retailer ID for products page");
                setLoading(false);
                return;
            }

            console.log("Using retailer ID for products:", resolvedRetailerId);
            setRetailerId(resolvedRetailerId);
            
            // Fetch products for this retailer
            await fetchProducts(resolvedRetailerId);
        };

        loadRetailerProducts();
    }, [navigate]);

    const fetchProducts = async (targetRetailerId = retailerId) => {
        if (!targetRetailerId) {
            console.error("No retailer ID available for fetching products");
            setLoading(false);
            return;
        }

        try {
            console.log("Fetching products for retailer ID from deployed API:", targetRetailerId);
            const response = await fetch(`${API_BASE_URL}/retailer/products/${targetRetailerId}`);
            const data = await response.json();
            console.log("Products API response from deployed API:", data);
            
            if (response.ok && data.status === 200) {
                // Process products to ensure S3 images are properly handled
                const processedProducts = (data.data || []).map(product => ({
                    ...product,
                    // Prioritize S3 images from the images array
                    image_url: product.images && product.images.length > 0 
                        ? product.images[0] 
                        : product.image_url,
                    // Ensure all S3 image URLs are available
                    images: product.images || (product.image_url ? [product.image_url] : [])
                }));
                
                setProducts(processedProducts);
                console.log("Loaded products with S3 images:", processedProducts.length);
            } else {
                console.error("Products API failed:", response.status, data);
                setProducts([]);
            }
        } catch (err) {
            console.error("Error fetching products from deployed API:", err);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleProductUpdate = async (updatedProduct) => {
        console.log("Product update completed, refreshing products list");
        // Close modal first for better UX
        setEditModalOpen(false);
        // Refresh the products list to show updated data including new S3 images
        await fetchProducts(retailerId);
    };

    // Update the loading state
if (loading) {
  return (
    <>
      <RetailerNavbar />
      <div className="retailer-products-loading-container">
        <div className="retailer-products-loading">
          <div className="retailer-products-loading-spinner"></div>
          <span>Loading Products...</span>
        </div>
      </div>
    </>
  );
}

// Update the error state
if (!retailerId) {
  return (
    <>
      <RetailerNavbar />
      <div className="retailer-products-container">
        <div className="retailer-products-error">
          <h2>Unable to Load Products</h2>
          <p>Could not determine the retailer account for this user.</p>
          <p>Please ensure you are logged in with a valid retailer account.</p>
          <div style={{ marginTop: '1rem' }}>
            <button 
              onClick={() => navigate('/retailer-auth')} 
              style={{ 
                marginRight: '1rem', 
                padding: '0.5rem 1rem', 
                backgroundColor: '#4CAF50', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              Go to Login
            </button>
            <button 
              onClick={() => window.location.reload()} 
              style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#2196F3', 
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
      </div>
    </>
  );
}

// Update the main return JSX
return (
  <>
    <RetailerNavbar />
    <div className="retailer-products-main">
      <div className="retailer-products-container">
        <div className="retailer-products-header">
          <h1>Your Products</h1>
          <button 
            className="retailer-products-back-button" 
            onClick={() => navigate('/retailer-dashboard')}
          >
            ← Back to Dashboard
          </button>
        </div>
        
        <div className="retailer-products-grid">
          {products.length === 0 ? (
            <div className="retailer-products-no-products">
              <h3>No products found</h3>
              <p>Start building your product catalog by adding your first product.</p>
              <button 
                onClick={() => navigate('/retailer-dashboard')}
              >
                Add First Product
              </button>
            </div>
          ) : (
            products.map(product => {
              // Handle S3 image URL with fallback
              const getImageUrl = (product) => {
                if (product.images && product.images.length > 0) {
                  return product.images[0];
                }
                if (product.image_url) {
                  return product.image_url;
                }
                return '/fallback-image.jpg';
              };

              const imageUrl = getImageUrl(product);
              const isS3Image = imageUrl && imageUrl.includes('s3.amazonaws.com');

              return (
                <div key={product.id} className="retailer-products-product-card">
                  <div className="retailer-products-product-image">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      onError={e => { 
                        e.target.onerror = null; 
                        e.target.src = '/fallback-image.jpg'; 
                        console.warn('Failed to load S3 image:', imageUrl);
                      }}
                    />
                    <div className="retailer-products-product-overlay">
                      <span className="retailer-products-sustainability-badge">
                        {product.sustainability_rating !== null && product.sustainability_rating !== undefined 
                          ? `🌱 ${product.sustainability_rating}` 
                          : '🌱 N/A'
                        }
                      </span>
                      {isS3Image && (
                        <span className="retailer-products-s3-badge">S3</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="retailer-products-product-info">
                    <h3 className="retailer-products-product-name">{product.name}</h3>
                    <div className="retailer-products-product-price">
                      R{Number(product.price).toFixed(2)}
                    </div>
                    
                    <div className="retailer-products-product-stats">
                    <div className="retailer-products-stat-item">
                        <span className="retailer-products-stat-label">Stock</span>
                        <span className="retailer-products-stat-value">
                        {product.stock_quantity ?? product.quantity ?? 'N/A'}
                        </span>
                    </div>
                    <div className="retailer-products-stat-item">
                        <span className="retailer-products-stat-label">Sold</span>
                        <span className="retailer-products-stat-value">{product.units_sold ?? 0}</span>
                    </div>
                    <div className="retailer-products-stat-item">
                        <span className="retailer-products-stat-label">Revenue</span>
                        <span className="retailer-products-stat-value">
                        R{Number(product.revenue ?? 0).toFixed(0)} {/* Removed decimals for compact view */}
                        </span>
                    </div>
                    {/* Only show images count if more than 1 image */}
                    {product.images && product.images.length > 1 && (
                        <div className="retailer-products-stat-item">
                        <span className="retailer-products-stat-label">Images</span>
                        <span className="retailer-products-stat-value">{product.images.length}</span>
                        </div>
                    )}
                    </div>
                    
                    <div className="retailer-products-product-actions">
                      <button 
                        className="retailer-products-view-details-button" 
                        onClick={() => navigate(`/retailer/product/${product.id}`)}
                      >
                        View Details
                      </button>
                      <button
                        className="retailer-products-edit-product-button"
                        onClick={() => { 
                          setSelectedProduct(product); 
                          setEditModalOpen(true); 
                        }}
                      >
                        Edit Product
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <EditProduct
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          product={selectedProduct}
          onProductUpdated={handleProductUpdate}
        />
      </div>
    </div>
  </>
);
}