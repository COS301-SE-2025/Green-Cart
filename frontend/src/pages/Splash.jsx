import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles/Splash.css';

const Splash = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleShopNow = () => {
    navigate('/Home');
  };

  return (
    <div className={`splash-container ${isLoaded ? 'loaded' : ''}`}>
      
      {/* Gradient overlay */}
      <div className="overlay"></div>
      
      {/* Navigation Header */}
      <nav className="navigation_">
        <div className="nav-links">
          {[
            { name: 'Sign-up', path: '/Register' },
            { name: 'Sign-in', path: '/Login' },
            { name: 'About', path: '/about' },
            { name: 'Contact', path: '/contact' }
          ].map((item, index) => (
            <Link
              key={item.name}
              to={item.path}
              className="nav-link"
              style={{ animationDelay: `${(index + 1) * 150}ms` }}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        
        {/* Main Heading */}
        <h1 className="main-heading">
          Sustainable Living<br />
          Made Easy.
        </h1>

        {/* Subtitle */}
        <p className="subtitle">
          Start your planet positive journey today
        </p>

        {/* Shop Now Button */}
        <div className="button-container">
          <button
            onClick={handleShopNow}
            className="shop-button"
          >
            <span>Shop now</span>
          </button>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="decorative-line"></div>
      
      {/* Floating particles */}
      <div className="particle particle-1"></div>
      <div className="particle particle-2"></div>
      <div className="particle particle-3"></div>
    </div>
  );
};

export default Splash;