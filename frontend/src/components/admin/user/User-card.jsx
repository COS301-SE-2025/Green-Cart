import React from 'react';
import './UserCard.css';

const UserCard = ({ user }) => {
  const { name, email, telephone, avatar } = user;

  return (
    <div className="user-card">
      <div className="user-avatar">
        {avatar ? (
          <img src={avatar} alt={`${name}'s avatar`} />
        ) : (
          <div className="avatar-placeholder">
            {name ? name.charAt(0).toUpperCase() : 'U'}
          </div>
        )}
      </div>
      
      <div className="user-info">
        <h3 className="user-name">{name}</h3>
        <p className="user-email">{email}</p>
        <p className="user-telephone">{telephone}</p>
      </div>
    </div>
  );
};

export default UserCard;