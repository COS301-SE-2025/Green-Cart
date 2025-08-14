// components/dashboard/StatsCard.jsx
import React from 'react';
import statsLossIcon from '../icons/statsLossIcon.png';
import statsProfitIcon from '../icons/statsProfitIcon.png';

const DashboardStatsCard = ({ card, onClick, loading = false }) => {
  if (loading) {
    return (
      <div className="stat-card stat-card-loading">
        <div className="loading-banner">
          <div className="custom-loader">
            <svg className="circular" viewBox="25 25 50 50">
              <circle 
                className="path" 
                cx="50" 
                cy="50" 
                r="20" 
                fill="none" 
                strokeWidth="2" 
                strokeMiterlimit="10"
              />
            </svg>
          </div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`stat-card ${card.dark ? 'stat-card-dark' : ''}`}
      onClick={() => onClick(card)}
    >
      <div className="stat-card-header">
        <div className="stat-icon">
          <img src={card.icon} alt={card.title} className="stat-icon-image" />
        </div>
        <div className="stat-info">
          <h3 className="stat-title">{card.title}</h3>
          <p className="stat-subtitle">{card.subtitle}</p>
        </div>
      </div>
      
      <div className="stat-value">{card.value}</div>
      
      <div className="stat-footer">
        <span className={`stat-percentage ${card.trend}`}>
          <img 
            src={card.percentage.charAt(0) === '-' ? statsLossIcon : statsProfitIcon} 
            alt='stats-icon' 
            className='stats-icon'
          /> 
          <span className="stat-percentage-text">{card.percentage}</span>
        </span>
      </div>
    </div>
  );
};

export default DashboardStatsCard;