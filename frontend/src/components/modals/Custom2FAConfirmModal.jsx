import React from 'react';
import '../styles/modals/Custom2FAConfirmModal.css';

const Custom2FAConfirmModal = ({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning' // 'warning', 'danger', 'info'
}) => {
  if (!isOpen) return null;

  const getIconAndColor = () => {
    switch (type) {
      case 'danger':
        return { icon: '🚨', iconColor: '#ef4444', confirmClass: 'btn-danger' };
      case 'warning':
        return { icon: '⚠️', iconColor: '#f59e0b', confirmClass: 'btn-warning' };
      default:
        return { icon: 'ℹ️', iconColor: '#3b82f6', confirmClass: 'btn-info' };
    }
  };

  const { icon, iconColor, confirmClass } = getIconAndColor();

  return (
    <div className="custom-confirm-overlay" onClick={onCancel}>
      <div className="custom-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="custom-confirm-header">
          <div className="custom-confirm-icon" style={{ color: iconColor }}>
            {icon}
          </div>
          <h3 className="custom-confirm-title">{title}</h3>
        </div>

        <div className="custom-confirm-body">
          <p className="custom-confirm-message">{message}</p>
        </div>

        <div className="custom-confirm-actions">
          <button 
            className="custom-confirm-btn btn-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={`custom-confirm-btn ${confirmClass}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Custom2FAConfirmModal;