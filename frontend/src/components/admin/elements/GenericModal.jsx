// components/common/GenericModal.jsx
import React, { useState } from 'react';
import '../../styles/admin/GenericModal.css';

const GenericModal = ({ isOpen, onClose, data, title }) => {
  const [expandedArrays, setExpandedArrays] = useState({});

  if (!isOpen || !data) return null;

  const toggleArrayExpansion = (key) => {
    setExpandedArrays(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderValue = (value, key, level = 0) => {
    // Handle different data types
    if (Array.isArray(value)) {
      return renderArray(value, key, level);
    } else if (typeof value === 'object' && value !== null) {
      return renderObject(value, key, level);
    } else {
      return renderPrimitive(value, key, level);
    }
  };

  const renderArray = (array, key, level) => {
    const isExpanded = expandedArrays[key];
    
    return (
      <div className="modal-data-item" style={{ paddingLeft: `${level * 5}px` }}>
        <div className="modal-data-header" onClick={() => toggleArrayExpansion(key)}>
          <span className="modal-data-label">
            {formatLabel(key)}
            <span className="array-indicator">({array.length} items)</span>
          </span>
          <span className={`modal-dropdown-arrow ${isExpanded ? 'expanded' : ''}`}>
            ▼
          </span>
        </div>
        {isExpanded && (
          <div className="modal-data-array-content">
            {array.map((item, index) => (
              <div key={index} className="modal-data-array-item">
                {renderValue(item, `${key}-${index}`, level + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderObject = (obj, key, level) => {
    return (
      <div className="modal-data-item" style={{ paddingLeft: `${level * 20}px` }}>
        <div className="modal-data-label object-label">
          {formatLabel(key)}
        </div>
        <div className="modal-data-object-content">
          {Object.entries(obj).map(([nestedKey, nestedValue]) => (
            <div key={nestedKey}>
              {renderValue(nestedValue, nestedKey, level + 1)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPrimitive = (value, key, level) => {
    return (
      <div className="modal-data-item" style={{ paddingLeft: `${level * 20}px` }}>
        <span className="modal-data-label">{formatLabel(key)}</span>
        <span className="modal-data-value">{String(value)}</span>
      </div>
    );
  };

  const formatLabel = (key) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  return (
    <div className="generic-modal-overlay" onClick={onClose}>
      <div className="generic-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="generic-modal-header">
          <h2 className="generic-modal-title">{title || 'Details'}</h2>
          <button className="generic-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="generic-modal-body">
          <div className="modal-data-container">
            {Object.entries(data).map(([key, value]) => (
              <div key={key}>
                {renderValue(value, key)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenericModal;