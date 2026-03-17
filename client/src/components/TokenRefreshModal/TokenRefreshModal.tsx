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
    // #region agent log
    fetch('http://127.0.0.1:7862/ingest/8ae7c5b4-3a5e-4c05-8757-84b8a9d6bd29',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'db7918'},body:JSON.stringify({sessionId:'db7918',runId:'pre',hypothesisId:'F',location:'client/src/components/TokenRefreshModal/TokenRefreshModal.tsx:onCancel',message:'TokenRefreshModal onCancel -> logout',data:{},timestamp:Date.now()})}).catch(()=>{});
    // #endregion agent log
    setShowRefreshModal(false);
    logout();
  }, [setShowRefreshModal, logout]);

  useEffect(() => {
    if (!showRefreshModal) return;

    setRemainingSeconds(COUNTDOWN_SECONDS);
    // #region agent log
    fetch('http://127.0.0.1:7862/ingest/8ae7c5b4-3a5e-4c05-8757-84b8a9d6bd29',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'db7918'},body:JSON.stringify({sessionId:'db7918',runId:'pre',hypothesisId:'E',location:'client/src/components/TokenRefreshModal/TokenRefreshModal.tsx:useEffect(showRefreshModal)',message:'Refresh modal opened, countdown reset',data:{countdown:COUNTDOWN_SECONDS},timestamp:Date.now()})}).catch(()=>{});
    // #endregion agent log

    // #region agent log
    fetch('http://127.0.0.1:7862/ingest/8ae7c5b4-3a5e-4c05-8757-84b8a9d6bd29',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'db7918'},body:JSON.stringify({sessionId:'db7918',runId:'pre',hypothesisId:'A',location:'client/src/components/TokenRefreshModal/TokenRefreshModal.tsx:visibility',message:'Modal open: initial visibility state',data:{hidden:document.hidden,visibilityState:document.visibilityState},timestamp:Date.now()})}).catch(()=>{});
    // #endregion agent log

    const onVisibilityChange = () => {
      // #region agent log
      fetch('http://127.0.0.1:7862/ingest/8ae7c5b4-3a5e-4c05-8757-84b8a9d6bd29',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'db7918'},body:JSON.stringify({sessionId:'db7918',runId:'pre',hypothesisId:'A',location:'client/src/components/TokenRefreshModal/TokenRefreshModal.tsx:visibility',message:'document visibilitychange',data:{hidden:document.hidden,visibilityState:document.visibilityState},timestamp:Date.now()})}).catch(()=>{});
      // #endregion agent log
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        const next = Math.max(prev - 1, 0);
        if (next % 60 === 0) {
          // #region agent log
          fetch('http://127.0.0.1:7862/ingest/8ae7c5b4-3a5e-4c05-8757-84b8a9d6bd29',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'db7918'},body:JSON.stringify({sessionId:'db7918',runId:'pre',hypothesisId:'B',location:'client/src/components/TokenRefreshModal/TokenRefreshModal.tsx:tick',message:'Countdown tick (sampled)',data:{remaining:next,hidden:document.hidden,visibilityState:document.visibilityState},timestamp:Date.now()})}).catch(()=>{});
          // #endregion agent log
        }
        return next;
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
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
