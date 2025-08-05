import React from 'react';

const CustomerStatsCard = ({ title, value, change, changeType, period }) => {
  return (
    <div className="adm-cus-stats-card">
      <div className="adm-cus-stats-header">
        <h3 className="adm-cus-stats-title">{title}</h3>
      </div>
      <div className="adm-cus-stats-content">
        <div className="adm-cus-stats-value">{value}</div>
        <div className="adm-cus-stats-change">
          <span className={`adm-cus-change ${changeType}`}>{change}</span>
          <span className="adm-cus-period">{period}</span>
        </div>
      </div>
    </div>
  );
};

export default CustomerStatsCard;