import React from 'react';

const CustomerModal = ({ customer, onClose }) => {
  return (
    <div className="adm-cus-modal-overlay" onClick={onClose}>
      <div className="adm-cus-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="adm-cus-modal-header">
          <button className="adm-cus-modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="adm-cus-modal-body">
          <div className="adm-cus-modal-card">
            <div className="adm-cus-modal-card-header">
              <div className="adm-cus-modal-title-section">
                <h2 className="adm-cus-modal-name">{customer.name}</h2>
                <span className="adm-cus-modal-userid">UserId: {customer.userId}</span>
              </div>
              <div className="adm-cus-modal-premium-badge">
                {customer.isPremium && <div className="adm-cus-premium-badge large">G</div>}
              </div>
            </div>

            <div className="adm-cus-modal-details">
              <div className="adm-cus-modal-detail-row">
                <span className="adm-cus-modal-label">Type:</span>
                <span className="adm-cus-modal-value">{customer.accountType}</span>
              </div>
              
              <div className="adm-cus-modal-detail-row">
                <span className="adm-cus-modal-label">Registration Date:</span>
                <span className="adm-cus-modal-value">{customer.registrationDate}</span>
              </div>
              
              <div className="adm-cus-modal-detail-row">
                <span className="adm-cus-modal-label">Email:</span>
                <span className="adm-cus-modal-value">
                  <span className="adm-cus-email-icon">✉️</span>
                  {customer.email}
                </span>
              </div>
              
              <div className="adm-cus-modal-detail-row">
                <span className="adm-cus-modal-label">Contact:</span>
                <span className="adm-cus-modal-value">
                  <span className="adm-cus-phone-icon">📞</span>
                  {customer.contact}
                </span>
              </div>
              <div className="adm-cus-modal-detail-row">
                <span className="adm-cus-modal-label">Member Since:</span>
                <span className="adm-cus-modal-value">{customer.memberSince}</span>
              </div>

              <div className="adm-cus-modal-detail-row">
                <span className="adm-cus-modal-label">Last Login:</span>
                <span className="adm-cus-modal-value">{customer.lastLogin}</span>
              </div>

              <div className="adm-cus-modal-detail-row">
                <span className="adm-cus-modal-label">Total Orders:</span>
                <span className="adm-cus-modal-value">{customer.totalOrders}</span>
              </div>

              <div className="adm-cus-modal-detail-row">
                <span className="adm-cus-modal-label">Receivables:</span>
                <span className="adm-cus-modal-value adm-cus-receivables">{customer.receivables}</span>
              </div>
            </div>

            <div className="adm-cus-modal-actions">
              <button className="adm-cus-modal-action-btn">🗑️ Delete</button>
              <button className="adm-cus-modal-action-btn">✏️ Edit</button>
              <button className="adm-cus-modal-action-btn">📞 Call</button>
              <button className="adm-cus-modal-action-btn">✉️ Email</button>
              <button className="adm-cus-modal-action-btn">📋 Export</button>
              <button className="adm-cus-modal-action-btn">📄 Print</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerModal;