import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import React, { useCallback, useEffect, useState } from 'react';

import { useAuth } from '../../contexts/AuthContext';
import { useLoading } from '../../contexts/LoadingProvider';

const COUNTDOWN_SECONDS = 10 * 60;

const TokenRefreshModal: React.FC = () => {
  const { showRefreshModal, setShowRefreshModal, refresh, logout } = useAuth();
  const { show, hide } = useLoading();
  const [remainingSeconds, setRemainingSeconds] = useState(COUNTDOWN_SECONDS);

  const onConfirm = async () => {
    try {
      show();
      await refresh();
    } catch (error) {
      console.error(error);
    } finally {
      hide();
      setShowRefreshModal(false);
    }
  };

  const onCancel = useCallback(() => {
    setShowRefreshModal(false);
    logout();
  }, [setShowRefreshModal, logout]);

  useEffect(() => {
    if (!showRefreshModal) return;

    setRemainingSeconds(COUNTDOWN_SECONDS);

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [showRefreshModal]);

  useEffect(() => {
    if (!showRefreshModal || remainingSeconds !== 0) return;
    onCancel();
  }, [remainingSeconds, showRefreshModal, onCancel]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedCountdown = `${minutes}:${String(seconds).padStart(2, '0')}`;

  return (
    <Dialog
      header="Session expiring"
      visible={showRefreshModal}
      style={{ width: '400px' }}
      modal
      closable={false}
      onHide={onCancel}
    >
      <p>
        Your session will expire in a few minutes. Would you like to extend it?
      </p>
      <p>
        Time remaining: <strong>{formattedCountdown}</strong>
      </p>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <Button
          label="Cancel"
          icon="pi pi-times"
          onClick={onCancel}
          className="p-button-secondary"
        />
        <Button
          label="Refresh"
          icon="pi pi-refresh"
          onClick={() => void onConfirm()}
          className="p-button-info"
        />
      </div>
    </Dialog>
  );
};

export default TokenRefreshModal;
