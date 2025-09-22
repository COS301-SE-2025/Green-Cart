import React, { useState } from 'react';
import toast from 'react-hot-toast';
import '../styles/modals/TwoFactorVerificationModal.css';

const TwoFactorVerificationModal = ({ 
  isOpen, 
  onClose, 
  onVerify, 
  userEmail,
  isLoading = false,
  onUseBackupCode 
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [showBackupCode, setShowBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState('');

  const handleVerifyCode = () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }
    
    onVerify(verificationCode);
  };

  const handleUseBackupCode = () => {
    if (!backupCode || backupCode.length < 8) {
      toast.error('Please enter a valid backup code');
      return;
    }
    
    onUseBackupCode(backupCode);
  };

  const handleClose = () => {
    setVerificationCode('');
    setBackupCode('');
    setShowBackupCode(false);
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (showBackupCode) {
        handleUseBackupCode();
      } else {
        handleVerifyCode();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="two-factor-verification-overlay" onClick={handleClose}>
      <div className="two-factor-verification-modal" onClick={(e) => e.stopPropagation()}>
        <div className="verification-header">
          <div className="verification-icon">🔐</div>
          <h2>Two-Factor Authentication Required</h2>
          <p className="verification-subtitle">
            {userEmail && `Signing in as ${userEmail}`}
          </p>
        </div>

        <div className="verification-body">
          {!showBackupCode ? (
            // Regular 2FA Code Input
            <>
              <div className="verification-section">
                <h3>Enter Authentication Code</h3>
                <p>Open your authenticator app and enter the 6-digit verification code.</p>
                
                <div className="code-input-container">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onKeyPress={handleKeyPress}
                    placeholder="000000"
                    className="verification-code-input"
                    maxLength={6}
                    autoFocus
                    disabled={isLoading}
                  />
                  <span className="input-label">6-digit authentication code</span>
                </div>
              </div>

              <div className="verification-actions">
                <button
                  className="verify-submit-btn"
                  onClick={handleVerifyCode}
                  disabled={isLoading || verificationCode.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <div className="spinner small"></div>
                      Verifying...
                    </>
                  ) : (
                    'Verify & Sign In'
                  )}
                </button>

                <div className="alternative-options">
                  <button
                    className="backup-code-link"
                    onClick={() => setShowBackupCode(true)}
                    disabled={isLoading}
                  >
                    Use backup code instead
                  </button>
                  
                  <button
                    className="cancel-signin-btn"
                    onClick={handleClose}
                    disabled={isLoading}
                  >
                    Cancel Sign In
                  </button>
                </div>
              </div>
            </>
          ) : (
            // Backup Code Input
            <>
              <div className="verification-section">
                <h3>Enter Backup Code</h3>
                <p>Enter one of your backup codes to sign in. Each code can only be used once.</p>
                
                <div className="code-input-container">
                  <input
                    type="text"
                    value={backupCode}
                    onChange={(e) => setBackupCode(e.target.value.replace(/\s/g, '').slice(0, 8))}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter 8-character backup code"
                    className="backup-code-input"
                    maxLength={8}
                    autoFocus
                    disabled={isLoading}
                  />
                  <span className="input-label">8-character backup code</span>
                </div>
              </div>

              <div className="verification-actions">
                <button
                  className="verify-submit-btn"
                  onClick={handleUseBackupCode}
                  disabled={isLoading || backupCode.length < 8}
                >
                  {isLoading ? (
                    <>
                      <div className="spinner small"></div>
                      Verifying...
                    </>
                  ) : (
                    'Verify Backup Code'
                  )}
                </button>

                <div className="alternative-options">
                  <button
                    className="backup-code-link"
                    onClick={() => setShowBackupCode(false)}
                    disabled={isLoading}
                  >
                    ← Back to authenticator code
                  </button>
                  
                  <button
                    className="cancel-signin-btn"
                    onClick={handleClose}
                    disabled={isLoading}
                  >
                    Cancel Sign In
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="help-section">
            <div className="help-links">
              <a href="/help/2fa" className="help-link">
                Having trouble? Get help
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorVerificationModal;