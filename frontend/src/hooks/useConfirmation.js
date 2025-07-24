import { useState } from 'react';

export const useConfirmation = () => {
  const [confirmationState, setConfirmationState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'default'
  });

  const showConfirmation = ({
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'default'
  }) => {
    return new Promise((resolve) => {
      setConfirmationState({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        type,
        onConfirm: () => {
          setConfirmationState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmationState(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  };

  const hideConfirmation = () => {
    setConfirmationState(prev => ({ ...prev, isOpen: false }));
  };

  return {
    confirmationState,
    showConfirmation,
    hideConfirmation
  };
};