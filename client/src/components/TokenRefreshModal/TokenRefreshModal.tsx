import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import React from 'react';

import { useAuth } from '../../contexts/AuthContext';
import { useLoading } from '../../contexts/LoadingProvider';

const TokenRefreshModal: React.FC = () => {
  const { showRefreshModal, setShowRefreshModal, refresh, logout } = useAuth();

  const { show, hide } = useLoading();

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

  const onCancel = () => {
    setShowRefreshModal(false);
    logout();
  };

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
