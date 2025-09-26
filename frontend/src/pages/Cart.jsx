import React, { useState, useEffect} from "react";
import "./styles/Cart.css";
import { useCart } from "../components/cart/CartContext";
import { useNavigate } from "react-router-dom";
import EcoMeterSummary from '../components/smart/EcoMeterSummary';

export default function Cart() {
  const { cartItems, remove_From_Cart, add_To_Cart, refreshCart, cartID } = useCart();
  const navigate = useNavigate();
  const [shippingOption, setShippingOption] = useState("standard");
  const [carbonOffsetDonation, setCarbonOffsetDonation] = useState(0);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [selectedInitiative, setSelectedInitiative] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userId = JSON.parse(localStorage.getItem("userData"));
    if (userId) {
      if(!refresh){
        refreshCart(userId.id);
        setRefresh(true);
      } 
    }else navigate("/login");
  }, [refreshCart]);





  const userId = JSON.parse(localStorage.getItem("userData"));

  if(!userId) {
    navigate("/login");
    return null; // Prevent rendering if user is not logged in
  }

  if(!refresh){
    refreshCart(userId.id);
    setRefresh(true);
  }

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.data.price) * item.quantity, 0);

    // Ensure shipping option is always valid based on cart total
  useEffect(() => {
    if (subtotal < 500 && shippingOption === "free") {
      setShippingOption("standard");
    } else if (subtotal >= 500) {
      setShippingOption("free");
    }
  }, [subtotal]); // Run when subtotal changes

  // Apply free shipping if subtotal >= R500, otherwise use selected shipping option
  const getShippingCost = () => {
    if (subtotal >= 500) {
      return 0; // Free shipping for orders over R500
    }
    
    // Prevent free shipping selection if order is under R500
    if (shippingOption === "free" && subtotal < 500) {
      setShippingOption("standard"); // Reset to standard if user somehow selected free
      return 73.99;
    }
    
    switch (shippingOption) {
      case "standard":
        return 73.99;
      case "express":
        return 149.99;
      case "free":
        return 0; // This should only be reached if subtotal >= 500
      default:
        return 73.99;
    }
  };

  const shippingCost = getShippingCost();
  const totalWithoutDonation = subtotal + shippingCost;
  const finalTotal = totalWithoutDonation + carbonOffsetDonation;

  // Calculate EcoMeter - Average sustainability rating of all cart items
  const calculateEcoMeter = () => {
    if (cartItems.length === 0) return 0;
    
    // Calculate simple average of all product sustainability ratings
    let totalRating = 0;
    let itemCount = 0;
    
    cartItems.forEach(item => {
      // Use the item's sustainability rating (from the averaged score calculation) or default to 30 (poor)
      const rating = item.sustainability?.rating || 30;
      totalRating += rating;
      itemCount++;
    });
    
    return itemCount > 0 ? Math.round(totalRating / itemCount) : 30;
  };

  const baseEcoMeter = calculateEcoMeter();
  
  // Improve EcoMeter based on donation amount (donation shows environmental consciousness)
  const getEcoMeterImprovement = () => {
    if (carbonOffsetDonation === 0) return 0;
    
    // Calculate improvement based on donation amount relative to cart value
    const donationRatio = carbonOffsetDonation / (subtotal || 1);
    
    // Higher donations = better improvement (max 25 points)
    if (donationRatio >= 0.05) return 25; // R10+ donation on R200 cart
    if (donationRatio >= 0.03) return 20; // R10+ on R300+ cart  
    if (donationRatio >= 0.02) return 15; // R10+ on R500+ cart
    if (donationRatio >= 0.01) return 10; // R10+ on R1000+ cart
    return 5; // Any donation gets some improvement
  };

  const ecoMeterImprovement = getEcoMeterImprovement();
  const finalEcoMeter = Math.min(100, baseEcoMeter + ecoMeterImprovement);

  // Get EcoMeter color and level
  const getEcoMeterColor = (rating) => {
    if (rating >= 80) return '#22c55e'; // Green - excellent
    if (rating >= 60) return '#eab308'; // Yellow - good
    if (rating >= 40) return '#f97316'; // Orange - moderate
    return '#ef4444'; // Red - poor
  };

  const getEcoMeterLevel = (rating) => {
    if (rating >= 80) return 'Excellent';
    if (rating >= 60) return 'Good';
    if (rating >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  // Environmental initiatives
  const environmentalInitiatives = [
    {
      id: "reforestation",
      name: "Reforestation Projects",
      description: "Plant trees to absorb CO2 and restore natural habitats",
      impact: "1 tree planted per R10 donated"
    },
    {
      id: "renewable",
      name: "Renewable Energy",
      description: "Support solar and wind energy projects in South Africa",
      impact: "Powers 1 home for 1 day per R20 donated"
    },
    {
      id: "ocean",
      name: "Ocean Conservation",
      description: "Marine cleanup and plastic waste reduction initiatives",
      impact: "1kg of ocean plastic removed per R30 donated"
    },
    {
      id: "wildlife",
      name: "Wildlife Protection",
      description: "Protect endangered species and their ecosystems",
      impact: "Supports 1 animal for 1 week per R15 donated"
    }
  ];

  // Function to apply carbon offset donation
  const applyDonation = (amount, initiativeId) => {
    setCarbonOffsetDonation(amount);
    setSelectedInitiative(initiativeId);
    setShowDonationModal(false);
  };

  const removeDonation = () => {
    setCarbonOffsetDonation(0);
    setSelectedInitiative("");
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <div className="empty-cart">
          <h2>My Cart</h2>
          <p>Your cart is empty.</p>
          <button 
            className="btn-primary"
            onClick={() => navigate("/Home")}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-content">
        {/* Left Column - Cart Items */}
        <div className="cart-items-section">
          <div className="cart-header">
            <h2>My Cart</h2>
            <span className="item-count">{cartItems.length} Items</span>
          </div>
          
          <div className="cart-table-header">
            <span>PRODUCT DETAILS</span>
            <span>QUANTITY</span>
            <span>PRICE</span>
            <span>TOTAL</span>
          </div>

          <div className="cart-items-list">
            {cartItems.map((item, i) => (
              <div key={i} className={loading ? "cart-item-row-loading" : "cart-item-row"}>
                <div className="product-cart-details">
                  <img
                    src={item.images[0]}
                    alt={item.data.name}
                    className="product-cart-image"
                  />
                  <div className="product-cart-info">
                    <h4>{item.data.name}</h4>
                    <p className="product-cart-brand">{item.data.brand || 'Green Cart'}</p>
                    <button
                      className={loading ? "remove-btn-loading" : "remove-btn"}
                      onClick={async () => {
                        setLoading(true);
                        await remove_From_Cart(userId.id,item.data.id);
                        setLoading(false);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className={loading ? "quantity-controls-loading": "quantity-controls"}>
                  <button
                    className={loading ? "quantity-btn-loading": "quantity-btn"}
                    onClick={async () => {
                      setLoading(true);
                      await add_To_Cart(userId.id,item.data.id, -1, item.quantity <= 1);
                      setLoading(false);
                    }}
                  >
                    −
                  </button>
                  <span className="quantity-display">{item.quantity}</span>
                  <button
                    className={loading ? "quantity-btn-loading" : "quantity-btn"}
                    onClick={async () => {
                      setLoading(true);
                      await add_To_Cart(userId.id,item.data.id, 1);
                      setLoading(false);
                    }}
                  >
                    +
                  </button>
                </div>

                <div className="item-price">
                  {Number(item.data.price).toLocaleString("en-ZA", {
                    style: "currency",
                    currency: "ZAR",
                  })}
                </div>

                <div className="item-total">
                  {Number(item.data.price * item.quantity).toLocaleString("en-ZA", {
                    style: "currency",
                    currency: "ZAR",
                  })}
                </div>
              </div>
            ))}
          </div>

          <button 
            className="continue-shopping"
            onClick={() => navigate("/Home")}
          >
            ← continue shopping
          </button>
        </div>

        {/* Right Column - Order Summary */}
        <div className="order-summary">
          <h3>Order Summary</h3>
{/* 
           <EcoMeterSummary
            ecoMeter={finalEcoMeter}
            donation={carbonOffsetDonation}
            onImprove={() => setShowDonationModal(true)}
          /> */}
          
          <div className="summary-row">
            <span>{cartItems.length} Items</span>
            <span>
              {subtotal.toLocaleString("en-ZA", {
                style: "currency",
                currency: "ZAR",
              })}
            </span>
          </div>

          <div className="shipping-section">
            <label htmlFor="shipping">Shipping</label>
            <select
              id="shipping"
              value={subtotal >= 500 ? "free" : shippingOption}
              onChange={(e) => {
                // Only allow changing shipping if order is under R500
                if (subtotal < 500) {
                  setShippingOption(e.target.value);
                }
              }}
              className="shipping-select"
              disabled={subtotal >= 500} // Disable if free shipping applies
            >
              <option value="standard">Standard (R73.99)</option>
              <option value="express">Express (R149.99)</option>
              {/* Only show free option if qualified */}
              {subtotal >= 500 ? (
                <option value="free">Free Shipping Applied! 🎉</option>
              ) : (
                <option value="free" disabled style={{ color: '#ccc' }}>
                  Free Shipping (Unlock at R500)
                </option>
              )}
            </select>
            <div className="shipping-cost">
              {shippingCost > 0 ? 
                shippingCost.toLocaleString("en-ZA", {
                  style: "currency",
                  currency: "ZAR",
                }) : (
                  <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                    Free! 🎉
                  </span>
                )
              }
          </div>
            
            {/* Show free shipping notification */}
            {subtotal >= 500 && (
              <div className="free-shipping-notice">
                🎉 Congratulations! You qualify for free shipping!
              </div>
            )}
          
          
          {/* Show how much more needed for free shipping */}
          {subtotal < 500 && (
            <div className="free-shipping-progress">
              Add {(500 - subtotal).toLocaleString("en-ZA", {
                style: "currency",
                currency: "ZAR",
              })} more for free shipping!
            </div>
          )}
        </div>

          <div className="ecometer-section">
            <div className="ecometer-header">
              <span>🌱 EcoMeter</span>
              <div className="ecometer-gauge">
                <div className="ecometer-gauge-bg">
                  <div 
                    className="ecometer-gauge-fill" 
                    style={{ 
                      width: `${finalEcoMeter}%`,
                      backgroundColor: getEcoMeterColor(finalEcoMeter)
                    }}
                  ></div>
                </div>
                <span className="ecometer-value" style={{ color: getEcoMeterColor(finalEcoMeter) }}>
                  {finalEcoMeter}/100
                </span>
              </div>
            </div>
            
            <div className="ecometer-info">
              <span className="ecometer-level" style={{ color: getEcoMeterColor(finalEcoMeter) }}>
                {getEcoMeterLevel(finalEcoMeter)}
              </span>
              {carbonOffsetDonation > 0 && ecoMeterImprovement > 0 && (
                <span className="ecometer-improvement">
                  +{ecoMeterImprovement} points from offset donation! 🌟
                </span>
              )}
            </div>

            {carbonOffsetDonation > 0 && (
              <div className="donation-applied">
                <div className="donation-row">
                  <span>Carbon Offset Donation</span>
                  <span>
                    {carbonOffsetDonation.toLocaleString("en-ZA", {
                      style: "currency",
                      currency: "ZAR",
                    })}
                  </span>
                </div>
                <div className="initiative-selected">
                  <small>{environmentalInitiatives.find(init => init.id === selectedInitiative)?.name}</small>
                </div>
              </div>
            )}
          </div>

          <div className="summary-row total-without-donation">
            <span>Subtotal + Shipping</span>
            <span>
              {totalWithoutDonation.toLocaleString("en-ZA", {
                style: "currency",
                currency: "ZAR",
              })}
            </span>
          </div>

          <button 
            className={`offset-carbon-btn ${carbonOffsetDonation > 0 ? 'applied' : ''}`}
            onClick={() => carbonOffsetDonation > 0 ? removeDonation() : setShowDonationModal(true)}
          >
            {carbonOffsetDonation > 0 ? 'Remove Carbon Offset' : 'Improve EcoMeter Score'}
          </button>

          <div className="final-total">
            <span>Total (with Carbon Offset)</span>
            <span>
              {finalTotal.toLocaleString("en-ZA", {
                style: "currency",
                currency: "ZAR",
              })}
            </span>
          </div>

          <p className="environmental-impact">
            {carbonOffsetDonation > 0 
              ? `🌟 Your EcoMeter improved by ${ecoMeterImprovement} points! Contributing to a greener future!`
              : "Improve your EcoMeter by supporting environmental initiatives!"
            }
          </p>

          <button 
            className="checkout-btn"
            onClick={() => navigate("/checkout?cart_id="+ cartID)}
          >
            Checkout
          </button>
        </div>
      </div>

      {/* Carbon Offset Donation Modal */}
      {showDonationModal && (
        <div className="modal-overlay" onClick={() => setShowDonationModal(false)}>
          <div className="donation-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Improve Your EcoMeter Score</h3>
            <div className="current-ecometer">
              <span className="current-ecometer-label">Current EcoMeter: </span>
              <span className="current-score" style={{ color: getEcoMeterColor(baseEcoMeter) }}>
                {baseEcoMeter}/100 - {getEcoMeterLevel(baseEcoMeter)}
              </span>
            </div>
            <p>Support environmental initiatives to boost your EcoMeter and offset your carbon impact!</p>
            
            <div className="initiatives-grid">
              {environmentalInitiatives.map(initiative => (
                <div key={initiative.id} className="initiative-card">
                  <h4>{initiative.name}</h4>
                  <p>{initiative.description}</p>
                  <div className="donation-amounts">
                    {[10, 20, 30].map(amount => (
                      <button 
                        key={amount}
                        className="donation-amount-btn"
                        onClick={() => applyDonation(amount, initiative.id)}
                      >
                        R{amount}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <button className="close-modal-btn" onClick={() => setShowDonationModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}