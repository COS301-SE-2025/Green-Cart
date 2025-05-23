import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSearch } from "../search/SearchProvider";
import CartIcon from "../../assets/icons/cart.png";
import "../styles/navigation/Navigation.css"; 

export default function Navigation() {
    const navigate = useNavigate();
    const location = useLocation();
    const { clearSearch } = useSearch();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const isMobileView = windowWidth <= 480;
    const cartQuantity = 1;
    
    // Track window size and close mobile menu when resizing
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            
            // Close mobile menu when screen gets larger
            if (window.innerWidth > 480 && mobileMenuOpen) {
                setMobileMenuOpen(false);
            }
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [mobileMenuOpen]);
    
    // Prevent body scrolling when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        
        // Cleanup function
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);
    
    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const handleLogoClick = (e) => {
        e.preventDefault();
        console.log('Logo clicked - navigating to Home');
        
        // Close mobile menu if open
        if (mobileMenuOpen) {
            setMobileMenuOpen(false);
        }
        
        // Only clear search and navigate if not already on Home
        if (location.pathname !== '/Home') {
            clearSearch();
            navigate('/Home', { replace: true });
        }
    };

    const handleMobileMenuClick = (e) => {
        // Close mobile menu when clicking on a link
        setMobileMenuOpen(false);
        
        // If it's the home link, also handle logo click logic
        if (e.target.textContent === 'Home') {
            handleLogoClick(e);
        }
    };
    
    return (
        <>
            <nav className="navigation">
                <div className="nav__left">
                    {/* Mobile menu toggle button - only shown on mobile */}
                    {isMobileView && (
                        <button 
                            className={`nav__mobile-toggle ${mobileMenuOpen ? 'active' : ''}`} 
                            onClick={toggleMobileMenu}
                            aria-label="Toggle menu"
                            aria-expanded={mobileMenuOpen}
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    )}
                    
                    {/* Logo - always visible */}
                    <Link 
                        to="/Home" 
                        className="nav__logo" 
                        onClick={handleLogoClick}
                        title="GreenCart - Go to Home"
                    >
                        GREENCART
                    </Link>

                    {/* Left navigation links - hidden on mobile */}
                    <ul className="nav__links nav__links--left">
                        <li><Link to="/about">About Us</Link></li> | 
                        <li><Link to="/help">Help Center</Link></li>
                    </ul>
                </div>

                {/* Right navigation links */}
                <ul className="nav__links nav__links--right">
                    <li><Link to="/logout">Logout</Link></li> 
                    <li><Link to="/orders">Orders</Link></li> 
                    <li><Link to="/my-account">My Account</Link></li>
                    <li className="nav__cart">
                        <Link 
                            to="/cart" 
                            aria-label={`Cart with ${cartQuantity} item${cartQuantity !== 1 ? 's' : ''}`}
                            title={`Shopping Cart (${cartQuantity} item${cartQuantity !== 1 ? 's' : ''})`}
                        >
                            <img 
                                src={CartIcon} 
                                alt="Shopping Cart" 
                                className="nav__cart-icon" 
                                onError={(e) => {
                                    console.error('Cart icon failed to load:', e);
                                    e.target.style.display = 'none';
                                }}
                            />
                            {cartQuantity > 0 && (
                                <span className="nav__cart-badge">{cartQuantity}</span>
                            )}
                        </Link>
                    </li>
                </ul>
            </nav>
            
            {/* Mobile menu and overlay - only rendered on mobile */}
            {isMobileView && (
                <>
                    {/* Mobile menu */}
                    <div className={`nav__mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
                        <ul className="nav__links">
                            <li>
                                <Link 
                                    to="/Home"
                                    onClick={handleMobileMenuClick}
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/about" 
                                    onClick={handleMobileMenuClick}
                                >
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/help" 
                                    onClick={handleMobileMenuClick}
                                >
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/logout" 
                                    onClick={handleMobileMenuClick}
                                >
                                    Logout
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/orders" 
                                    onClick={handleMobileMenuClick}
                                >
                                    Orders
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/my-account" 
                                    onClick={handleMobileMenuClick}
                                >
                                    My Account
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/cart" 
                                    onClick={handleMobileMenuClick}
                                >
                                    Cart {cartQuantity > 0 && `(${cartQuantity})`}
                                </Link>
                            </li>
                        </ul>
                    </div>
                    
                    {/* Overlay */}
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