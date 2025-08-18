import React, {useState} from 'react';

const AvatarWithInitials = ({ src, alt, name }) => {
  const [imageError, setImageError] = useState(false);
  
  const getInitials = (fullName) => {
    return fullName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (imageError || !src) {
    return (
      <div className="adm-cus-avatar-initials">
        {getInitials(name)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="adm-cus-card-avatar"
      onError={() => setImageError(true)}
    />
  );
};

const CustomerCard = ({ customer, onClick, retailerIcon }) => {
  // Only show status if it's "Accepted" (Active)
  const isActive = customer.status.toLowerCase() === 'accepted';
  
  return (
    <div className="adm-cus-card" onClick={onClick}>
      <div className="adm-cus-card-header">
        <div className="adm-cus-avatar-container">
          <AvatarWithInitials 
            src={customer.avatar}
            alt={customer.name}
            name={customer.name}
          />
          {customer.isRetailer && (
            <div className="adm-cus-premium-badge">
              <img 
                src={retailerIcon} 
                alt="Premium" 
                className="adm-cus-premium-icon"
              />
            </div>
          )}
        </div>
        <div className="adm-cus-card-info">
          <h3 className="adm-cus-card-name">{customer.name}</h3>
          <p className="adm-cus-card-userid">UserId: {customer.userId}</p>
        </div>
        {isActive && (
          <span className="adm-cus-status-active">
            Active
          </span>
        )}
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
          <span className="adm-cus-detail-value-email" title={customer.email}>
            {customer.email}
          </span>
        </div>
        <div className="adm-cus-card-detail">
          <span className="adm-cus-detail-label">Contact:</span>
          <span className="adm-cus-detail-value">
            {customer.contact}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CustomerCard;