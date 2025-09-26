import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../config/api.js'
import '../styles/modals/TwoFactorModal.css';
import { API_BASE_URL } from '../../config/api.js';

const TwoFactorModal = ({ isOpen, onClose, onEnable2FA, onDisable2FA, is2FAEnabled, userId }) => {
  const [step, setStep] = useState(1); // 1: Setup, 2: QR Code, 3: Verify Code
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [secretKey, setSecretKey] = useState('');
  const [has2FAStarted, setHas2FAStarted] = useState(false);


  useEffect(() => {
    if (isOpen && !is2FAEnabled) {
      setStep(1);
      resetModalState();

      // generateQRCode();
    } else if (isOpen && is2FAEnabled) {
      setStep(4); // Disable 2FA step
      resetModalState();
    }
  }, [isOpen, is2FAEnabled]);

  const resetModalState = () => {
    setQrCodeUrl('');
    setBackupCodes([]);
    setVerificationCode('');
    setSecretKey('');
    setHas2FAStarted(false);
    setIsLoading(false);
  }; 

  const generateQRCode = async () => {
    if (!userId) {
      toast.error('User ID is required');
      return;
    }

    setIsLoading(true);
    setHas2FAStarted(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users/setupMFA/${userId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          // Add authentication headers if needed
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle the response structure based on the API documentation
      if (data.status === 'success' || data.qr_code) {
        // If qr_code is base64 encoded, ensure it has the proper data URL prefix
        const qrCodeData = data.qr_code.startsWith('data:image/')
          ? data.qr_code
          : `data:image/png;base64,${data.qr_code}`;
        
        setQrCodeUrl(qrCodeData);
        setSecretKey(data.secret);
        
        // If the API returns backup codes, use them; otherwise generate some or handle differently
        if (data.backup_codes) {
          setBackupCodes(data.backup_codes);
        }
      } else {
        throw new Error(data.message || 'Failed to setup MFA');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error(error.message || 'Failed to generate QR code');

      setHas2FAStarted(false);
      setStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      await onEnable2FA({
        code: verificationCode,
        secret: secretKey
      });
      
      toast.success('Two-Factor Authentication enabled successfully!');
      setStep(3); // Show backup codes
    } catch (error) {
      toast.error(error.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setIsLoading(true);
    try {
      await onDisable2FA();
      toast.success('Two-Factor Authentication disabled');
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to disable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setVerificationCode('');
    setQrCodeUrl('');
    setBackupCodes([]);
    setSecretKey('');
    onClose();
  };

  const handleContinueSetup = async () => {
    console.log('🔐 User confirmed 2FA setup, generating QR code...');
    await generateQRCode();
    if (qrCodeUrl) {
      setStep(2); // Only proceed to QR code step if generation was successful
    }
  };

  const handleBackFromQR = () => {
    if (has2FAStarted) {
      // Optionally show confirmation since QR was already generated
      const shouldGoBack = window.confirm(
        'Going back will cancel the 2FA setup process. Are you sure?'
      );
      if (shouldGoBack) {
        resetModalState();
        setStep(1);
      }
    } else {
      setStep(1);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (!isOpen) return null;

  return (
    <div className="two-factor-modal-overlay" onClick={handleClose}>
      <div className="two-factor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="two-factor-header">
          <h2>Two-Factor Authentication</h2>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>

        <div className="two-factor-body">
          {/* Step 1: Introduction */}
          {step === 1 && (
            <div className="two-factor-step">
              <div className="step-icon"></div>
              <h3>Set Up Two-Factor Authentication</h3>
              <p>
                Add an extra layer of security to your account by requiring a verification code 
                from your mobile device when signing in.
              </p>
              
              <div className="benefits-list">
                <h4>Benefits:</h4>
                <ul>
                  <li> Enhanced account security</li>
                  <li> Protection against unauthorized access</li>
                  <li> Peace of mind for your personal data</li>
                </ul>
              </div>

              <div className="app-recommendations">
                <h4>Recommended Authenticator Apps:</h4>
                <div className="app-list">
                  <div className="app-item">
                    <span>📱 Google Authenticator</span>
                  </div>
                  <div className="app-item">
                    <span>🔐 Microsoft Authenticator</span>
                  </div>
                  <div className="app-item">
                    <span>🛡️ Authy</span>
                  </div>
                </div>
              </div>

              <div className="step-actions">
                <button className="cancel-btn" onClick={handleClose}>
                  Cancel
                </button>
                {/* UPDATED: Only generate QR code when user clicks Continue */}
                <button 
                  className="continue-btn" 
                  onClick={handleContinueSetup}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="loading-spinner small"></div>
                      Setting up...
                    </>
                  ) : (
                    'Continue Setup'
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="two-factor-step">
              <div className="step-icon">📊</div>
              <h3>Scan QR Code</h3>
              <p>
                Open your authenticator app and scan the QR code below, or manually enter the secret key.
              </p>

              {qrCodeUrl ? (
                <div className="qr-section">
                  <div className="qr-code-container">
                    <img src={qrCodeUrl} alt="2FA QR Code" className="qr-code" />
                  </div>
                  
                  <div className="manual-entry">
                    <h4>Can't scan? Enter manually:</h4>
                    <div className="secret-key">
                      <code>{secretKey}</code>
                      <button 
                        className="copy-btn"
                        onClick={() => copyToClipboard(secretKey)}
                      >
                        📋 Copy
                      </button>
                    </div>
                  </div>

                  <div className="qr-instructions">
                    <p><strong>📱 Instructions:</strong></p>
                    <ol>
                      <li>Open your authenticator app</li>
                      <li>Tap "Add account" or "+" button</li>
                      <li>Scan this QR code or enter the key manually</li>
                      <li>Your app will display a 6-digit code</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="error-message">
                  <p>❌ Failed to load QR code. Please try again.</p>
                  <button onClick={generateQRCode} className="retry-btn">
                    🔄 Retry
                  </button>
                </div>
              )}

              <div className="step-actions">
                <button className="back-btn" onClick={handleBackFromQR}>
                  ← Back
                </button>
                <button 
                  className="continue-btn" 
                  onClick={() => setStep(5)}
                  disabled={!qrCodeUrl}
                >
                  Next: Verify Code →
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Verify Code */}
          {step === 5 && (
            <div className="two-factor-step">
              <div className="step-icon">🔢</div>
              <h3>Enter Verification Code</h3>
              <p>
                Enter the 6-digit code from your authenticator app to complete the setup.
              </p>

              <div className="verification-input-container">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="verification-input"
                  maxLength={6}
                  autoFocus
                />
                <span className="input-hint">6-digit code from your authenticator app</span>
              </div>

              <div className="verification-help">
                <p>💡 <strong>Tip:</strong> The code changes every 30 seconds. If it doesn't work, wait for the next code.</p>
              </div>

              <div className="step-actions">
                <button className="back-btn" onClick={() => setStep(2)}>
                  ← Back
                </button>
                <button 
                  className="verify-btn"
                  onClick={handleVerifyCode}
                  disabled={isLoading || verificationCode.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <div className="loading-spinner small"></div>
                      Verifying...
                    </>
                  ) : (
                    'Verify & Enable 2FA'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Backup Codes */}
          {step === 3 && (
            <div className="two-factor-step">
              <div className="step-icon">🔑</div>
              <h3>✅ 2FA Enabled Successfully!</h3>
              <p>
                Your two-factor authentication is now active. Save these backup codes in a safe place.
              </p>

              {backupCodes.length > 0 ? (
                <div className="backup-codes-container">
                  <div className="backup-codes">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="backup-code">
                        <code>{code}</code>
                      </div>
                    ))}
                  </div>
                  <button 
                    className="copy-all-btn"
                    onClick={() => copyToClipboard(backupCodes.join('\n'))}
                  >
                    📋 Copy All Codes
                  </button>
                </div>
              ) : (
                <div className="no-backup-codes">
                  <p>Backup codes can be generated later in your account settings.</p>
                </div>
              )}

              <div className="warning-note">
                <h4>⚠️ Important:</h4>
                <ul>
                  <li>Each backup code can only be used once</li>
                  <li>Store them securely and don't share them</li>
                  <li>You can generate new codes anytime in your account settings</li>
                  <li>Use backup codes if you lose access to your authenticator app</li>
                </ul>
              </div>

              <div className="step-actions">
                <button className="complete-btn" onClick={handleClose}>
                  ✅ Complete Setup
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Disable 2FA */}
          {step === 4 && (
            <div className="two-factor-step">
              <div className="step-icon">⚠️</div>
              <h3>Disable Two-Factor Authentication</h3>
              <p>
                You currently have 2FA enabled. Disabling it will reduce your account security.
              </p>

              <div className="current-2fa-status">
                <div className="status-indicator enabled">
                  <span>🟢 2FA Currently Enabled</span>
                </div>
                <p>Your account is protected by two-factor authentication.</p>
              </div>

              <div className="warning-note danger">
                <h4>⚠️ Security Warning:</h4>
                <p>
                  Disabling two-factor authentication will make your account less secure. 
                  Without 2FA, anyone with your password can access your account.
                </p>
                <ul>
                  <li>Your account will be more vulnerable to unauthorized access</li>
                  <li>You'll lose the extra security layer</li>
                  <li>This action can be reversed by re-enabling 2FA</li>
                </ul>
              </div>

              <div className="step-actions">
                <button className="cancel-btn" onClick={handleClose}>
                  Keep 2FA Enabled
                </button>
                <button 
                  className="disable-btn"
                  onClick={handleDisable2FA}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="loading-spinner small"></div>
                      Disabling...
                    </>
                  ) : (
                    'Disable 2FA'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwoFactorModal;