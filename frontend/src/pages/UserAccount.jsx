import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {fetchUserInformation} from '../user-services/fetchUserInformation'
import './styles/UserAccount.css';

const status = Object.freeze({
  Prepare: "Preparing Order",
  Ready: "Ready for Delivery",
  Transit: "In Transit",
  Delivered: "Delivered",
  Cancelled: "Cancelled"
});

// Mock data for carbon footprint tracking
const mockCarbonData = {
  totalFootprint: 142.5, // kg CO2e
  monthlyFootprint: 28.3,
  lastMonthFootprint: 31.7,
  yearlyGoal: 300,
  orders: [
    { id: 1001, date: '2024-05-10', footprint: 15.2, items: 3, category: 'Electronics', state: status.Cancelled },
    { id: 1002, date: '2024-04-22', footprint: 8.1, items: 1, category: 'Home & Garden', state: status.Prepare },
    { id: 1003, date: '2024-04-18', footprint: 12.4, items: 2, category: 'Fashion', state: status.Ready },
    { id: 1004, date: '2024-04-12', footprint: 4.8, items: 1, category: 'Food', state: status.Transit },
    { id: 1005, date: '2024-03-31', footprint: 22.3, items: 5, category: 'Electronics', state: status.Delivered },
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

const mockCountryCodes = [
  { code: '+1', country: 'US', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+27', country: 'ZA', flag: '🇿🇦' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
  { code: '+33', country: 'FR', flag: '🇫🇷' },
  { code: '+81', country: 'JP', flag: '🇯🇵' },
  { code: '+61', country: 'AU', flag: '🇦🇺' },
  { code: '+86', country: 'CN', flag: '🇨🇳' }
];

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
    countryCode: '+27',
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
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      const loadUserInfo = async () => {
        try {
          const userInformation = await fetchUserInformation(parsedUser.id);
          console.log(userInformation);

          setFormData({
            name: userInformation.user.name || '',
            email: userInformation.user.email || '',
            phone: userInformation.user.telephone || 'Not Set',
            countryCode: userInformation.user.country_code || '+27', // Default to SA
            address: userInformation.address?.address || 'Not Set',
            city: userInformation.address?.city || 'Not Set',
            postalCode: userInformation.address?.postal_code || 'Not Set',
            dateOfBirth: userInformation.user.date_of_birth || 'Not Set',
            preferences: {
              emailNotifications: parsedUser.preferences?.emailNotifications ?? true,
              smsNotifications: parsedUser.preferences?.smsNotifications ?? false,
              marketingEmails: parsedUser.preferences?.marketingEmails ?? true,
              carbonGoalNotifications: parsedUser.preferences?.carbonGoalNotifications ?? true,
              sustainabilityTips: parsedUser.preferences?.sustainabilityTips ?? true
            }
          });
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      };

      loadUserInfo();
    } else {
      navigate('/Login');
      setIsLoading(false);
    }
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

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (confirmed) {
      const doubleConfirmed = window.confirm(
        'This will permanently delete all your data. Are you absolutely sure?'
      );
      
      if (doubleConfirmed) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  

  if (isLoading) {
    return (
      <div className="account-container">
        <div className="account-loading">
          <div className="loading-spinner"></div>
          <span>Loading your Account...</span>
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
                    <label htmlFor="name" className='account-form-label'>Full Name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter your full name"
                      className="account-form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email" className='account-form-label'>Email Address</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter your email"
                      className="account-form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group phone-group">
                    <label htmlFor="phone" className='account-form-label'>Phone Number</label>
                    <div className="phone-input-container">
                      <select
                        name="countryCode"
                        value={formData.countryCode}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="country-code-select"
                      >
                        {mockCountryCodes.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.flag} {country.code}
                          </option>
                        ))}
                      </select>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter your phone number"
                        className="phone-input account-form-input"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="dateOfBirth" className='account-form-label'>Date of Birth</label>
                    <input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="account-form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="address" className='account-form-label'>Address</label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter your street address"
                    className="account-form-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city" className='account-form-label'>City</label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter your city"
                      className="account-form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="postalCode" className='account-form-label'>Postal Code</label>
                    <input
                      id="postalCode"
                      name="postalCode"
                      type="text"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter postal code"
                      className="account-form-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

         {/* NEW: Carbon Footprint Tab */}
          {activeTab === 'carbon-footprint' && (
            <div className="carbon-section">
              <div className="section-header">
                <h2>Your Carbon Footprint</h2>
                <div className="timeframe-selector">
                  <button 
                    className={`timeframe-btn ${selectedTimeframe === 'monthly' ? 'active' : ''}`}
                    onClick={() => setSelectedTimeframe('monthly')}
                  >
                    Monthly
                  </button>
                  <button 
                    className={`timeframe-btn ${selectedTimeframe === 'yearly' ? 'active' : ''}`}
                    onClick={() => setSelectedTimeframe('yearly')}
                  >
                    Yearly
                  </button>
                </div>
              </div>

              {/* Carbon Stats Overview */}
              <div className="carbon-overview">
                <div className="carbon-stat-card">
                  <div className="stat-icon">🌍</div>
                  <div className="stat-content">
                    <h3>Total Footprint</h3>
                    <div className="stat-value" style={{ color: getCarbonColor(carbonData.totalFootprint, 300) }}>
                      {carbonData.totalFootprint} 
                    </div>
                    <p className="stat-description">This year</p>
                  </div>
                </div>

                <div className="carbon-stat-card">
                  <div className="stat-icon">📅</div>
                  <div className="stat-content">
                    <h3>This Month</h3>
                    <div className="stat-value" style={{ color: getCarbonColor(carbonData.monthlyFootprint) }}>
                      {carbonData.monthlyFootprint}
                    </div>
                    <p className="stat-description">
                      {monthlyChange > 0 ? '📈' : '📉'} {Math.abs(monthlyChange).toFixed(1)}% vs last month
                    </p>
                  </div>
                </div>

                <div className="carbon-stat-card">
                  <div className="stat-icon">🎯</div>
                  <div className="stat-content">
                    <h3>Yearly Goal</h3>
                    <div className="stat-value">
                      {carbonData.yearlyGoal}
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${Math.min(yearlyProgress, 100)}%`,
                          backgroundColor: yearlyProgress > 100 ? '#ef4444' : '#22c55e'
                        }}
                      ></div>
                    </div>
                    <p className="stat-description">{yearlyProgress.toFixed(1)}% of goal used</p>
                  </div>
                </div>
              </div>

              {/* Monthly Trend Chart */}
              <div className="carbon-chart-section">
                <h3>Monthly Carbon Footprint Trend</h3>
                <div className="chart-container">
                  <div className="chart-bars">
                    {carbonData.monthlyData.map((month, index) => (
                      <div key={month.month} className="chart-bar-group">
                        <div className="chart-bars-container">
                          <div 
                            className="chart-bar actual"
                            style={{ 
                              height: `${(month.footprint / 35) * 100}%`,
                              backgroundColor: getCarbonColor(month.footprint)
                            }}
                            title={`${month.footprint}`}
                          ></div>
                          <div 
                            className="chart-bar goal"
                            style={{ height: `${(month.goal / 35) * 100}%` }}
                            title={`Goal: ${month.goal} `}
                          ></div>
                        </div>
                        <span className="chart-label">{month.month}</span>
                      </div>
                    ))}
                  </div>
                  <div className="chart-legend">
                    <div className="legend-item">
                      <div className="legend-color actual"></div>
                      <span>Actual</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color goal"></div>
                      <span>Goal</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="carbon-breakdown-section">
                <h3>Footprint by Category</h3>
                <div className="category-breakdown">
                  {carbonData.categoryBreakdown.map((category) => (
                    <div key={category.category} className="category-item">
                      <div className="category-header">
                        <span className="category-name">{category.category}</span>
                        <span className="category-amount">{category.footprint}</span>
                      </div>
                      <div className="category-bar">
                        <div 
                          className="category-fill"
                          style={{ 
                            width: `${category.percentage}%`,
                            backgroundColor: category.color
                          }}
                        ></div>
                      </div>
                      <span className="category-percentage">{category.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders */}
              <div className="carbon-orders-section">
                <h3>Recent Order Impact</h3>
                <div className="carbon-orders">
                  {carbonData.orders.map((order) => (
                    <div key={order.id} className="carbon-order-item">
                      <div className="order-info">
                        <span className="order-id">Order #{order.id}</span>
                        <span className="order-date">{order.date}</span>
                        <span 
                          className="order-category" 
                          style={{ color: getCarbonColor(order.footprint, 15) }}>
                            {order.footprint}
                        </span>
                      </div>
                      <div className="order-impact">
                        <span 
                          className="order-footprint"
                          // style={{ color: getCarbonColor(order.footprint, 15) }}
                          style={{color: order.state === status.Cancelled ? '#b51818':'#3a4039'}}
                        >
                          {order.state}
                        </span>
                        <span className="order-items">{order.items} items</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div className="carbon-achievements-section">
                <h3>Sustainability Achievements</h3>
                <div className="achievements-grid">
                  {carbonData.achievements.map((achievement, index) => (
                    <div key={index} className="achievement-card">
                      <div className="achievement-icon">{achievement.icon}</div>
                      <div className="achievement-content">
                        <h4>{achievement.title}</h4>
                        <p>{achievement.description}</p>
                        <span className="achievement-date">{achievement.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="carbon-recommendations-section">
                <h3>💡 Personalized Recommendations</h3>
                <div className="recommendations-list">
                  {carbonData.recommendations.map((recommendation, index) => (
                    <div key={index} className="recommendation-item">
                      <div className="recommendation-icon">🌱</div>
                      <p>{recommendation}</p>
                    </div>
                  ))}
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
                      className="account-toggle-input"
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
                      className="account-toggle-input"
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
                      className="account-toggle-input"
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
                      className="account-toggle-input"
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
                      className="account-toggle-input"
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