import React from 'react';
import '../styles/modals/ConfirmationModal.css';

export default function ConfirmationModal({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'default' // 'default', 'danger', 'warning'
}) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconColor: '#ef4444',
          icon: '⚠️',
          confirmButtonClass: 'btn-danger'
        };
      case 'warning':
        return {
          iconColor: '#f59e0b',
          icon: '⚠️',
          confirmButtonClass: 'btn-warning'
        };
      default:
        return {
          iconColor: '#3b82f6',
          icon: 'ℹ️',
          confirmButtonClass: 'btn-primary'
        };
    }
  };

  const { iconColor, icon, confirmButtonClass } = getTypeStyles();

  return (
    <div className="confirmation-modal-overlay" onClick={onCancel}>
      <div className="confirmation-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="confirmation-modal-header">
          <div 
            className="confirmation-icon"
            style={{ color: iconColor }}
          >
            {icon}
          </div>
          <h3 className="confirmation-title">{title}</h3>
        </div>

        <div className="confirmation-modal-body">
          <p className="confirmation-message">{message}</p>
        </div>

        <div className="confirmation-modal-actions">
          <button 
            className="confirmation-modal-btn btn-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={`confirmation-modal-btn ${confirmButtonClass}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}