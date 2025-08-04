import React from 'react';

const CustomerCard = ({ customer, getStatusClass, onClick }) => {
  return (
    <div className="adm-cus-card" onClick={onClick}>
      <div className="adm-cus-card-header">
        <div className="adm-cus-avatar-container">
          <img
            src={customer.avatar}
            alt={customer.name}
            className="adm-cus-card-avatar"
          />
          {customer.isPremium && <div className="adm-cus-premium-badge">G</div>}
        </div>
        <div className="adm-cus-card-info">
          <h3 className="adm-cus-card-name">{customer.name}</h3>
          <p className="adm-cus-card-userid">UserId: {customer.userId}</p>
        </div>
        <span className={`adm-cus-status ${getStatusClass(customer.status)}`}>
          {customer.status}
        </span>
      </div>
      
      <div className="adm-cus-card-details">
        <div className="adm-cus-card-detail">
          <span className="adm-cus-detail-label">Type:</span>
          <span className="adm-cus-detail-value">{customer.accountType}</span>
        </div>
        <div className="adm-cus-card-detail">
          <span className="adm-cus-detail-label">Registration Date:</span>
          <span className="adm-cus-detail-value">{customer.registrationDate}</span>
        </div>
        <div className="adm-cus-card-detail">
          <span className="adm-cus-detail-label">Email:</span>
          <span className="adm-cus-detail-value">
            <span className="adm-cus-email-icon">✉️</span>
            {customer.email}
          </span>
        </div>
        <div className="adm-cus-card-detail">
          <span className="adm-cus-detail-label">Contact:</span>
          <span className="adm-cus-detail-value">
            <span className="adm-cus-phone-icon">📞</span>
            {customer.contact}
          </span>
        </div>
      </div>
      
      <div className="adm-cus-card-actions" onClick={(e) => e.stopPropagation()}>
        <button className="adm-cus-action-btn">🗑️</button>
        <button className="adm-cus-action-btn">✏️</button>
        <button className="adm-cus-action-btn">📞</button>
        <button className="adm-cus-action-btn">✉️</button>
      </div>
    </div>
  );
};

export default CustomerCard;