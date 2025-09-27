import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../config/api.js'
import '../styles/modals/TwoFactorModal.css';

import CustomConfirmModal from './Custom2FAConfirmModal';

const TwoFactorModal = ({ isOpen, onClose, onEnable2FA, onDisable2FA, is2FAEnabled, userId }) => {
  const [step, setStep] = useState(1);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [secretKey, setSecretKey] = useState('');
  const [setupStarted, setSetupStarted] = useState(false);
  const [setupCompleted, setSetupCompleted] = useState(false);

  // Custom confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning'
  });

  useEffect(() => {
    if (isOpen) {
      if (is2FAEnabled) {
        setStep(4); // Disable 2FA step
      } else {
        setStep(1); // Setup 2FA step
      }
      resetModalState();
    }
  }, [isOpen, is2FAEnabled]);

  const resetModalState = () => {
    setQrCodeUrl('');
    setBackupCodes([]);
    setVerificationCode('');
    setSecretKey('');
    setSetupStarted(false);
    setSetupCompleted(false);
    setIsLoading(false);
    setConfirmModal({ ...confirmModal, isOpen: false });
  };

  // Custom confirmation helper
  const showConfirmation = (title, message, onConfirm, type = 'warning') => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        onConfirm();
      },
      type
    });
  };

  // Clean up incomplete setup using existing disableMFA endpoint
  const cleanupIncompleteSetup = async () => {
    if (setupStarted && !setupCompleted && userId) {
      try {
        console.log('🧹 Cleaning up incomplete 2FA setup using disableMFA endpoint...');
        const response = await fetch(`${API_BASE_URL}/users/disableMFA/${userId}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (response.ok) {
          console.log('✅ Incomplete 2FA setup cleaned up successfully');
        } else {
          console.warn('⚠️ Failed to cleanup incomplete 2FA setup');
        }
      } catch (error) {
        console.error('❌ Error cleaning up incomplete 2FA setup:', error);
      }
    }
  };

  const generateQRCode = async () => {
    if (!userId) {
      toast.error('User ID is required');
      return false;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users/setupMFA/${userId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 200 && data.qr_code) {
        const qrCodeData = data.qr_code.startsWith('data:image/')
          ? data.qr_code
          : `data:image/png;base64,${data.qr_code}`;
        
        setQrCodeUrl(qrCodeData);
        setSecretKey(data.secret);
        setSetupStarted(true);
        setSetupCompleted(false); // Setup is not completed yet
        
        if (data.backup_codes) {
          setBackupCodes(data.backup_codes);
        }
        
        console.log('🔐 QR Code generated, 2FA setup started (not completed)');
        return true;
      } else {
        throw new Error(data.message || 'Failed to setup MFA');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error(error.message || 'Failed to generate QR code');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueSetup = async () => {
    console.log('🔐 User confirmed 2FA setup, generating QR code...');
    const success = await generateQRCode();
    if (success) {
      setStep(2);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    if (!setupStarted || !secretKey) {
      toast.error('Setup incomplete. Please go back and scan the QR code first.');
      return;
    }

    setIsLoading(true);
    try {
      await onEnable2FA({
        code: verificationCode,
        secret: secretKey
      });
      
      // Mark setup as completed - this prevents cleanup
      setSetupCompleted(true);
      console.log('✅ 2FA setup completed successfully');
      setStep(3); // Show success/backup codes
    } catch (error) {
      console.error('❌ 2FA verification failed:', error);
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

  const handleClose = async () => {
    // If setup was started but not completed, show warning and cleanup
    if (setupStarted && !setupCompleted && step !== 1) {
      showConfirmation(
        '⚠️ Incomplete 2FA Setup',
        'Your 2FA setup is incomplete!\n\nIf you close now, the setup will be cancelled and you\'ll need to start over.\n\nAre you sure you want to close?',
        async () => {
          // Clean up the incomplete setup using existing disableMFA endpoint
          await cleanupIncompleteSetup();
          toast.success('2FA setup cancelled and cleaned up');
          resetModalState();
          setStep(1);
          onClose();
        },
        'warning'
      );
      return;
    }
    
    resetModalState();
    setStep(1);
    onClose();
  };

  const handleBackFromQR = async () => {
    if (setupStarted && !setupCompleted) {
      showConfirmation(
        '⚠️ Cancel 2FA Setup',
        'Going back will cancel the 2FA setup process.\n\nThe QR code will be invalidated and you\'ll need to start over.\n\nAre you sure?',
        async () => {
          // Clean up the incomplete setup using existing disableMFA endpoint
          await cleanupIncompleteSetup();
          resetModalState();
          setStep(1);
          toast.info('2FA setup cancelled');
        },
        'warning'
      );
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
              <div className="step-icon">🔐</div>
              <h3>Set Up Two-Factor Authentication</h3>
              <p>
                Add an extra layer of security to your account by requiring a verification code 
                from your mobile device when signing in.
              </p>
              
              <div className="benefits-list">
                <h4>Benefits:</h4>
                <ul>
                  <li>✅ Enhanced account security</li>
                  <li>✅ Protection against unauthorized access</li>
                  <li>✅ Peace of mind for your personal data</li>
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

              <div className="setup-warning">
                <h4>⚠️ Important:</h4>
                <p>
                  Make sure you have an authenticator app installed before proceeding. 
                  Once you start the setup, you must complete all steps to avoid being locked out.
                </p>
              </div>

              <div className="step-actions">
                <button className="cancel-btn" onClick={handleClose}>
                  Cancel
                </button>
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
                    'I Have Authenticator App - Continue'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: QR Code */}
          {step === 2 && (
            <div className="two-factor-step">
              <div className="step-icon">📊</div>
              <h3>Scan QR Code</h3>
              <p>
                Open your authenticator app and scan the QR code below, or manually enter the secret key.
              </p>

              <div className="setup-progress">
                <div className="progress-indicator">
                  <span className="progress-step completed">1</span>
                  <span className="progress-line"></span>
                  <span className="progress-step active">2</span>
                  <span className="progress-line"></span>
                  <span className="progress-step">3</span>
                </div>
                <p className="progress-text">Step 2 of 3: Scan QR Code</p>
              </div>

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

                  <div className="critical-warning">
                    <h4>🚨 IMPORTANT:</h4>
                    <p>
                      <strong>You MUST complete the next step!</strong> If you close this window now, 
                      your account will be partially configured and the setup will be automatically cancelled.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="error-message">
                  <p>❌ Failed to load QR code. Please try again.</p>
                  <button onClick={handleContinueSetup} className="retry-btn">
                    🔄 Retry
                  </button>
                </div>
              )}

              <div className="step-actions">
                <button className="back-btn" onClick={handleBackFromQR}>
                  ← Cancel Setup
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

              <div className="setup-progress">
                <div className="progress-indicator">
                  <span className="progress-step completed">1</span>
                  <span className="progress-line"></span>
                  <span className="progress-step completed">2</span>
                  <span className="progress-line"></span>
                  <span className="progress-step active">3</span>
                </div>
                <p className="progress-text">Step 3 of 3: Verify Setup</p>
              </div>

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

              <div className="final-warning">
                <h4>🔒 Final Step:</h4>
                <p>
                  This will complete your 2FA setup. Make sure you have access to your authenticator app 
                  before clicking verify, as you'll need it for future logins.
                </p>
              </div>

              <div className="step-actions">
                <button className="back-btn" onClick={() => setStep(2)}>
                  ← Back to QR Code
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
                    '🔒 Complete 2FA Setup'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success - Only shown after successful verification */}
          {step === 3 && setupCompleted && (
            <div className="two-factor-step">
              <div className="step-icon">🎉</div>
              <h3>✅ 2FA Enabled Successfully!</h3>
              <p>
                Your two-factor authentication is now active. Your account is now more secure!
              </p>

              {backupCodes.length > 0 && (
                <div className="backup-codes-container">
                  <h4>🔑 Backup Codes:</h4>
                  <p className="backup-codes-warning">
                    <strong>Save these backup codes in a safe place!</strong> Each can only be used once.
                  </p>
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
              )}

              <div className="warning-note">
                <h4>⚠️ Important:</h4>
                <ul>
                  <li>Keep backup codes safe - each can only be used once</li>
                  <li>You'll need your authenticator app to sign in from now on</li>
                  <li>You can disable 2FA anytime in your security settings</li>
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
        {/* Custom Confirmation Modal */}
      <CustomConfirmModal
        isOpen={confirmModal.isOpen}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Yes, Continue"
        cancelText="No, Go Back"
        type={confirmModal.type}
      />
      </div>
      
    </div>
  );
};

export default TwoFactorModal;