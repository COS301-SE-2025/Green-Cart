import React from 'react';
import './Help.css';

const Help = () => {
  return (
    <div className="help-container">
      {/* Hero Section with Background Image */}
      <div className="help-hero">
        <div className="help-hero-content">
          <h1 className="help-title">Help Center</h1>
          <div className="help-search-container">
            <div className="help-search-box">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input 
                type="text" 
                placeholder="Search for help..." 
                className="help-search-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="help-main-content">
        <div className="help-content-wrapper">
          <h2 className="help-main-title">How can we help?</h2>
          <p className="help-description">
            From account settings, permissions and personalisation find everything Green-cart<br />
            Have a more specific issue? Ask <span className="terrabot-link">TerraBot</span>.
          </p>

          {/* Help Categories */}
          <div className="help-categories">
            <div className="help-category-card">
              <h3 className="category-title">Getting Started</h3>
              <p className="category-description">
                Learn how to quickly get the most out of Green-cart.
              </p>
            </div>

            <div className="help-category-card">
              <h3 className="category-title">FAQs</h3>
              <p className="category-description">
                Answers to most commonly asked questions.
              </p>
            </div>

            <div className="help-category-card">
              <h3 className="category-title">How To</h3>
              <p className="category-description">
                Here you can find various tips on how to do things in Green-cart
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;