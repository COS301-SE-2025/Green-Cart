import React from 'react';
import './WhyRecommendedModal.css';

const WhyRecommendedModal = ({ isOpen, onClose, explanation, productName, isLoading }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="why-recommended-modal-backdrop" onClick={handleBackdropClick}>
      <div className="why-recommended-modal">
        <div className="why-recommended-modal-header">
          <h3>🤖 Why was this recommended?</h3>
          <button 
            className="why-recommended-modal-close" 
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <div className="why-recommended-modal-content">
          {isLoading ? (
            <div className="why-recommended-loading">
              <div className="loading-spinner"></div>
              <p>Getting AI explanation...</p>
            </div>
          ) : (
            <>
              <div className="why-recommended-product">
                <strong>{productName}</strong>
              </div>
              <div className="why-recommended-explanation">
                {explanation || "This product was recommended based on your preferences and sustainability profile."}
              </div>
              <div className="why-recommended-footer">
                <span className="ai-powered-text">🌱 Powered by AI Analysis</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhyRecommendedModal;
