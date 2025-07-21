import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSearch } from "../search/SearchProvider";
import { useCart } from "../cart/CartContext";
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

    const returnToLogin = (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
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
                    {/* <li><Link to="/logout" onClick={returnToLogin}>Logout</Link></li> */}
                    <li><Link to="/orders">Orders</Link></li>
                    <li className="nav__separator">|</li>
                    {/*NOTE: have to check if user is a retailer to display Dashboard link  */}
                    <li><Link to="/retailer-dashboard">Dashboard</Link></li>
                    <li className="nav__separator">|</li>
                    <li><Link to="/user-account">My Account</Link></li>
                    <li className="nav__separator">|</li>
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
                            <li><Link to="/logout" onClick={returnToLogin}>Logout</Link></li>
                            <li><Link to="/orders" onClick={handleMobileMenuClick}>Orders</Link></li>
                            <li><Link to="/retailer-dashboard" onClick={handleMobileMenuClick}>Dashboard</Link></li>
                            <li><Link to="/user-account" onClick={handleMobileMenuClick}>My Account</Link></li>
                            <li><Link to="/cart" onClick={handleMobileMenuClick}>
                                Cart {cartQuantity > 0 && `(${cartQuantity})`}
                            </Link></li>
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