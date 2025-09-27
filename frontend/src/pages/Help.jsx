import React, { useState } from 'react';
import './styles/Help.css';
import helpBackgroundImage from '../assets/images/help-green.avif';

import { 
  FaRocket, 
  FaQuestionCircle, 
  FaBook, 
  FaPhone,
  FaUser,
  FaShoppingCart,
  FaHome,
  FaBoxOpen,
  FaComments,
  FaEnvelope,
  FaSearch
} from 'react-icons/fa';


const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const helpContent = {
    'getting-started': {
      title: 'Getting Started',
      icon: <FaRocket className="hp-help-icon" />,
      sections: [
        {
          title: 'Welcome to GreenCart!',
          content: `Here's how to quickly start using the platform:`
        },
        {
          title: '1. Create an Account',
          content: `• Click "My Account" in the top-right corner and select Sign Up
• Enter your email, password, and verify your account
• Complete your profile with basic information`
        },
        {
          title: '2. Browse Products',
          content: `• Use the search bar to find specific products
• Explore categories from the navigation menu
• Filter products by type, brand, or sustainability rating
• Check product sustainability scores before purchasing`
        },
        {
          title: '3. Add to Cart',
          content: `• On any product page, click "Add to Cart"
• Your cart is linked to your profile and automatically saved
• Adjust quantities directly in your cart
• View estimated carbon footprint of your purchases`
        },
        {
          title: '4. Checkout',
          content: `• Navigate to your cart and click "Proceed to Checkout"
• Enter your shipping details and payment information
• Choose from standard, express, or eco-friendly shipping options
• Confirm the order and track delivery via Orders page`
        },
        {
          title: '5. Set Preferences',
          content: `• In My Account, adjust settings like:
  - Delivery address and contact information
  - Email and SMS notification preferences
  - Sustainability filter preferences
  - Carbon footprint tracking goals`
        }
      ]
    },
    'faqs': {
      title: 'Frequently Asked Questions',
      icon: <FaQuestionCircle className="hp-help-icon" />,
      sections: [
        {
          title: 'Account & Orders',
          content: `Q: How do I reset my password?
A: Click "Forgot Password" on the login page and follow the email instructions.

Q: How can I track my order?
A: Go to "My Account" > "Orders" to view real-time tracking information.

Q: Can I modify or cancel my order?
A: Orders can be modified within 30 minutes of placement. Contact support for cancellations.`
        },
        {
          title: 'Sustainability Features',
          content: `Q: What does the sustainability rating mean?
A: Our ratings (0-100) consider factors like manufacturing, materials, packaging, and end-of-life impact.

Q: How accurate is my carbon footprint tracking?
A: We use industry-standard calculations based on product lifecycle assessments and shipping methods.

Q: What are Green Points?
A: Earn points for sustainable purchases and redeem them for discounts on future orders.`
        },
        {
          title: 'Shipping & Returns',
          content: `Q: What shipping options are available?
A: Standard (3-5 days), Express (1-2 days), and Eco-Friendly (5-7 days with carbon-neutral shipping).

Q: What's your return policy?
A: 30-day returns for most items. Sustainable packaging materials are reused when possible.

Q: Do you ship internationally?
A: Currently, we ship within South Africa. International shipping coming soon!`
        }
      ]
    },
    'how-to': {
      title: 'How-To Guides',
      icon: <FaBook className="hp-help-icon" />,
      sections: [
        {
          title: 'Using Filters & Search',
          content: `• Use the filter sidebar to narrow down products by:
  - Category (Electronics, Fashion, Home & Garden, etc.)
  - Price range
  - Sustainability rating
  - Stock availability
• Sort results by price, name, or newest arrivals
• Save your favorite filter combinations for quick access`
        },
        {
          title: 'Understanding Product Pages',
          content: `• View detailed sustainability breakdowns
• Check multiple product images
• Read customer reviews and ratings
• Compare similar products
• See estimated delivery dates
• View carbon footprint impact`
        },
        {
          title: 'Managing Your Carbon Footprint',
          content: `• Set monthly carbon footprint goals in your account
• View detailed breakdowns by category
• Track progress over time with interactive charts
• Get personalized recommendations to reduce impact
• Earn achievements for sustainable choices`
        },
        {
          title: 'Payment & Checkout Tips',
          content: `• Save multiple payment methods for faster checkout
• Use Green Points to reduce order totals
• Choose eco-friendly shipping when possible
• Bundle orders to reduce packaging waste
• Set up auto-delivery for regular purchases`
        }
      ]
    },
    'contact': {
      title: 'Contact Support',
      icon: <FaPhone className="hp-help-icon" />,
      sections: [
        {
          title: 'Get Help',
          content: `Still need assistance? We're here to help!

📧 Email: support@greencart.co.za
📞 Phone: +27 (0) 11 123 4567
💬 Live Chat: Available 9 AM - 6 PM (Mon-Fri)

🏢 Address:
GreenCart Support Center
123 Sustainability Street
Pretoria, 8001
South Africa`
        },
        {
          title: 'Response Times',
          content: `• Live Chat: Instant during business hours
• Email: Within 24 hours
• Phone: Immediate during business hours
• Complex Issues: 2-3 business days

Business Hours: Monday - Friday, 9 AM - 6 PM (SAST)`
        }
      ]
    }
  };

  const handleCategoryClick = (categoryKey) => {
    setSelectedCategory(selectedCategory === categoryKey ? null : categoryKey);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const getFilteredContent = () => {
    if (!searchQuery) return helpContent;
    
    const filtered = {};
    Object.entries(helpContent).forEach(([key, category]) => {
      const matchingSections = category.sections.filter(section =>
        section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (matchingSections.length > 0) {
        filtered[key] = {
          ...category,
          sections: matchingSections
        };
      }
    });
    
    return filtered;
  };

  const filteredContent = getFilteredContent();

  return (
    <div className="help-container">
      {/* Hero Section with Background Image */}
      <div className="help-hero"
      style={{backgroundImage: `url(${helpBackgroundImage})`}}>
        <div className="help-hero-content">
          <h1 className="help-title">Help Center</h1>
          <div className="help-search-container">
            <div className="help-search-box">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search for help..." 
                className="help-search-input"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="help-main-content">
        <div className="help-content-wrapper">
          <h2 className="help-main-title">How can we help?</h2>
          <p className="help-description">
            From account settings, permissions and personalisation find everything GreenCart.<br />
            Have a more specific issue? Ask <span className="terrabot-link">TerraBot</span>.
          </p>

          {/* Help Categories */}
          <div className="help-categories">
            {Object.entries(filteredContent).map(([key, category]) => (
              <div 
                key={key}
                className={`help-category-card ${selectedCategory === key ? 'expanded' : ''}`}
                onClick={() => handleCategoryClick(key)}
              >
                <div className="category-header">
                  <span className="category-icon">{category.icon}</span> {/* Now using React Icons */}
                  <div className="category-text">
                    <h3 className="category-title">{category.title}</h3>
                    <p className="category-description">
                      {key === 'getting-started' && 'Learn how to quickly get the most out of GreenCart.'}
                      {key === 'faqs' && 'Answers to most commonly asked questions.'}
                      {key === 'how-to' && 'Step-by-step guides for using GreenCart features.'}
                      {key === 'contact' && 'Get in touch with our support team.'}
                    </p>
                  </div>
                  <span className={`expand-icon ${selectedCategory === key ? 'rotated' : ''}`}>
                    ▼
                  </span>
                </div>
                
                {selectedCategory === key && (
                  <div className="category-content">
                    {category.sections.map((section, index) => (
                      <div key={index} className="help-section">
                        <h4 className="section-title">{section.title}</h4>
                        <div className="section-content">
                          {section.content.split('\n').map((line, lineIndex) => (
                            <p key={lineIndex} className="content-line">
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Links with Icons */}
          <div className="quick-links-section">
            <h3 className="quick-links-title">Quick Links</h3>
            <div className="quick-links-grid">
              <a href="/user-account" className="quick-link-card">
                <FaUser className="quick-link-icon" /> {/* Replaced 👤 */}
                <span className="quick-link-text">My Account</span>
              </a>
              <a href="/orders" className="quick-link-card">
                <FaBoxOpen className="quick-link-icon" /> {/* Replaced 📦 */}
                <span className="quick-link-text">Track Orders</span>
              </a>
              <a href="/cart" className="quick-link-card">
                <FaShoppingCart className="quick-link-icon" /> {/* Replaced 🛒 */}
                <span className="quick-link-text">My Cart</span>
              </a>
              <a href="/Home" className="quick-link-card">
                <FaHome className="quick-link-icon" /> {/* Replaced 🏠 */}
                <span className="quick-link-text">Browse Products</span>
              </a>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="contact-cta">
            <h3>Still need help?</h3>
            <p>Our support team is ready to assist you with any questions.</p>
            <div className="contact-buttons">
              <button className="contact-btn primary">
                <FaComments /> Start Live Chat {/* Replaced 💬 */}
              </button>
              <button className="contact-btn secondary">
                <FaEnvelope /> Email Support {/* Replaced 📧 */}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;