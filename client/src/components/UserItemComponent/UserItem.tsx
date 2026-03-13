import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import React from 'react';

import { User } from '../../api/adminApi';

interface UserItemProps {
  user: User;
  currentUserId: string;
  onPromote: (id: string) => void;
  onDemote: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
}

const UserItem: React.FC<UserItemProps> = ({
  user,
  currentUserId,
  onPromote,
  onDemote,
  onDelete,
  onRestore,
}) => {
  const isAdmin = user.role === 'admin';
  const isSelf = user.id === currentUserId;
  const isDeleted = !!user.deleted;

  const handlePromoteChange = () => {
    if (isDeleted) return;
    if (isSelf) return;

    if (isAdmin) {
      onDemote(user.id);
    } else {
      onPromote(user.id);
    }
  };

  const handleDelete = () => {
    if (isDeleted) return;
    if (isAdmin || isSelf) return;
    onDelete(user.id);
  };

  const handleRestore = () => {
    if (!isDeleted) return;
    onRestore(user.id);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px',
        borderBottom: '1px solid #ddd',
        gap: '12px',
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
          {user.inactive && (
            <span
              style={{
                marginLeft: '8px',
                fontSize: '0.75em',
                color: '#6b7280',
              }}
            >
              Inactive
            </span>
          )}
          {isDeleted && (
            <span
              style={{
                marginLeft: '8px',
                fontSize: '0.75em',
                color: '#b91c1c',
              }}
            >
              Deleted
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.9em', color: '#666' }}>{user.email}</div>
      </div>

      <div style={{ width: '100px', textAlign: 'center' }}>
        <div style={{ fontSize: '0.9em', color: '#666', textAlign: 'center' }}>
          Last login
        </div>
        <div style={{ fontSize: '0.7em', color: '#666', textAlign: 'center' }}>
          {user.lastLoginAt
            ? new Date(user.lastLoginAt).toLocaleDateString()
            : '—'}
        </div>
      </div>

      <div
        style={{
          width: '80px',
          textAlign: 'center',
          fontSize: '0.9em',
          color: '#666',
        }}
      >
        Todos: {user.todoCount}
      </div>

      <Button
        label={isDeleted ? 'Restore' : 'Delete'}
        onClick={isDeleted ? handleRestore : handleDelete}
        disabled={(isDeleted && isSelf) || (!isDeleted && (isAdmin || isSelf))}
        className={
          isDeleted
            ? 'p-button-success'
            : isAdmin || isSelf
              ? 'p-button-secondary'
              : 'p-button-danger'
        }
        style={{ width: '80px' }}
      />
    </div>
  );
};

export default UserItem;
