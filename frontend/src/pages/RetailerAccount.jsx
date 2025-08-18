import React, { useState, useEffect } from 'react';
import RetailerNavbar from '../components/RetailerNavbar';
import { getRetailerUser } from '../user-services/retailerAuthService';
import toast from 'react-hot-toast';
import './styles/RetailerAccount.css';

const RetailerAccount = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const retailerUser = getRetailerUser();
  
  const [formData, setFormData] = useState({
    name: retailerUser?.name || '',
    description: retailerUser?.description || '',
    email: retailerUser?.email || '',
    user_name: retailerUser?.user_name || '',
    banner_image: retailerUser?.banner_image || ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/retailer/account/${retailerUser.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      // Mock success for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update localStorage
      const updatedUser = { ...retailerUser, ...formData };
      localStorage.setItem('retailer_user', JSON.stringify(updatedUser));
      
      toast.success('Account updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update account');
      console.error('Error updating account:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: retailerUser?.name || '',
      description: retailerUser?.description || '',
      email: retailerUser?.email || '',
      user_name: retailerUser?.user_name || '',
      banner_image: retailerUser?.banner_image || ''
    });
    setIsEditing(false);
  };

  return (
    <>
      <RetailerNavbar />
      <div className="retailer-account-container">
        <div className="account-header">
          <h1>My Account</h1>
          <p>Manage your shop information and account settings</p>
        </div>

        <div className="account-content">
          {/* Shop Information Card */}
          <div className="info-card">
            <div className="card-header">
              <h3>Shop Information</h3>
              {!isEditing ? (
                <button 
                  className="edit-btn"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
              ) : (
                <div className="edit-actions">
                  <button 
                    className="save-btn"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="card-content">
              <div className="ret-acc-form-group">
                <label>Shop Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter shop name"
                  />
                ) : (
                  <div className="display-value">{formData.name}</div>
                )}
              </div>

              <div className="ret-acc-form-group">
                <label>Shop Description</label>
                {isEditing ? (
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your shop"
                    rows="3"
                  />
                ) : (
                  <div className="display-value">{formData.description}</div>
                )}
              </div>

              <div className="ret-acc-form-group">
                <label>Banner Image URL</label>
                {isEditing ? (
                  <input
                    type="url"
                    value={formData.banner_image}
                    onChange={(e) => handleInputChange('banner_image', e.target.value)}
                    placeholder="https://example.com/banner.jpg"
                  />
                ) : (
                  <div className="display-value">
                    {formData.banner_image || 'No banner image set'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Account Information Card */}
          <div className="info-card">
            <div className="card-header">
              <h3>Account Information</h3>
            </div>

            <div className="card-content">
              <div className="ret-acc-form-group">
                <label>Owner Name</label>
                <div className="display-value">{formData.user_name}</div>
              </div>

              <div className="ret-acc-form-group">
                <label>Email Address</label>
                <div className="display-value">{formData.email}</div>
              </div>

              <div className="ret-acc-form-group">
                <label>Account Type</label>
                <div className="display-value">
                  <span className="account-badge">Retailer Account</span>
                </div>
              </div>

              <div className="ret-acc-form-group">
                <label>Shop ID</label>
                <div className="display-value">{retailerUser?.id}</div>
              </div>
            </div>
          </div>

          {/* Statistics Card */}
          <div className="info-card">
            <div className="card-header">
              <h3>Shop Statistics</h3>
            </div>

            <div className="card-content">
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">12</div>
                  <div className="stat-label">Total Orders</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">$1,245</div>
                  <div className="stat-label">Total Sales</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">8</div>
                  <div className="stat-label">Products Listed</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">4.8</div>
                  <div className="stat-label">Average Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RetailerAccount;
