import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getRetailerUser, fetchUserShops } from '../../user-services/retailerAuthService';
import { API_BASE_URL } from '../../config/api.js';
import './styles/ShopSwitcher.css';

const ShopSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentShop, setCurrentShop] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current shop from localStorage
    const retailerUser = getRetailerUser();
    if (retailerUser) {
      setCurrentShop(retailerUser);
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchShops = async () => {
    if (shops.length > 0) return; // Already fetched

    setLoading(true);
    try {
      const retailerUser = getRetailerUser();
      if (!retailerUser || !retailerUser.email) {
        toast.error('User information not found');
        return;
      }

      // Note: In a real implementation, you would need to store encrypted credentials
      // or use a different approach. For now, we'll use a different API endpoint.
      
      // Alternative approach: Create a dedicated API endpoint to fetch user shops
      const response = await fetch(`${API_BASE_URL}/auth/retailer/shops/by-user/${retailerUser.user_id || retailerUser.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setShops(data.shops || []);
      } else {
        // Fallback: if the endpoint doesn't exist, create a mock with current shop
        setShops([currentShop]);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
      // Fallback to current shop only
      setShops([currentShop]);
    } finally {
      setLoading(false);
    }
  };

  const handleShopSwitch = async (shop) => {
    try {
      setLoading(true);
      
      // Store selected shop information
      const retailerUser = getRetailerUser();
      const shopInfo = {
        ...shop,
        user_id: retailerUser.user_id,
        user_name: retailerUser.user_name,
        email: retailerUser.email
      };
      
      localStorage.setItem('retailer_user', JSON.stringify(shopInfo));
      setCurrentShop(shopInfo);
      setIsOpen(false);
      
      toast.success(`Switched to ${shop.name}`);
      
      // Refresh the current page to load data for the new shop
      window.location.reload();
      
    } catch (error) {
      toast.error('Failed to switch shop');
      console.error('Error switching shop:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      fetchShops();
    }
    setIsOpen(!isOpen);
  };

  if (!currentShop) {
    return null;
  }

  return (
    <div className="shop-switcher" ref={dropdownRef}>
      <button className="shop-switcher-trigger" onClick={toggleDropdown}>
        <div className="shop-info">
          <div className="shop-icon">🏪</div>
          <div className="shop-details">
            <span className="shop-name">{currentShop.name}</span>
            <span className="shop-label">Current Shop</span>
          </div>
        </div>
        <div className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</div>
      </button>

      {isOpen && (
        <div className="shop-switcher-dropdown">
          <div className="dropdown-header">
            <span>Switch Shop</span>
          </div>
          
          {loading ? (
            <div className="dropdown-loading">
              <div className="spinner"></div>
              <span>Loading shops...</span>
            </div>
          ) : (
            <div className="shops-list">
              {shops.length === 0 ? (
                <div className="no-shops">No additional shops found</div>
              ) : (
                shops.map((shop) => (
                  <button
                    key={shop.id}
                    className={`shop-option ${currentShop.id === shop.id ? 'active' : ''}`}
                    onClick={() => handleShopSwitch(shop)}
                    disabled={currentShop.id === shop.id}
                  >
                    <div className="shop-option-icon">🏪</div>
                    <div className="shop-option-details">
                      <span className="shop-option-name">{shop.name}</span>
                      <span className="shop-option-desc">{shop.description}</span>
                    </div>
                    {currentShop.id === shop.id && (
                      <div className="current-indicator">✓</div>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
          
          <div className="dropdown-footer">
            <button 
              className="create-shop-btn"
              onClick={() => {
                setIsOpen(false);
                navigate('/retailer-auth');
              }}
            >
              + Create New Shop
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopSwitcher;
