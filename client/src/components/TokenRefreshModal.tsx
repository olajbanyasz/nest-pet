import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useAuth } from '../contexts/AuthContext';

const TokenRefreshModal: React.FC = () => {
  const {
    showRefreshModal,
    setShowRefreshModal,
    refresh
  } = useAuth();

  const onConfirm = async () => {
    await refresh();
    setShowRefreshModal(false);
  };

  return (
    <Dialog
      header="Session expiring"
      visible={showRefreshModal}
      style={{ width: '400px' }}
      modal
      closable={false}
      onHide={() => setShowRefreshModal(false)}
    >
      <p>
        Your session will expire in a few minutes.
        Would you like to extend it?
      </p>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <Button
          label="OK"
          icon="pi pi-refresh"
          onClick={onConfirm}
        />
      </div>
    </Dialog>
  );
};

export default TokenRefreshModal;
