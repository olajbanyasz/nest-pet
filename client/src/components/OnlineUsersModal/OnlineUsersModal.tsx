import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ListBox } from 'primereact/listbox';
import React, { useState } from 'react';

interface OnlineUsersModalProps {
  onlineCount: number;
  onlineUsers: string[];
}

const OnlineUsersModal: React.FC<OnlineUsersModalProps> = ({
  onlineCount,
  onlineUsers,
}) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex justify-content-center">
      <Button
        label="Show Online Users"
        badge={String(onlineCount)}
        onClick={() => setVisible(true)}
        className="p-button-success"
      />
      <Dialog
        header="Online Users"
        visible={visible}
        style={{ width: '50vw' }}
        onHide={() => {
          if (!visible) return;
          setVisible(false);
        }}
      >
        {onlineCount > 0 ? (
          <ListBox style={{ maxHeight: '300px', overflow: 'auto' }} options={onlineUsers} />
        ) : (
          <p>No online user.</p>
        )}
      </Dialog>
    </div>
  );
};

export default OnlineUsersModal;
