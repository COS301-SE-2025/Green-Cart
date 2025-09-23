import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import '../styles/modals/ChangePasswordModal.css';

const ChangePasswordModal = ({ isOpen, onClose, onPasswordChange }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Move validation logic to useMemo to prevent setState during render
  const isValidForm = useMemo(() => {
    return (
      formData.currentPassword &&
      formData.newPassword.length >= 8 &&
      formData.newPassword === formData.confirmPassword &&
      formData.currentPassword !== formData.newPassword
    );
  }, [formData.currentPassword, formData.newPassword, formData.confirmPassword]);

  // Separate validation function for form submission (no state updates)
  const validatePasswordsForSubmission = () => {
    if (!formData.currentPassword) {
      toast.error('Please enter your current password');
      return false;
    }
    if (formData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return false;
    }
    if (formData.currentPassword === formData.newPassword) {
      toast.error('New password must be different from current password');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordsForSubmission()) return;

    setIsLoading(true);
    try {
      await onPasswordChange({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      toast.success('Password changed successfully!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="change-password-modal-overlay" onClick={handleClose}>
      <div className="change-password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="change-password-header">
          <h2>🔐 Change Password</h2>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>

        <div className="change-password-body">
          <p className="change-password-description">
            Please enter your current password and choose a new secure password.
          </p>

          <form onSubmit={handleSubmit} className="change-password-form">
            {/* Current Password */}
            <div className="password-field">
              <label htmlFor="currentPassword">Current Password</label>
              <div className="password-input-container">
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Enter your current password"
                  required
                  className="password-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {showPasswords.current ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="password-field">
              <label htmlFor="newPassword">New Password</label>
              <div className="password-input-container">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Enter new password (min. 8 characters)"
                  required
                  minLength={8}
                  className="password-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPasswords.new ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className={`strength-fill ${getPasswordStrength(formData.newPassword)}`}
                    style={{ width: `${getPasswordStrengthPercentage(formData.newPassword)}%` }}
                  ></div>
                </div>
                <span className="strength-text">{getPasswordStrengthText(formData.newPassword)}</span>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="password-field">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className="password-input-container">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your new password"
                  required
                  className="password-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {formData.confirmPassword && (
                <div className={`password-match ${formData.newPassword === formData.confirmPassword ? 'match' : 'no-match'}`}>
                  {formData.newPassword === formData.confirmPassword ? '✅ Passwords match' : '❌ Passwords do not match'}
                </div>
              )}
            </div>

            {/* Password Requirements */}
            <div className="password-requirements">
              <h4>Password Requirements:</h4>
              <ul>
                <li className={formData.newPassword.length >= 8 ? 'valid' : ''}>
                  At least 8 characters long
                </li>
                <li className={/[A-Z]/.test(formData.newPassword) ? 'valid' : ''}>
                  Contains uppercase letter
                </li>
                <li className={/[a-z]/.test(formData.newPassword) ? 'valid' : ''}>
                  Contains lowercase letter
                </li>
                <li className={/\d/.test(formData.newPassword) ? 'valid' : ''}>
                  Contains number
                </li>
                <li className={/[!@#$%^&*]/.test(formData.newPassword) ? 'valid' : ''}>
                  Contains special character (!@#$%^&*)
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="change-password-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="change-btn"
                disabled={isLoading || !isValidForm} // Use useMemo value instead of function call
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner small"></div>
                    Changing...
                  </>
                ) : (
                  'Change Password'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Helper functions for password strength (unchanged)
const getPasswordStrength = (password) => {
  if (password.length === 0) return '';
  if (password.length < 6) return 'weak';
  if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password)) return 'medium';
  if (!/\d/.test(password) || !/[!@#$%^&*]/.test(password)) return 'medium';
  return 'strong';
};

const getPasswordStrengthPercentage = (password) => {
  if (password.length === 0) return 0;
  if (password.length < 6) return 25;
  if (password.length < 8) return 50;
  
  let strength = 50;
  if (/[A-Z]/.test(password)) strength += 10;
  if (/[a-z]/.test(password)) strength += 10;
  if (/\d/.test(password)) strength += 15;
  if (/[!@#$%^&*]/.test(password)) strength += 15;
  
  return Math.min(strength, 100);
};

const getPasswordStrengthText = (password) => {
  const strength = getPasswordStrength(password);
  switch (strength) {
    case 'weak': return 'Weak';
    case 'medium': return 'Medium';
    case 'strong': return 'Strong';
    default: return '';
  }
};

export default ChangePasswordModal;