import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { signupRetailer, signinRetailer, selectShop } from '../user-services/retailerAuthService';
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

  // Add body class on mount, remove on unmount to override global styles
  React.useEffect(() => {
    document.documentElement.classList.add('retailer-auth-active');
    document.body.classList.add('retailer-auth-active');
    
    return () => {
      document.documentElement.classList.remove('retailer-auth-active');
      document.body.classList.remove('retailer-auth-active');
    };
  }, []);

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
      
      // After creating a shop, sign in to get all shops for this user
      try {
        const signinResult = await signinRetailer({
          email: formData.email,
          password: formData.password
        });
        
        if (signinResult.shops.length === 1) {
          // If user has only one shop (the one just created), go to dashboard
          const shopInfo = {
            ...signinResult.shops[0],
            user_id: signinResult.user_id,
            user_name: signinResult.user_name,
            email: signinResult.email
          };
          localStorage.setItem('retailer_user', JSON.stringify(shopInfo));
          navigate('/retailer-dashboard');
        } else {
          // If user has multiple shops, show shop selection
          setShops(signinResult.shops);
          setUserInfo(signinResult);
          setMode('shop-selection');
          toast.success('Please select which shop to manage');
        }
      } catch (signinError) {
        // Fallback: use the original result if signin fails
        localStorage.setItem('retailer_user', JSON.stringify(result));
        navigate('/retailer-dashboard');
      }
      
    } catch (error) {
      // Display more specific error messages
      let errorMessage = error.message;
      
      if (errorMessage.includes("password") && errorMessage.includes("doesn't match")) {
        errorMessage = "The password you entered doesn't match your existing account. Please use your current password.";
      } else if (errorMessage.includes("422") || errorMessage.includes("validation")) {
        errorMessage = "Please check your input. Make sure all fields are filled correctly.";
      } else if (errorMessage.includes("already exists") || errorMessage.includes("already registered")) {
        errorMessage = "An account with this email already exists. Please sign in or try a different email.";
      } else if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signinRetailer(formData);
      
      if (result.shops.length === 1) {
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
      } else {
        // If user has multiple shops, show shop selection
        setShops(result.shops);
        setUserInfo(result);
        setMode('shop-selection');
        toast.success('Please select a shop to continue');
      }
      
    } catch (error) {
      // Display more specific error messages
      let errorMessage = error.message;
      if (errorMessage.includes("404") || errorMessage.includes("not found")) {
        errorMessage = "No retailer account found with this email. Please create an account first.";
      } else if (errorMessage.includes("401") || errorMessage.includes("invalid")) {
        errorMessage = "Invalid email or password. Please check your credentials.";
      }
      toast.error(errorMessage);
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
      <div className="retailer-auth-page">
        <div className="retailer-auth-background"></div>
        <div className="retailer-auth-overlay"></div>
        
        <div className="retailer-auth-container">
          <div className="retailer-auth-card shop-selection-card">
            <div className="auth-header">
              <h1 className="retailer-auth-title">Select Your Shop</h1>
              <p className="retailer-auth-subtitle">
                Welcome back, {userInfo.user_name}! Please select which shop you'd like to manage:
              </p>
            </div>
            
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
                className="submit-button secondary"
                onClick={() => setMode('signup')}
              >
                Create New Shop
              </button>
              <button 
                type="button" 
                className="toggle-button"
                onClick={resetToSignIn}
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="retailer-auth-page">
      <div className="retailer-auth-background"></div>
      <div className="retailer-auth-overlay"></div>
      
      <div className="retailer-auth-container">
        <div className="retailer-auth-card">
          <div className="auth-header">
            <h1 className="retailer-auth-title">
              {mode === 'signup' ? 'Create Your Shop' : 'Retailer Sign In'}
            </h1>
            <p className="retailer-auth-subtitle">
              {mode === 'signup' 
                ? 'Set up your retail shop and start selling' 
                : 'Access your retailer dashboard'
              }
            </p>
          </div>

          <form className="retailer-auth-form" onSubmit={mode === 'signup' ? handleSignUp : handleSignIn}>
            {mode === 'signup' && (
              <>
                <div className="form-group">
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    placeholder=" "
                    className="form-input"
                  />
                  <label htmlFor="name" className="form-label">Shop Name</label>
                </div>

                <div className="form-group">
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    required
                    placeholder=" "
                    className="form-textarea"
                    rows="3"
                  />
                  <label htmlFor="description" className="form-label">Shop Description</label>
                </div>
              </>
            )}

            <div className="form-group">
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                placeholder=" "
                className="form-input"
              />
              <label htmlFor="email" className="form-label">Email</label>
            </div>

            <div className="form-group">
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                placeholder=" "
                className="form-input"
              />
              <label htmlFor="password" className="form-label">Password</label>
            </div>

            {mode === 'signup' && (
              <div className="form-group">
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                  placeholder=" "
                  className="form-input"
                />
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              </div>
            )}

            <button 
              type="submit" 
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading 
                ? (mode === 'signup' ? 'Creating Shop...' : 'Signing In...') 
                : (mode === 'signup' ? 'Create Shop' : 'Sign In')
              }
            </button>
          </form>

          <div className="toggle-container">
            <span className="toggle-text">
              {mode === 'signup' ? 'Already have an account?' : "Don't have a shop yet?"}
            </span>
            <button
              type="button"
              onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
              className="toggle-button"
            >
              {mode === 'signup' ? 'Sign In' : 'Create Shop'}
            </button>
          </div>

          <div className="auth-footer">
            <Link to="/" className="back-link">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetailerAuth;
