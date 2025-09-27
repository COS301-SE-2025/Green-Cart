import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from "../components/modals/ConfirmationModal";
import { useConfirmation } from "../hooks/useConfirmation";
import toast from 'react-hot-toast';
import { fetchUserInformation } from '../user-services/fetchUserInformation'
import { setUserInformation } from '../user-services/setUserInformation';
import { signupRetailer, signinRetailer } from '../user-services/retailerAuthService';
import './styles/UserAccount.css';
import RetailerAuthOverlay from "../components/retailer/Auth/RetailerAuthOverlay";
import InteractiveCarbonChart from '../components/charts/InteractiveCarbonChart';
import carbonGoalsService from '../services/carbonGoalsService';
import { getApiUrl, getLocalApiUrl, API_BASE_URL } from '../config/api';
import ChangePasswordModal from '../components/modals/ChangePasswordModal';
import TwoFactorModal from '../components/modals/TwoFactorModal';
import HelpModal from '../components/modals/HelpModal';
import forecastingService from '../services/forecastingService';

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
	const [carbonData, setCarbonData] = useState(null);
	const [isLoadingCarbonData, setIsLoadingCarbonData] = useState(false);
	const [selectedTimeframe, setSelectedTimeframe] = useState('monthly');
	const { confirmationState, showConfirmation } = useConfirmation();
	const [isRetailerOverlayOpen, setIsRetailerOverlayOpen] = useState(false);
	
	// Forecasting state
	const [forecastData, setForecastData] = useState(null);
	const [isLoadingForecast, setIsLoadingForecast] = useState(false);
	const [forecastHorizon, setForecastHorizon] = useState(30);
	const [userInsights, setUserInsights] = useState(null);
	const [userScore, setUserScore] = useState(null);
	const [showHelpModal, setShowHelpModal] = useState(false);
	const [helpModalContent, setHelpModalContent] = useState({ title: '', content: '' });
	

	// Add these state variables in the component
	const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
	const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState(false);
	const [is2FAEnabled, setIs2FAEnabled] = useState(false); // Track 2FA status

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

	const [updateData, setUpdateData] = useState({
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
		const userData = localStorage.getItem('userData');
		if (userData) {
			const parsedUser = JSON.parse(userData);
			setUser(parsedUser);

			if(parsedUser.requires2FA === true){
				setIs2FAEnabled(true);

			}else{
				setIs2FAEnabled(false);
			}

			const loadUserInfo = async () => {
				try {
					const userInformation = await fetchUserInformation(parsedUser.id);
					console.log(userInformation);

					const userData = {
						name: userInformation.user.name || '',
						email: userInformation.user.email || '',
						phone: userInformation.user.telephone || 'Not Set',
						countryCode: userInformation.user.country_code || '+27', // Default to SA
						address: userInformation.address?.address || 'Not Set',
						city: userInformation.address?.city || 'Not Set',
						postalCode: userInformation.address?.postal_code || 'Not Set',
						dateOfBirth: userInformation.user.date_of_birth || '',
						preferences: {
							emailNotifications: parsedUser.preferences?.emailNotifications ?? true,
							smsNotifications: parsedUser.preferences?.smsNotifications ?? false,
							marketingEmails: parsedUser.preferences?.marketingEmails ?? true,
							carbonGoalNotifications: parsedUser.preferences?.carbonGoalNotifications ?? true,
							sustainabilityTips: parsedUser.preferences?.sustainabilityTips ?? true
						}
					};

					setFormData(userData);
					setUpdateData(userData);

				} catch (error) {
					console.error(error);
				} finally {
					setIsLoading(false);
				}
			};

			// Load carbon data when user loads
			loadCarbonData(parsedUser.id);
			loadForecastingData(parsedUser.id);
			loadUserInfo();
		} else {
			navigate('/login');
			setIsLoading(false);
		}
	}, [navigate]);

	// Function to load carbon data from backend
	const loadCarbonData = async (userId) => {
		setIsLoadingCarbonData(true);
		try {
			console.log('Loading carbon data for user:', userId);
			const data = await carbonGoalsService.getUserCarbonData(userId);
			console.log('Received carbon data:', data);
			setCarbonData(data);
		} catch (error) {
			console.error('Error loading carbon data:', error);
			// Fall back to mock data if API fails
			console.log('Falling back to mock data due to API error');
			setCarbonData(mockCarbonData);
			toast.error('Failed to load carbon data. Using sample data.');
		} finally {
			setIsLoadingCarbonData(false);
		}
	};

	// Function to load forecasting data from backend
	const loadForecastingData = async (userId) => {
		setIsLoadingForecast(true);
		try {
			console.log('Loading forecasting data for user:', userId);
			
			// Load forecast, insights, and user score in parallel
			const [forecastResult, insightsResult, scoreResult] = await Promise.all([
				forecastingService.generateForecast(userId, forecastHorizon),
				forecastingService.getUserInsights(userId),
				forecastingService.getUserScore(userId)
			]);
			
			console.log('Received forecast data:', forecastResult);
			console.log('Received insights data:', insightsResult);
			console.log('Received score data:', scoreResult);
			
			setForecastData(forecastResult);
			setUserInsights(insightsResult);
			setUserScore(scoreResult);
		} catch (error) {
			console.error('Error loading forecasting data:', error);
			toast.error('Failed to load forecasting data. Please try again later.');
		} finally {
			setIsLoadingForecast(false);
		}
	};

	// Function to refresh forecast with new horizon
	const refreshForecast = async (newHorizon) => {
		if (!user) return;
		
		setForecastHorizon(newHorizon);
		setIsLoadingForecast(true);
		
		try {
			const forecastResult = await forecastingService.generateForecast(user.id, newHorizon);
			setForecastData(forecastResult);
		} catch (error) {
			console.error('Error refreshing forecast:', error);
			toast.error('Failed to refresh forecast.');
		} finally {
			setIsLoadingForecast(false);
		}
	};

	// Help modal handlers
	const showHelp = (title, content) => {
		setHelpModalContent({ title, content });
		setShowHelpModal(true);
	};

	const closeHelpModal = () => {
		setShowHelpModal(false);
		setHelpModalContent({ title: '', content: '' });
	};

	// Calculate progress towards yearly goal (only if carbonData exists)
	const yearlyProgress = carbonData ? (carbonData.totalFootprint / carbonData.yearlyGoal) * 100 : 0;
	const monthlyChange = carbonData ? ((carbonData.monthlyFootprint - carbonData.lastMonthFootprint) / carbonData.lastMonthFootprint) * 100 : 0;

	// Get sustainability score color based on amount (0-100 scale)
	const getCarbonColor = (score, threshold = 75) => {
		if (score >= 85) return '#22c55e'; // Green - excellent sustainability
		if (score >= 70) return '#eab308'; // Yellow - good sustainability  
		if (score >= 50) return '#f97316'; // Orange - moderate sustainability
		return '#ef4444'; // Red - poor sustainability
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
			const response = await setUserInformation(formData, user.id);
			const updatedUser = { ...user, ...formData };
			localStorage.setItem('user', JSON.stringify(updatedUser));
			setUser(updatedUser);

			// Update the backup data to reflect the saved changes
			setUpdateData({ ...formData });
			setIsEditing(false);
			toast.success('Profile updated successfully!');
		} catch (error) {
			toast.error((error.message || 'Please try again.'));
			// Restore form data to the last saved state on error
			setFormData({ ...updateData });
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancelEdit = () => {
		// Restore form data to the last saved state
		if (updateData && Object.keys(updateData).length > 0) {
			setFormData({ ...updateData });
		}
		setIsEditing(false);
	};

	const handleDeleteAccount = async () => {
		const confirmed = await showConfirmation({
			title: 'Delete Account',
			message: 'This will permanently delete your account and all associated data. Are you absolutely sure?',
			confirmText: 'Delete Account',
			cancelText: 'Keep Account',
			type: 'danger'
		});

		if (confirmed) {
			const doubleConfirmed = await showConfirmation({
				title: 'Confirm Deletion',
				message: 'This will permanently delete all your data. Are you absolutely sure?',
				confirmText: 'Yes, Delete My Account',
				cancelText: 'No, Keep My Account',
				type: 'danger'
			});


			if (doubleConfirmed) {
				localStorage.removeItem('user');
				localStorage.removeItem('token');
				navigate('/');
			}
		}
	};

	const handleLogout = async () => {
		try {
			const confirmed = await showConfirmation({
				title: 'Confirm Logout',
				message: 'You will be Logged out of your Account, Continue Logout?',
				confirmText: 'Continue',
				cancelText: 'Cancel',
				type: 'default'
			});

			console.log('Confirmation result:', confirmed);

			if (confirmed) {
				// Clear all possible authentication data (consistent with Navigation component)
				localStorage.removeItem("userData");
				localStorage.removeItem("retailerData");
				localStorage.removeItem("user"); // legacy key
				localStorage.removeItem("token"); // legacy key
				localStorage.removeItem("access_token");
				localStorage.removeItem("auth_token");
				localStorage.removeItem("retailer_user");
				localStorage.removeItem("retailer_token");
				localStorage.removeItem("selected_shop");
				
				// Dispatch auth state change event for components listening
				window.dispatchEvent(new Event('authStateChanged'));
				
				// Show success message
				toast.success('Logged out successfully');
				
				// Navigate to home/splash page
				navigate('/', { replace: true });
			}
		} catch (error) {
			console.error('Error with confirmation:', error);
		}
	};

	const logasRetailer = async () => {
		setIsRetailerOverlayOpen(true);
	};

	const handleRetailerAuthSubmit = async (formData, mode) => {
		try {
			let result;

			if (mode === 'signup') {
				// Get current user's email for retailer signup
				const userData = localStorage.getItem('userData');
				const currentUser = userData ? JSON.parse(userData) : null;
				
				// Transform formData to match backend requirements
				const retailerData = {
					name: formData.name,
					description: formData.organisation, // Convert organisation to description
					email: currentUser?.email || formData.email || '', // Use current user's email
					password: formData.password
				};
				
				result = await signupRetailer(retailerData);
				toast.success('Retailer account created successfully!');
			} else {
				// For signin, we need email and password
				const userData = localStorage.getItem('userData');
				const currentUser = userData ? JSON.parse(userData) : null;
				
				const signinData = {
					email: currentUser?.email || formData.email || '',
					password: formData.password
				};
				
				result = await signinRetailer(signinData);
				toast.success('Retailer signin successful!');
			}

			// Store retailer information in localStorage
			localStorage.setItem('retailer_user', JSON.stringify(result));

			// Close the overlay
			setIsRetailerOverlayOpen(false);

			// Redirect to retailer dashboard
			navigate('/retailer-dashboard');

		} catch (error) {
			// Provide more specific error messages
			let errorMessage = error.message || `Retailer ${mode} failed. Please try again.`;
			
			if (errorMessage.includes("already exists")) {
				errorMessage = "You already have a retailer account with this email. Try signing in instead.";
			} else if (errorMessage.includes("invalid") || errorMessage.includes("401")) {
				errorMessage = "Invalid credentials. Please check your password.";
			} else if (errorMessage.includes("not found") || errorMessage.includes("404")) {
				errorMessage = "No retailer account found. Please create one first.";
			}
			
			toast.error(errorMessage);
		}
	};

	// Update goals when user drags points on the chart
	const handleGoalChange = async (monthIndex, newGoal) => {
		if (!user || !carbonData) return;

		try {
			// Get the actual month number (1-12) from the monthIndex
			const monthData = carbonData.monthlyData[monthIndex];
			const monthNumber = getMonthNumberFromName(monthData.month);

			// Update the backend
			await carbonGoalsService.updateCarbonGoal(user.id, monthNumber, newGoal);

			// Update local state
			setCarbonData(prev => ({
				...prev,
				monthlyData: prev.monthlyData.map((m, i) =>
					i === monthIndex ? { ...m, goal: newGoal } : m
				)
			}));

			toast.success('Carbon goal updated successfully!');
		} catch (error) {
			console.error('Error updating carbon goal:', error);
			toast.error('Failed to update carbon goal. Please try again.');
		}
	};

	// Helper function to convert month name to number
	const getMonthNumberFromName = (monthName) => {
		const months = {
			'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
			'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
		};
		return months[monthName] || 1;
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


	//ADDED FOR SECURITY TAB
	const handleChangePassword = async (passwordData) => {
  try {
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/users/changePassword`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        old_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        user_id: user.id
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to change password');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

const handleEnable2FA = async (twoFactorData) => {
  try {
    // TODO: Replace with actual API call
    const response = await fetch(`${API_BASE_URL}/users/verifyMFA`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        code: twoFactorData.code,
        user_id: user.id
      })
    });

    if (!response.ok) {
      const error = await response.json();
	  handleDisable2FA();
	  setIsTwoFactorModalOpen(false);
      throw new Error(error.message || 'Failed to enable 2FA');
    }

    setIs2FAEnabled(true);
    return await response.json();
  } catch (error) {
    throw error;
  }
};

const handleDisable2FA = async () => {
  try {
    // TODO: Replace with actual API call
	setIsTwoFactorModalOpen(false);
    const response = await fetch(`${API_BASE_URL}/users/disableMFA/${user.id}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${localStorage.getItem('token')}`
		}
    });
	
    if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Failed to disable 2FA');
    }
	
	setIs2FAEnabled(false);
    // return await response.json();
  } catch (error) {
    throw error;
  }
};

	if (!user) {
		return (
			<div className="account-container">
				<div className="account-error">
					<h2>Account Not Found</h2>
					<p>Please log in to view your account.</p>
					<button onClick={() => navigate('/login')} className="login-button">
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
					{/* <button onClick={logasRetailer} className="retailer-button">
						Sign as Retailer
					</button> */}
				</div>
			</div>

			<div className="account-content">
				{/* Tab Navigation */}
				<div className="account-tabs">
					<button
						className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
						onClick={() => setActiveTab('profile')}
					>
						Profile
					</button>
					<button
						className={`tab-button ${activeTab === 'carbon-footprint' ? 'active' : ''}`}
						onClick={() => setActiveTab('carbon-footprint')}
					>
						Carbon Footprint
					</button>
					<button
						className={`tab-button ${activeTab === 'forecasting' ? 'active' : ''}`}
						onClick={() => setActiveTab('forecasting')}
					>
						Sustainability Forecasting
					</button>
					{/*<button
						className={`tab-button ${activeTab === 'preferences' ? 'active' : ''}`}
						onClick={() => setActiveTab('preferences')}
					>
						⚙️ Preferences
					</button> */}
					<button
						className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
						onClick={() => setActiveTab('security')}
					>
						Security
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
										Edit Profile
									</button>
								) : (
									<div className="edit-actions">
										<button
											onClick={handleSaveChanges}
											className="save-button"
											disabled={isLoading}
										>
											Save Changes
										</button>
										<button
											onClick={handleCancelEdit}
											className="cancel-button"
										>
											 Cancel
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
											value={formData.dateOfBirth || ''}
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
							<h2>Your Sustainability Tracker</h2>
						</div>							{/* Explanation Section */}
							<div className="carbon-explanation">
								<h3>How Your Sustainability Score Works</h3>
								<div className="explanation-content">
									<p><strong>Your score is calculated from 0-100 based on the sustainability ratings of products you purchase:</strong></p>
									<ul>
										<li><span className="score-indicator excellent">85-100</span> Excellent - You're choosing highly sustainable products! </li>
										<li><span className="score-indicator good">70-84</span> Good - Great choices with room for improvement </li>
										<li><span className="score-indicator moderate">50-69</span> Moderate - Consider more eco-friendly alternatives </li>
										<li><span className="score-indicator poor">0-49</span> Needs Improvement - Focus on sustainable products </li>
									</ul>
									<p><em>Your monthly score is the average sustainability rating of all products in your orders for that month. Higher scores mean better environmental impact!</em></p>
								</div>
							</div>

							{isLoadingCarbonData ? (
								<div className="carbon-loading">
									<div className="loading-spinner"></div>
									<span>Loading your sustainability data...</span>
								</div>
							) : carbonData ? (
								<>
									{/* Sustainability Stats Overview */}
									<div className="carbon-overview">
										<div className="carbon-stat-card">
											<div className="carbon-stat-icon">�</div>
											<div className="carbon-stat-content">
												<h3>Average Score</h3>
												<div className="carbon-stat-value" style={{ color: getCarbonColor(carbonData.totalFootprint, 100) }}>
													{carbonData.totalFootprint}/100
												</div>
												<p className="carbon-stat-description">This year</p>
											</div>
										</div>

										<div className="carbon-stat-card">
											<div className="carbon-stat-icon">📅</div>
											<div className="carbon-stat-content">
												<h3>This Month</h3>
												<div className="carbon-stat-value" style={{ color: getCarbonColor(carbonData.monthlyFootprint) }}>
													{carbonData.monthlyFootprint}/100
												</div>
												
											</div>
										</div>

										<div className="carbon-stat-card">
											<div className="carbon-stat-icon">🎯</div>
											<div className="carbon-stat-content">
												<h3>Target Score</h3>
												<div className="carbon-stat-value">
													{carbonData.yearlyGoal}/100
												</div>
												<div className="progress-bar">
													<div
														className="progress-fill"
														style={{
															width: `${Math.min(yearlyProgress, 100)}%`,
															backgroundColor: yearlyProgress > 100 ? '#22c55e' : '#ef4444'
														}}
													></div>
												</div>
												<p className="carbon-stat-description">{yearlyProgress.toFixed(1)}% of target achieved</p>
											</div>
										</div>
									</div>

									{/* Monthly Trend Chart */}
									<div className="carbon-chart-section">
										<h3>📊 Monthly Sustainability Performance & Goals</h3>
										<div className="chart-description">
											<p>Track your sustainability progress and set monthly goals. Drag the goal markers on the chart to adjust your targets!</p>
										</div>
										<InteractiveCarbonChart
											monthlyData={carbonData.monthlyData}
											getCarbonColor={getCarbonColor}
											selectedTimeframe={selectedTimeframe}
											onGoalChange={handleGoalChange}
										/>
									</div>


								</>
							) : (
								<div className="carbon-error">
									<p>Unable to load carbon footprint data. Please try refreshing the page.</p>
									<button onClick={() => user && loadCarbonData(user.id)} className="retry-button">
										Retry
									</button>
								</div>
							)}
						</div>
					)}

					{/* NEW: Sustainability Forecasting Tab */}
					{activeTab === 'forecasting' && (
						<div className="forecasting-section">
							{/* Enhanced Header */}
							<div className="forecast-header">
								<div className="forecast-info">
									<h3>🔮 Sustainability Forecasting</h3>
									<p className="forecast-description">AI-powered predictions for your next 30 days of sustainability performance</p>
								</div>
								<button 
									onClick={() => loadForecastingData(user?.id)}
									className="refresh-forecast-btn"
									disabled={isLoadingForecast}
								>
									{isLoadingForecast ? '⏳ Loading...' : '🔄 Refresh Forecast'}
								</button>
							</div>

							{isLoadingForecast ? (
								<div className="forecasting-loading">
									<div className="loading-spinner"></div>
									<span>Generating your sustainability forecast...</span>
								</div>
							) : (
								<>
									{/* Check if user has no orders */}
									{forecastData && forecastData.forecast && forecastData.forecast.prediction_factors && 
									 forecastData.forecast.prediction_factors.data_points === 0 ? (
										<div className="no-orders-message">
											<div className="no-orders-icon">📦</div>
											<h3>No Order History Available</h3>
											<p>We need some purchase data to generate your sustainability forecast. Start shopping with us to see your personalized predictions!</p>
											<button 
												onClick={() => window.location.href = '/products'}
												className="start-shopping-btn"
											>
												�️ Start Shopping
											</button>
										</div>
									) : (
										<>
											{/* Enhanced User Score Overview */}
											{userScore && (
												<div className="user-score-overview">
													<div className="score-card main-score">
														<div className="score-icon">🏆</div>
														<div className="score-content">
															<div className="score-title-container">
																<h3 className="clickable-title" onClick={() => showHelp('Sustainability Level', 
																	'Your sustainability level is calculated based on your shopping habits, eco-conscious choices, and consistency in making sustainable decisions. The score ranges from 0-100 points across four key areas.')}>Your Sustainability Level</h3>
															</div>
															<div className="score-value" style={{ color: getCarbonColor(userScore.score) }}>
																{userScore.score}/100
															</div>
															<div className="score-level">{userScore.level}</div>
														</div>
													</div>
													
													{userScore.breakdown && (
														<div className="score-breakdown">
															<div className="breakdown-title-container">
																<h4 className="clickable-title" onClick={() => showHelp('Score Breakdown', 
																	'Your total sustainability score (100 points) is broken down into four components:\n\n• Eco Consciousness (30 points) - How often you choose sustainable products\n• Sustainability Trend (25 points) - Whether your choices are improving over time\n• Efficiency (25 points) - How well you optimize your carbon footprint\n• Consistency (20 points) - Regular sustainable shopping patterns')}>Score Breakdown</h4>
															</div>
															<div className="breakdown-items">
																<div className="breakdown-item clickable-card" onClick={() => showHelp('Eco Consciousness', 
																	'Measures how often you choose products with high sustainability ratings. Points are awarded based on the sustainability level of your purchases, with higher-rated products contributing more to your score.')}>
																	<span className="breakdown-label">Eco Consciousness</span>
																	<div className="breakdown-score">{userScore.breakdown.eco_consciousness}/30</div>
																</div>
																<div className="breakdown-item clickable-card" onClick={() => showHelp('Sustainability Trend', 
																	'Evaluates whether your sustainability performance is improving, stable, or declining over time. Recent purchases are weighted more heavily to reflect your current trajectory.')}>
																	<span className="breakdown-label">Sustainability Trend</span>
																	<div className="breakdown-score">{userScore.breakdown.sustainability_trend}/25</div>
																</div>
																<div className="breakdown-item clickable-card" onClick={() => showHelp('Efficiency', 
																	'Measures how well you optimize your carbon footprint relative to your spending and purchase patterns. Higher efficiency means achieving more value with lower environmental impact.')}>
																	<span className="breakdown-label">Efficiency</span>
																	<div className="breakdown-score">{userScore.breakdown.efficiency}/25</div>
																</div>
																<div className="breakdown-item clickable-card" onClick={() => showHelp('Consistency', 
																	'Rewards regular sustainable shopping patterns and consistent eco-friendly choices. Higher consistency indicates reliable commitment to sustainability over time.')}>
																	<span className="breakdown-label">Consistency</span>
																	<div className="breakdown-score">{userScore.breakdown.consistency}/20</div>
																</div>
															</div>
														</div>
													)}
												</div>
											)}									{/* Forecast Results */}
									{forecastData && forecastData.forecast && (
										<div className="forecast-results">
											<h3>📈 Forecast Results ({forecastHorizon} days)</h3>
											
											<div className="forecast-cards">
												<div className="forecast-card">
													<div className="forecast-icon">🎯</div>
													<div className="forecast-content">
														<h4>Predicted Score</h4>
														<div className="forecast-value" style={{ color: getCarbonColor(forecastData.forecast.predicted_sustainability_score) }}>
															{forecastData.forecast.predicted_sustainability_score.toFixed(1)}/100
														</div>
														<p className="forecast-description">
															Expected sustainability score in {forecastHorizon} days
														</p>
													</div>
												</div>

												<div className="forecast-card">
													<div className="forecast-icon">📊</div>
													<div className="forecast-content">
														<h4>Improvement Potential</h4>
														<div className="forecast-value">
															+{forecastData.forecast.improvement_potential.toFixed(1)}
														</div>
														<p className="forecast-description">
															Potential score improvement possible
														</p>
													</div>
												</div>

												<div className="forecast-card">
													<div className="forecast-icon">🎲</div>
													<div className="forecast-content">
														<h4>Confidence Level</h4>
														<div className="forecast-value">
															{(forecastData.forecast.confidence_score * 100).toFixed(0)}%
														</div>
														<p className="forecast-description">
															Forecast accuracy confidence
														</p>
													</div>
												</div>

												<div className="forecast-card">
													<div className="forecast-icon">📈</div>
													<div className="forecast-content">
														<h4>Trend Direction</h4>
														<div className={`forecast-value trend-${forecastData.forecast.trend_direction}`}>
															{forecastData.forecast.trend_direction === 'improving' ? '📈 Improving' :
															 forecastData.forecast.trend_direction === 'declining' ? '📉 Declining' : 
															 '➡️ Stable'}
														</div>
														<p className="forecast-description">
															Current sustainability trajectory
														</p>
													</div>
												</div>
											</div>

											{/* Enhanced Prediction Insights */}
											<div className="prediction-insights">
												<h4 className="clickable-title" onClick={() => showHelp('Prediction Analysis', 
													'Our AI analyzes your shopping patterns, sustainability choices, and behavioral trends to generate accurate predictions. The analysis considers factors like recent purchase patterns, seasonal variations, and goal achievement rates.')}>🔍 Detailed Analysis</h4>
												<div className="insights-grid">
													<div className="insight-card clickable-card" onClick={() => showHelp('Improvement Potential', 
														'Shows how much you could potentially improve your sustainability score through optimized choices. This represents the maximum achievable improvement based on your current shopping patterns.')}>
														<div className="insight-header">
															<div className="insight-icon">🎯</div>
															<div className="insight-title">Improvement Potential</div>
														</div>
														<div className="insight-value">+{forecastData.forecast.improvement_potential?.toFixed(1) || '0.0'}</div>
													</div>
													
													<div className="insight-card trend-card clickable-card" onClick={() => showHelp('Trend Direction', 
														'Indicates whether your sustainability performance is improving, stable, or declining based on recent patterns. This helps you understand your progress trajectory.')}>
														<div className="insight-header">
															<div className="insight-icon">📊</div>
															<div className="insight-title">Trend Direction</div>
														</div>
														<div className="insight-value">
															{forecastData.forecast.trend_direction === 'improving' ? '📈 Improving' :
															 forecastData.forecast.trend_direction === 'declining' ? '📉 Declining' : 
															 '➡️ Stable'}
														</div>
													</div>
													
													<div className="insight-card clickable-card" onClick={() => showHelp('Confidence Level', 
														'Indicates how accurate our prediction is likely to be. Higher confidence means more reliable forecasting based on sufficient data and consistent patterns.')}>
														<div className="insight-header">
															<div className="insight-icon">🎲</div>
															<div className="insight-title">Confidence Level</div>
														</div>
														<div className="insight-value">{(forecastData.forecast.confidence_score * 100).toFixed(0)}%</div>
													</div>
												</div>
											</div>
										</div>
									)}

									{/* Enhanced User Insights */}
									{userInsights && (
										<div className="user-insights">
											<h3>💡 Personalized Insights 
											</h3>
											
											{userInsights.shopping_patterns && (
												<div className="insights-section">
													<h4>🛍️ Shopping Patterns 
													</h4>
													<div className="insights-grid">
														<div className="insight-card">
															<div className="insight-header">
																<div className="insight-icon">📦</div>
																<div className="insight-title">Weekly Orders</div>
															</div>
															<div className="insight-value">{userInsights.shopping_patterns.avg_orders_per_week?.toFixed(1) || 'N/A'}</div>
														</div>
														<div className="insight-card">
															<div className="insight-header">
																<div className="insight-icon">🌱</div>
																<div className="insight-title">Eco Score</div>
															</div>
															<div className="insight-value">{userInsights.shopping_patterns.eco_consciousness_score?.toFixed(1) || 'N/A'}/100</div>
														</div>
														<div className="insight-card">
															<div className="insight-header">
																<div className="insight-icon">🎯</div>
																<div className="insight-title">Goal Achievement</div>
															</div>
															<div className="insight-value">{((userInsights.shopping_patterns.goals_achievement_rate || 0) * 100).toFixed(0)}%</div>
														</div>
													</div>
												</div>
											)}

											
										</div>
									)}

									{!forecastData && !isLoadingForecast && (
										<div className="forecast-error">
											<p>Unable to generate forecast. Please try refreshing or check back later.</p>
											<button 
												onClick={() => loadForecastingData(user?.id)}
												className="retry-forecast-btn"
											>
												Try Again
											</button>
										</div>
									)}
										</>
									)}
								</>
							)}
						</div>
					)}

					{/* Enhanced Preferences Tab */}
					{/* {activeTab === 'preferences' && (
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
					)} */}

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
									<button className="security-button"
									onClick={() => setIsChangePasswordModalOpen(true)}>
										Change Password
									</button>
								</div>

								{/* <div className="security-item">
									<div className="security-info">
										<h3>Two-Factor Authentication</h3>
										<p>Add an extra layer of security to your account</p>
									</div>
									<button className="security-button">
										Enable 2FA
									</button>
								</div> */}

								<div className="security-item">
									<div className="security-info">
										<h3>Two-Factor Authentication</h3>
										<p>
										{is2FAEnabled 
											? 'Extra security is currently enabled for your account' 
											: 'Add an extra layer of security to your account'
										}
										</p>
									</div>
									<button 
										className={`security-button ${is2FAEnabled ? 'enabled' : ''}`}
										onClick={() => setIsTwoFactorModalOpen(true)}
									>
										{is2FAEnabled ? 'Manage 2FA' : 'Enable 2FA'}
									</button>
									</div>

								{/* <div className="security-item">
									<div className="security-info">
										<h3>Login History</h3>
										<p>View recent login activity and manage active sessions</p>
									</div>
									<button className="security-button">
										View History
									</button>
								</div> */}

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
			<ConfirmationModal {...confirmationState} />
			<RetailerAuthOverlay
				isOpen={isRetailerOverlayOpen}
				onClose={() => setIsRetailerOverlayOpen(false)}
				onSubmit={handleRetailerAuthSubmit}
			/>

			<ChangePasswordModal
			isOpen={isChangePasswordModalOpen}
			onClose={() => setIsChangePasswordModalOpen(false)}
			onPasswordChange={handleChangePassword}
			/>

			<TwoFactorModal
			isOpen={isTwoFactorModalOpen}
			onClose={() => setIsTwoFactorModalOpen(false)}
			onEnable2FA={handleEnable2FA}
			onDisable2FA={handleDisable2FA}
			is2FAEnabled={is2FAEnabled}
			userId={user?.id}
			/>

			{/* Help Modal */}
			<HelpModal
				isOpen={showHelpModal}
				onClose={closeHelpModal}
				title={helpModalContent.title}
				content={helpModalContent.content}
			/>
		</div>
	);
}