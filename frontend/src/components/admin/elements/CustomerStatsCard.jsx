// CustomerStatsCard.jsx
import React from 'react';

// Update the CustomerStatsCard component:
const CustomerStatsCard = ({ title, value, change, changeType, period, subtitle }) => {
  return (
    <div className="adm-cus-stats-card">
      <div className="adm-cus-stats-header">
        <div className="adm-cus-stats-title-section">
          <h3 className="adm-cus-stats-title">{title}</h3>
          <div className="adm-cus-stats-subtitle">{subtitle}</div>
        </div>
        {title !== "Premium Members" && (
          <button className="adm-cus-stats-menu">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="1" fill="currentColor"/>
              <circle cx="12" cy="5" r="1" fill="currentColor"/>
              <circle cx="12" cy="19" r="1" fill="currentColor"/>
            </svg>
          </button>
        )}
      </div>
      
      <div className="adm-cus-stats-content">
        <div className="adm-cus-stats-main">
          <div className="adm-cus-stats-value-row">
            <div className="adm-cus-stats-value">{value}</div>
            {change && (
              <div className="adm-cus-stats-change">
                <span className={`adm-cus-change ${changeType}`}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {change}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerStatsCard;