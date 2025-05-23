import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CartIcon from "../../assets/icons/cart.png";  // cart icon
import "../styles/navigation/Navigation.css"; 

export default function Navigation() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const isMobileView = windowWidth <= 480;
    const cartQuantity = 1; // will replace with the actual cart quantity from the context or state management
    
    // Track window size and close mobile menu when resizing
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
    
    // Prevent body scrolling when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);
    
    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
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
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    )}
                    
                    <Link to="/Home" className="nav__logo">
                        GREENCART
                    </Link>

                    <ul className="nav__links nav__links--left">
                        <li><Link to="/about">About Us</Link></li> | 
                        <li><Link to="/help">Help Center</Link></li>
                    </ul>
                </div>

                <ul className="nav__links nav__links--right">
                    <li><Link to="/logout">Logout</Link></li> |
                    <li><Link to="/orders">Orders</Link></li> |
                    <li><Link to="/my-account">My Account</Link></li>
                    <li className="nav__cart">
                        <Link to="/cart">
                            <img src={CartIcon} alt="Cart" className="nav__cart-icon" />
                            {cartQuantity > 0 && (
                                <span className="nav__cart-badge">{cartQuantity}</span>
                            )}
                        </Link>
                    </li>
                </ul>
            </nav>
            
            {/* Mobile menu and overlay - should only be rendered on mobile */}
            {isMobileView && (
                <>
                    <div className={`nav__mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
                        <ul className="nav__links">
                            <li><Link to="/Home" onClick={() => setMobileMenuOpen(false)}>Home</Link></li>
                            <li><Link to="/about" onClick={() => setMobileMenuOpen(false)}>About Us</Link></li>
                            <li><Link to="/help" onClick={() => setMobileMenuOpen(false)}>Help Center</Link></li>
                            <li><Link to="/logout" onClick={() => setMobileMenuOpen(false)}>Logout</Link></li>
                            <li><Link to="/orders" onClick={() => setMobileMenuOpen(false)}>Orders</Link></li>
                            <li><Link to="/my-account" onClick={() => setMobileMenuOpen(false)}>My Account</Link></li>
                            <li><Link to="/cart" onClick={() => setMobileMenuOpen(false)}>Cart</Link></li>
                        </ul>
                    </div>
                    
                    {mobileMenuOpen && (
                        <div 
                            className="nav__overlay active"
                            onClick={() => setMobileMenuOpen(false)}
                        ></div>
                    )}
                </>
            )}
        </>
    );
}