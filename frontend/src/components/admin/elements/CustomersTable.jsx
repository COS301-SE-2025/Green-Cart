// CustomersTable.jsx
import React, { useState } from 'react';

const CustomersTable = ({ customers, onCustomerClick, getStatusClass }) => {
  const getSustainabilityWidth = (value) => `${value}%`;
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
        className="adm-cus-avatar"
        onError={() => setImageError(true)}
        />
    );
    };

  return (
    <div className="adm-cus-table-container">
      <table className="adm-cus-table">
        <thead>
            <tr>
                <th></th>
                <th>Plan</th>
                <th>User ID</th>
                <th>Phone Number</th>
                <th>Sustainability</th>
            </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id} onClick={() => onCustomerClick(customer)} className="adm-cus-clickable-row">
                <td>
                    <div className="adm-cus-customer-info">
                    <AvatarWithInitials 
                        src={customer.avatar}
                        alt={customer.name}
                        name={customer.name}
                    />
                    <div className="adm-cus-customer-details">
                        <span className="adm-cus-name">{customer.name}</span>
                        <span className="adm-cus-email">{customer.email}</span>
                    </div>
                    </div>
                </td>
                <td>
                    <span className="adm-cus-plan">{customer.plan}</span>
                </td>
                <td className="adm-cus-userid">{customer.userId}</td>
                <td className="adm-cus-phone">{customer.phone}</td>
                <td>
                    <div className="adm-cus-sustainability">
                    <div className="adm-cus-sustainability-bar">
                        <div 
                        className="adm-cus-sustainability-fill"
                        style={{ width: getSustainabilityWidth(customer.sustainability) }}
                        ></div>
                    </div>
                    </div>
                </td>
                <td>
                    <button 
                    className="adm-cus-options-btn"
                    onClick={(e) => e.stopPropagation()}
                    >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                        <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
                        <circle cx="12" cy="19" r="1.5" fill="currentColor"/>
                    </svg>
                    </button>
                </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomersTable;