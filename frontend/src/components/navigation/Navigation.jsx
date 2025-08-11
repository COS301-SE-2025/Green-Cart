import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSearch } from "../search/SearchProvider";
import { useCart } from "../cart/CartContext";
import toast from 'react-hot-toast';
import CartIcon from "../../assets/icons/cart.png";
import Logo from "../../assets/images/logo.png";
import "../styles/navigation/Navigation.css";

export default function Navigation() {
    const navigate = useNavigate();
    const location = useLocation();
    const { clearSearch } = useSearch();
    const { cartItems } = useCart();
    const cartQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const isMobileView = windowWidth <= 480;

    // Check if user is a retailer and if user is authenticated
    const [isRetailer, setIsRetailer] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuthStatus = () => {
            const retailerData = localStorage.getItem('retailer_user');
            const userData = localStorage.getItem('userData') || localStorage.getItem('user');
            
            console.log('Navigation Auth Check:', {
                userData: !!userData,
                retailerData: !!retailerData
            });
            
            // User is a retailer if they have retailer data
            const isCurrentlyRetailer = !!retailerData;
            
            // User is authenticated if they have either user or retailer authentication
            const isCurrentlyAuthenticated = !!userData || isCurrentlyRetailer;
            
            console.log('Auth Status:', {
                isCurrentlyRetailer,
                isCurrentlyAuthenticated
            });
            
            setIsRetailer(isCurrentlyRetailer);
            setIsAuthenticated(isCurrentlyAuthenticated);
        };

        // Check auth status on component mount
        checkAuthStatus();

        // Listen for storage changes to update navbar in real-time
        const handleStorageChange = (e) => {
            if (['user', 'userData', 'retailer_user', 'token', 'retailer_token'].includes(e.key)) {
                console.log('Storage change detected:', e.key);
                checkAuthStatus();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        
        // Also listen for custom events when localStorage changes in the same tab
        const handleCustomStorageChange = () => {
            console.log('Custom auth-change event triggered');
            checkAuthStatus();
        };
        
        window.addEventListener('authStateChanged', handleCustomStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('authStateChanged', handleCustomStorageChange);
        };
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            if (window.innerWidth > 480 && mobileMenuOpen) {
                setMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [mobileMenuOpen]);

    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

    const handleLogoClick = (e) => {
        e.preventDefault();
        if (mobileMenuOpen) setMobileMenuOpen(false);
        if (location.pathname !== '/Home') {
            clearSearch();
            navigate('/Home', { replace: true });
        }
    };

    const handleMobileMenuClick = (e) => {
        setMobileMenuOpen(false);
        if (e.target.textContent === 'Home') handleLogoClick(e);
    };

    const handleLogout = (e) => {
        e.preventDefault();
        
        // Clear all possible authentication data
        localStorage.removeItem("userData");
        localStorage.removeItem("retailerData");
        localStorage.removeItem("user"); // legacy key
        localStorage.removeItem("token"); // legacy key
        localStorage.removeItem("retailer_user");
        localStorage.removeItem("retailer_token");
        localStorage.removeItem("selected_shop");
        
        // Dispatch event to update navbar
        window.dispatchEvent(new Event('authStateChanged'));
        
        // Close mobile menu if open
        if (mobileMenuOpen) setMobileMenuOpen(false);
        
        // Show success message
        toast.success('Logged out successfully');
        
        // Navigate to home/splash page
        navigate("/", { replace: true });
    };

    return (
        <>
            <nav className="navigation">
                <div className="nav__left">
                    {isMobileView && (
                        <button
                            className={`nav__mobile-toggle ${mobileMenuOpen ? 'active' : ''}`}
                            onClick={toggleMobileMenu}
                            aria-label="Toggle menu"
                            aria-expanded={mobileMenuOpen}
                        >
                            <span></span><span></span><span></span>
                        </button>
                    )}

                    <Link
                        to="/Home"
                        className="nav__logo"
                        onClick={handleLogoClick}
                        title="GreenCart - Go to Home"
                    >
                        <img src={Logo} alt="GreenCart" className="nav__logo-image" />
                    </Link>

                    <ul className="nav__links nav__links--left">
                        <li><Link to="/about">About Us</Link></li>
                        <li className="nav__separator">|</li>
                        <li><Link to="/help">Help Center</Link></li>
                    </ul>
                </div>

                <ul className="nav__links nav__links--right">
                    <li><Link to="/orders">Orders</Link></li>
                    <li className="nav__separator">|</li>
                    {/* Only show Dashboard link for retailers */}
                    {isRetailer && (
                        <>
                            <li><Link to="/retailer-dashboard">Dashboard</Link></li>
                            <li className="nav__separator">|</li>
                        </>
                    )}
                    <li><Link to="/user-account">My Account</Link></li>
                    <li className="nav__separator">|</li>
                    {/* Show logout only if user is authenticated */}
                    {isAuthenticated && (
                        <>
                            <li>
                                <button 
                                    onClick={handleLogout}
                                    className="nav__logout-btn"
                                    title="Logout"
                                >
                                    Logout
                                </button>
                            </li>
                            <li className="nav__separator">|</li>
                        </>
                    )}
                    <li className="nav__cart">
                        <Link
                            to="/cart"
                            aria-label={`Cart with ${cartQuantity} item${cartQuantity !== 1 ? 's' : ''}`}
                            title={`Shopping Cart (${cartQuantity})`}
                        >
                            <img
                                src={CartIcon}
                                alt="Shopping Cart"
                                className="nav__cart-icon"
                            />
                            {cartQuantity > 0 && (
                                <span className="nav__cart-badge">{cartQuantity}</span>
                            )}
                        </Link>
                    </li>
                </ul>
            </nav>

            {isMobileView && (
                <>
                    <div className={`nav__mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
                        <ul className="nav__links">
                            <li><Link to="/Home" onClick={handleMobileMenuClick}>Home</Link></li>
                            <li><Link to="/about" onClick={handleMobileMenuClick}>About Us</Link></li>
                            <li><Link to="/help" onClick={handleMobileMenuClick}>Help Center</Link></li>
                            <li><Link to="/orders" onClick={handleMobileMenuClick}>Orders</Link></li>
                            {/* Only show Dashboard link for retailers in mobile menu */}
                            {isRetailer && (
                                <li><Link to="/retailer-dashboard" onClick={handleMobileMenuClick}>Dashboard</Link></li>
                            )}
                            <li><Link to="/user-account" onClick={handleMobileMenuClick}>My Account</Link></li>
                            <li><Link to="/cart" onClick={handleMobileMenuClick}>
                                Cart {cartQuantity > 0 && `(${cartQuantity})`}
                            </Link></li>
                            {/* Show logout only if user is authenticated */}
                            {isAuthenticated && (
                                <li>
                                    <button 
                                        onClick={handleLogout}
                                        className="nav__logout-btn nav__logout-btn--mobile"
                                    >
                                        Logout
                                    </button>
                                </li>
                            )}
                        </ul>
                    </div>

                    {mobileMenuOpen && (
                        <div
                            className="nav__overlay active"
                            onClick={() => setMobileMenuOpen(false)}
                            aria-label="Close menu"
                        ></div>
                    )}
                </>
            )}
        </>
    );
}