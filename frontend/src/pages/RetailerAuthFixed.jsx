import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { signupRetailer, signinRetailer } from '../user-services/retailerAuthService';
import './styles/RetailerAuth.css';

const RetailerAuth = () => {
  const [mode, setMode] = useState('signin'); // 'signin', 'signup', 'shop-selection'
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [shops, setShops] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      const result = await signupRetailer(formData);
      toast.success('Shop created successfully!');
      
      // Store shop information and redirect to dashboard
      localStorage.setItem('retailer_user', JSON.stringify(result));
      navigate('/retailer-dashboard');
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signinRetailer(formData);
      
      if (result.shops && result.shops.length === 1) {
        // If user has only one shop, select it automatically
        const shopInfo = {
          ...result.shops[0],
          user_id: result.user_id,
          user_name: result.user_name,
          email: result.email
        };
        localStorage.setItem('retailer_user', JSON.stringify(shopInfo));
        toast.success('Signin successful!');
        navigate('/retailer-dashboard');
      } else if (result.shops && result.shops.length > 1) {
        // If user has multiple shops, show shop selection
        setShops(result.shops);
        setUserInfo(result);
        setMode('shop-selection');
        toast.success('Please select a shop to continue');
      } else {
        toast.error('No shops found for this account');
      }
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShopSelection = async (shop) => {
    try {
      setIsLoading(true);
      
      // Store selected shop information
      const shopInfo = {
        ...shop,
        user_id: userInfo.user_id,
        user_name: userInfo.user_name,
        email: userInfo.email
      };
      
      localStorage.setItem('retailer_user', JSON.stringify(shopInfo));
      toast.success(`Selected shop: ${shop.name}`);
      navigate('/retailer-dashboard');
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetToSignIn = () => {
    setMode('signin');
    setShops([]);
    setUserInfo(null);
    setFormData({
      name: '',
      description: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  if (mode === 'shop-selection') {
    return (
      <div className="retailer-auth-container">
        <div className="retailer-auth-card">
          <h2>Select Your Shop</h2>
          <p>Welcome back, {userInfo?.user_name}! Please select which shop you'd like to manage:</p>
          
          <div className="shops-grid">
            {shops.map((shop) => (
              <div key={shop.id} className="shop-card" onClick={() => handleShopSelection(shop)}>
                <div className="shop-image">
                  {shop.banner_image ? (
                    <img src={shop.banner_image} alt={shop.name} />
                  ) : (
                    <div className="shop-placeholder">🏪</div>
                  )}
                </div>
                <div className="shop-info">
                  <h3>{shop.name}</h3>
                  <p>{shop.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="shop-actions">
            <button 
              type="button" 
              className="secondary-btn"
              onClick={() => setMode('signup')}
            >
              Create New Shop
            </button>
            <button 
              type="button" 
              className="link-btn"
              onClick={resetToSignIn}
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="retailer-auth-container">
      <div className="retailer-auth-card">
        <div className="auth-header">
          <h2>{mode === 'signup' ? 'Create Your Shop' : 'Retailer Sign In'}</h2>
          <p>
            {mode === 'signup' 
              ? 'Set up your retail shop and start selling' 
              : 'Access your retailer dashboard'
            }
          </p>
        </div>

        <form onSubmit={mode === 'signup' ? handleSignUp : handleSignIn}>
          {mode === 'signup' && (
            <>
              <div className="form-group">
                <label htmlFor="name">Shop Name</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  placeholder="Enter your shop name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Shop Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                  placeholder="Describe what your shop sells"
                  rows="3"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          {mode === 'signup' && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required
                placeholder="Confirm your password"
              />
            </div>
          )}

          <button 
            type="submit" 
            className="primary-btn"
            disabled={isLoading}
          >
            {isLoading 
              ? (mode === 'signup' ? 'Creating Shop...' : 'Signing In...') 
              : (mode === 'signup' ? 'Create Shop' : 'Sign In')
            }
          </button>
        </form>

        <div className="auth-toggle">
          {mode === 'signup' ? (
            <p>
              Already have an account?{' '}
              <button 
                type="button" 
                className="link-btn"
                onClick={() => setMode('signin')}
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have a shop yet?{' '}
              <button 
                type="button" 
                className="link-btn"
                onClick={() => setMode('signup')}
              >
                Create Shop
              </button>
            </p>
          )}
        </div>

        <div className="auth-footer">
          <Link to="/" className="link-btn">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default RetailerAuth;
