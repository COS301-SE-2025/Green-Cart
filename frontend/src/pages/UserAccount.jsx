import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/UserAccount.css';

// Mock data for carbon footprint tracking
const mockCarbonData = {
  totalFootprint: 142.5, // kg CO2e
  monthlyFootprint: 28.3,
  lastMonthFootprint: 31.7,
  yearlyGoal: 300,
  orders: [
    { id: 1001, date: '2024-05-10', footprint: 15.2, items: 3, category: 'Electronics' },
    { id: 1002, date: '2024-04-22', footprint: 8.1, items: 1, category: 'Home & Garden' },
    { id: 1003, date: '2024-04-18', footprint: 12.4, items: 2, category: 'Fashion' },
    { id: 1004, date: '2024-04-12', footprint: 4.8, items: 1, category: 'Food' },
    { id: 1005, date: '2024-03-31', footprint: 22.3, items: 5, category: 'Electronics' },
  ],
  monthlyData: [
    { month: 'Jan', footprint: 25.4, goal: 25 },
    { month: 'Feb', footprint: 18.7, goal: 25 },
    { month: 'Mar', footprint: 31.2, goal: 25 },
    { month: 'Apr', footprint: 28.9, goal: 25 },
    { month: 'May', footprint: 28.3, goal: 25 },
  ],
  categoryBreakdown: [
    { category: 'Electronics', footprint: 45.8, percentage: 32.1, color: '#ef4444' },
    { category: 'Fashion', footprint: 38.2, percentage: 26.8, color: '#f97316' },
    { category: 'Home & Garden', footprint: 32.1, percentage: 22.5, color: '#eab308' },
    { category: 'Food', footprint: 26.4, percentage: 18.5, color: '#22c55e' },
  ],
  recommendations: [
    'Try choosing products with lower carbon footprints in the Electronics category',
    'Consider sustainable fashion alternatives to reduce your clothing impact',
    'Look for locally sourced food items to minimize transportation emissions',
    'Bundle purchases together to reduce packaging and shipping emissions'
  ],
  achievements: [
    { title: 'Eco Warrior', description: 'Reduced monthly footprint by 10%', date: '2024-04-15', icon: '🌱' },
    { title: 'Green Shopper', description: 'Made 5 sustainable purchases', date: '2024-03-20', icon: '🛍️' },
    { title: 'Carbon Conscious', description: 'Stayed under monthly goal', date: '2024-02-28', icon: '🎯' }
  ]
};

