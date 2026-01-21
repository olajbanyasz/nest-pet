import React from 'react';
import { AdminUser } from '../api/adminApi';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';

interface UserItemProps {
  user: AdminUser;
  currentUserId: string;
  onPromote: (id: string) => void;
  onDemote: (id: string) => void;
  onDelete: (id: string) => void;
}

const UserItem: React.FC<UserItemProps> = ({
  user,
  currentUserId,
  onPromote,
  onDemote,
  onDelete,
}) => {
  const isAdmin = user.role === 'admin';
  const isSelf = user.id === currentUserId;

  const handlePromoteChange = () => {
    if (isSelf) return;

    if (isAdmin) {
      onDemote(user.id);
    } else {
      onPromote(user.id);
    }
  };

  const handleDelete = () => {
    if (isAdmin || isSelf) return;
    onDelete(user.id);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px',
        borderBottom: '1px solid #ddd',
        gap: '12px',
        opacity: isSelf ? 0.7 : 1,
      }}
    >
      <Checkbox
        checked={isAdmin}
        disabled={isSelf}
        onChange={handlePromoteChange}
        title={
          isSelf
            ? 'You cannot change your own role'
            : isAdmin
            ? 'Admin user'
            : 'Promote to admin'
        }
      />

      <div style={{ flexGrow: 1 }}>
        <div style={{ fontWeight: 600 }}>
          {user.name || '—'} {isSelf && '(you)'}
        </div>
        <div style={{ fontSize: '0.9em', color: '#666' }}>
          {user.email}
        </div>
      </div>

      <Button
        label="Delete"
        onClick={handleDelete}
        disabled={isAdmin || isSelf}
        className={
          isAdmin || isSelf ? 'p-button-secondary' : 'p-button-danger'
        }
        style={{ width: '80px' }}
      />
    </div>
  );
};

export default UserItem;
