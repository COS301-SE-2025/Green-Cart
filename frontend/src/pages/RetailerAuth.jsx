import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { signupRetailer, signinRetailer, selectShop } from '../user-services/retailerAuthService';
import TwoFactorVerificationModal from '../components/modals/TwoFactorVerificationModal';
import { getApiUrl } from '../config/api'; // Adjust path as needed
import './styles/RetailerAuth.css';

const RetailerAuth = () => {
  const [mode, setMode] = useState('signin'); // 'signin', 'signup', 'shop-selection'
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    password: ''
  });
  const [shops, setShops] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // 2FA related states
  const [showMFAModal, setShowMFAModal] = useState(false);
  const [pendingSigninData, setPendingSigninData] = useState(null);
  const [mfaLoading, setMfaLoading] = useState(false);
  
  const navigate = useNavigate();

  // Add body class on mount, remove on unmount to override global styles
  React.useEffect(() => {
    document.documentElement.classList.add('retailer-auth-active');
    document.body.classList.add('retailer-auth-active');
    
    // Check if retailer is already logged in
    const retailerUser = localStorage.getItem('retailer_user');
    if (retailerUser) {
      // Retailer is already logged in, redirect to dashboard
      navigate('/retailer-dashboard', { replace: true });
      return;
    }
    
    return () => {
      document.documentElement.classList.remove('retailer-auth-active');
      document.body.classList.remove('retailer-auth-active');
    };
  }, [navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Check if user has MFA enabled
  const checkMFAStatus = async (email) => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/users/isMFA/${email}`);
      const data = await response.json();
      
      if (response.ok) {
        return data.enabled;
      } else {
        console.warn('Could not check MFA status:', data.message);
        return false; // Default to no MFA if check fails
      }
    } catch (error) {
      console.warn('Error checking MFA status:', error);
      return false; // Default to no MFA if check fails
    }
  };

  // Verify MFA code
  const verifyMFACode = async (code, isBackupCode = false) => {
    try {
      setMfaLoading(true);
      const apiUrl = getApiUrl();
      
      // Using the correct API endpoint structure
      const response = await fetch(`${apiUrl}/users/verifyMFA`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: pendingSigninData.user_id,
          code: code,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // MFA verification successful, proceed with signin flow
        setShowMFAModal(false);
        setPendingSigninData(null);
        
        // Complete the signin process with the original signin data
        handleSigninComplete(pendingSigninData);
        
        toast.success('Two-factor authentication verified successfully!');
      } else {
        throw new Error(data.message || 'MFA verification failed');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to verify authentication code');
    } finally {
      setMfaLoading(false);
    }
  };

  // Complete signin process after MFA verification (or if no MFA required)
  const handleSigninComplete = (signinResult) => {
    if (signinResult.shops.length === 1) {
      // If user has only one shop, select it automatically
      const shopInfo = {
        ...signinResult.shops[0],
        user_id: signinResult.user_id,
        user_name: signinResult.user_name,
        email: signinResult.email
      };
      localStorage.setItem('retailer_user', JSON.stringify(shopInfo));
      toast.success('Signin successful!');
      navigate('/retailer-dashboard');
    } else {
      // If user has multiple shops, show shop selection
      setShops(signinResult.shops);
      setUserInfo(signinResult);
      setMode('shop-selection');
      toast.success('Please select a shop to continue');
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create retailer account (service will verify credentials first)
      const result = await signupRetailer(formData);
      toast.success('Shop created successfully!');
      
      // After creating a shop, sign in to get all shops for this user
      try {
        const signinResult = await signinRetailer({
          email: formData.email,
          password: formData.password
        });
        
        // Check if user has MFA enabled before proceeding
        const hasMFA = await checkMFAStatus(formData.email);
        
        if (hasMFA) {
          // Show MFA modal
          setPendingSigninData(signinResult);
          setShowMFAModal(true);
          toast.info('Please complete two-factor authentication');
        } else {
          // No MFA required, proceed normally
          handleSigninComplete(signinResult);
        }
        
      } catch (signinError) {
        // Fallback: use the original result if signin fails
        localStorage.setItem('retailer_user', JSON.stringify(result));
        navigate('/retailer-dashboard');
      }
      
    } catch (error) {
      // Service provides specific error messages, use them directly
      toast.error(error.message || "Failed to create shop. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signinRetailer(formData);
      
      // Check if user has MFA enabled
      const hasMFA = await checkMFAStatus(formData.email);
      
      if (hasMFA) {
        // Show MFA modal instead of proceeding directly
        setPendingSigninData(result);
        setShowMFAModal(true);
        toast.info('Please complete two-factor authentication');
      } else {
        // No MFA required, proceed with normal signin flow
        handleSigninComplete(result);
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
    setShowMFAModal(false);
    setPendingSigninData(null);
    setFormData({
      name: '',
      description: '',
      email: '',
      password: ''
    });
  };

  // Handle MFA modal close
  const handleMFAModalClose = () => {
    setShowMFAModal(false);
    setPendingSigninData(null);
    setMfaLoading(false);
  };

  // Handle MFA verification
  const handleMFAVerify = (code) => {
    verifyMFACode(code, false);
  };

  // Handle backup code verification
  const handleBackupCodeVerify = (code) => {
    // Use the same MFA verification endpoint for backup codes
    // Your API may handle backup codes through the same verifyMFA endpoint
    verifyMFACode(code, true);
  };

  if (mode === 'shop-selection') {
    return (
      <div className="retailer-auth-page">
        <div className="retailer-auth-background"></div>
        <div className="retailer-auth-overlay"></div>
        
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

        {/* 2FA Modal */}
        <TwoFactorVerificationModal
          isOpen={showMFAModal}
          onClose={handleMFAModalClose}
          onVerify={handleMFAVerify}
          onUseBackupCode={handleBackupCodeVerify}
          userEmail={pendingSigninData?.email}
          isLoading={mfaLoading}
        />
      </div>
    );
  }

  return (
    <div className="retailer-auth-page">
      <div className="retailer-auth-background"></div>
      <div className="retailer-auth-overlay"></div>
      
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
              <div className="retailer-auth-form-group">
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  placeholder=" "
                  className="retailer-auth-form-input"
                />
                <label htmlFor="name" className="retailer-auth-form-label">Shop Name</label>
              </div>

              <div className="retailer-auth-form-group">
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                  placeholder=" "
                  className="retailer-auth-form-textarea"
                  rows="3"
                />
                <label htmlFor="description" className="retailer-auth-form-label">Shop Description</label>
              </div>
            </>
          )}

          <div className="retailer-auth-form-group">
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              placeholder=" "
              className="retailer-auth-form-input"
            />
            <label htmlFor="email" className="retailer-auth-form-label">Email</label>
          </div>

          <div className="retailer-auth-form-group">
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              placeholder=" "
              className="retailer-auth-form-input"
            />
            <label htmlFor="password" className="retailer-auth-form-label">Password</label>
          </div>



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

      {/* 2FA Modal */}
      <TwoFactorVerificationModal
        isOpen={showMFAModal}
        onClose={handleMFAModalClose}
        onVerify={handleMFAVerify}
        onUseBackupCode={handleBackupCodeVerify}
        userEmail={pendingSigninData?.email}
        isLoading={mfaLoading}
      />
    </div>
  );
};

export default RetailerAuth;