export default function UserAccount() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [carbonData, setCarbonData] = useState(mockCarbonData);
  const [selectedTimeframe, setSelectedTimeframe] = useState('monthly');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    dateOfBirth: '',
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: true,
      carbonGoalNotifications: true,
      sustainabilityTips: true
    }
  });

  useEffect(() => {
    // Load user data from localStorage or API
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        name: parsedUser.name || '',
        email: parsedUser.email || '',
        phone: parsedUser.phone || '',
        address: parsedUser.address || '',
        city: parsedUser.city || '',
        postalCode: parsedUser.postalCode || '',
        dateOfBirth: parsedUser.dateOfBirth || '',
        preferences: {
          emailNotifications: parsedUser.preferences?.emailNotifications ?? true,
          smsNotifications: parsedUser.preferences?.smsNotifications ?? false,
          marketingEmails: parsedUser.preferences?.marketingEmails ?? true,
          carbonGoalNotifications: parsedUser.preferences?.carbonGoalNotifications ?? true,
          sustainabilityTips: parsedUser.preferences?.sustainabilityTips ?? true
        }
      });
    } else {
      navigate('/Login');
    }
    setIsLoading(false);
  }, [navigate]);

  // Calculate progress towards yearly goal
  const yearlyProgress = (carbonData.totalFootprint / carbonData.yearlyGoal) * 100;
  const monthlyChange = ((carbonData.monthlyFootprint - carbonData.lastMonthFootprint) / carbonData.lastMonthFootprint) * 100;

  // Get carbon footprint color based on amount
  const getCarbonColor = (footprint, threshold = 25) => {
    if (footprint <= threshold * 0.5) return '#22c55e'; // Green - excellent
    if (footprint <= threshold * 0.75) return '#eab308'; // Yellow - good  
    if (footprint <= threshold) return '#f97316'; // Orange - moderate
    return '#ef4444'; // Red - high
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('preferences.')) {
      const prefName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefName]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  

  if (isLoading) {
    return (
      <div className="account-container">
        <div className="account-loading">
          <div className="loading-spinner"></div>
          <p>Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="account-container">
        <div className="account-error">
          <h2>Account Not Found</h2>
          <p>Please log in to view your account.</p>
          <button onClick={() => navigate('/Login')} className="login-button">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="account-container">
      <div className="account-header">
        <div className="account-title">
          <h1>My Account</h1>
          <p>Manage your profile and track your environmental impact</p>
        </div>
        <div className="account-actions">
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      <div className="account-content">
        {/* Tab Navigation */}
        <div className="account-tabs">
          <button
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profile
          </button>
          <button
            className={`tab-button ${activeTab === 'carbon-footprint' ? 'active' : ''}`}
            onClick={() => setActiveTab('carbon-footprint')}
          >
            🌍 Carbon Footprint
          </button>
          <button
            className={`tab-button ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            ⚙️ Preferences
          </button>
          <button
            className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            🔒 Security
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Existing Profile Tab */}
          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="section-header">
                <h2>Profile Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="edit-button"
                  >
                    ✏️ Edit Profile
                  </button>
                ) : (
                  <div className="edit-actions">
                    <button
                      onClick={handleSaveChanges}
                      className="save-button"
                      disabled={isLoading}
                    >
                      💾 Save Changes
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="cancel-button"
                    >
                      ❌ Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="dateOfBirth">Date of Birth</label>
                    <input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter your street address"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter your city"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="postalCode">Postal Code</label>
                    <input
                      id="postalCode"
                      name="postalCode"
                      type="text"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter postal code"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

         

          {/* Enhanced Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="preferences-section">
              <div className="section-header">
                <h2>Notification Preferences</h2>
              </div>

              <div className="preferences-form">
                <div className="preference-item">
                  <div className="preference-info">
                    <h3>Email Notifications</h3>
                    <p>Receive order updates and important account information via email</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      name="preferences.emailNotifications"
                      checked={formData.preferences.emailNotifications}
                      onChange={handleInputChange}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="preference-item">
                  <div className="preference-info">
                    <h3>SMS Notifications</h3>
                    <p>Get delivery updates and urgent notifications via text message</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      name="preferences.smsNotifications"
                      checked={formData.preferences.smsNotifications}
                      onChange={handleInputChange}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="preference-item">
                  <div className="preference-info">
                    <h3>Marketing Emails</h3>
                    <p>Receive promotional offers, product recommendations, and sustainability tips</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      name="preferences.marketingEmails"
                      checked={formData.preferences.marketingEmails}
                      onChange={handleInputChange}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="preference-item">
                  <div className="preference-info">
                    <h3>Carbon Goal Notifications</h3>
                    <p>Get alerts when approaching your monthly carbon footprint goals</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      name="preferences.carbonGoalNotifications"
                      checked={formData.preferences.carbonGoalNotifications}
                      onChange={handleInputChange}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="preference-item">
                  <div className="preference-info">
                    <h3>Sustainability Tips</h3>
                    <p>Receive weekly tips and recommendations for reducing your environmental impact</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      name="preferences.sustainabilityTips"
                      checked={formData.preferences.sustainabilityTips}
                      onChange={handleInputChange}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <button
                  onClick={handleSaveChanges}
                  className="save-preferences-button"
                  disabled={isLoading}
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* Existing Security Tab remains the same */}
          {activeTab === 'security' && (
            <div className="security-section">
              <div className="section-header">
                <h2>Security Settings</h2>
              </div>

              <div className="security-form">
                <div className="security-item">
                  <div className="security-info">
                    <h3>Change Password</h3>
                    <p>Update your password to keep your account secure</p>
                  </div>
                  <button className="security-button">
                    Change Password
                  </button>
                </div>

                <div className="security-item">
                  <div className="security-info">
                    <h3>Two-Factor Authentication</h3>
                    <p>Add an extra layer of security to your account</p>
                  </div>
                  <button className="security-button">
                    Enable 2FA
                  </button>
                </div>

                <div className="security-item">
                  <div className="security-info">
                    <h3>Login History</h3>
                    <p>View recent login activity and manage active sessions</p>
                  </div>
                  <button className="security-button">
                    View History
                  </button>
                </div>

                <div className="danger-zone">
                  <h3>Danger Zone</h3>
                  <div className="security-item danger">
                    <div className="security-info">
                      <h4>Delete Account</h4>
                      <p>Permanently delete your account and all associated data</p>
                    </div>
                    <button
                      onClick={handleDeleteAccount}
                      className="delete-button"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}