import React from 'react';
import UserItem from './UserItem';
import { AdminUser } from '../api/adminApi';

interface UserListProps {
  users: AdminUser[];
  currentUserId: string;
  onPromote: (id: string) => void;
  onDemote: (id: string) => void;
  onDelete: (id: string) => void;
}

const UserList: React.FC<UserListProps> = ({
  users,
  currentUserId,
  onPromote,
  onDemote,
  onDelete,
}) => {
  return (
    <div>
      {users.map(user => (
        <UserItem
          key={user.id}
          user={user}
          currentUserId={currentUserId}
          onPromote={onPromote}
          onDemote={onDemote}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default UserList;
