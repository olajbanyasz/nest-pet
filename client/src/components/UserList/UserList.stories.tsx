import type { Meta, StoryObj } from '@storybook/react-webpack5';
import React from 'react';

import type { User } from '../../api/adminApi';
import UserList from './UserList';

const meta: Meta<typeof UserList> = {
  title: 'Components/UserList/UserList',
  component: UserList,
  tags: ['autodocs'],
  argTypes: {
    onPromote: { action: 'promoted' },
    onDemote: { action: 'demoted' },
    onDelete: { action: 'deleted' },
  },
};

export default meta;
type Story = StoryObj<typeof UserList>;

const initialUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@example.com',
    name: 'Main Admin',
    role: 'admin',
    lastLoginAt: '2026-02-24T11:30:00Z',
    todoCount: 12,
  },
  {
    id: 'user-1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'user',
    lastLoginAt: '2026-02-23T09:10:00Z',
    todoCount: 4,
  },
  {
    id: 'user-2',
    email: 'alice@example.com',
    name: 'Alice',
    role: 'user',
    lastLoginAt: '2026-02-22T15:45:00Z',
    todoCount: 7,
  },
];

const UserListStoryWrapper: React.FC<{
  initialData: User[];
  currentUserId: string;
  onPromote?: (id: string) => void;
  onDemote?: (id: string) => void;
  onDelete?: (id: string) => void;
}> = ({ initialData, currentUserId, onPromote, onDemote, onDelete }) => {
  const [users, setUsers] = React.useState<User[]>(initialData);

  const handlePromote = (id: string) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, role: 'admin' } : user)),
    );
    onPromote?.(id);
  };

  const handleDemote = (id: string) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, role: 'user' } : user)),
    );
    onDemote?.(id);
  };

  const handleDelete = (id: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
    onDelete?.(id);
  };

  return (
    <div style={{ maxWidth: '980px' }}>
      <UserList
        users={users}
        currentUserId={currentUserId}
        onPromote={handlePromote}
        onDemote={handleDemote}
        onDelete={handleDelete}
      />
    </div>
  );
};

export const Interactive: Story = {
  render: (args) => (
    <UserListStoryWrapper
      initialData={initialUsers}
      currentUserId="admin-1"
      onPromote={args.onPromote as ((id: string) => void) | undefined}
      onDemote={args.onDemote as ((id: string) => void) | undefined}
      onDelete={args.onDelete as ((id: string) => void) | undefined}
    />
  ),
};
