import React from 'react';

import { User } from '../../api/adminApi';
import UserItem from '../UserItemComponent/UserItem';

interface UserListProps {
  users: User[];
  currentUserId: string;
  onPromote: (id: string) => void;
  onDemote: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
}

const UserList: React.FC<UserListProps> = ({
  users,
  currentUserId,
  onPromote,
  onDemote,
  onDelete,
  onRestore,
}) => {
  return (
    <div>
      {users.map((user) => (
        <UserItem
          key={user.id}
          user={user}
          currentUserId={currentUserId}
          onPromote={onPromote}
          onDemote={onDemote}
          onDelete={onDelete}
          onRestore={onRestore}
        />
      ))}
    </div>
  );
};

export default UserList;
