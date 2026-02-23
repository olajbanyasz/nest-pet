import type { Meta, StoryObj } from '@storybook/react-webpack5';

import UserItem from './UserItem';

const meta: Meta<typeof UserItem> = {
  title: 'Components/UserItem',
  component: UserItem,
  tags: ['autodocs'],
  argTypes: {
    onPromote: { action: 'promoted' },
    onDemote: { action: 'demoted' },
    onDelete: { action: 'deleted' },
  },
};

export default meta;
type Story = StoryObj<typeof UserItem>;

const baseUser = {
  id: 'user-1',
  email: 'john.doe@example.com',
  name: 'John Doe',
  role: 'user' as const,
  lastLoginAt: '2026-02-20T10:30:00Z',
  todoCount: 5,
};

/** Regular user - promote and delete buttons are enabled */
export const RegularUser: Story = {
  name: 'Regular User',
  args: {
    user: baseUser,
    currentUserId: 'current-user-99',
  },
};

/** Admin user - checkbox checked, delete disabled */
export const AdminUser: Story = {
  name: 'Admin User',
  args: {
    user: { ...baseUser, id: 'user-2', role: 'admin' },
    currentUserId: 'current-user-99',
  },
};

/** Currently logged-in user - checkbox and delete disabled, "(you)" label */
export const SelfUser: Story = {
  name: 'Current User',
  args: {
    user: baseUser,
    currentUserId: 'user-1',
  },
};

/** Admin + current user combination */
export const SelfAdmin: Story = {
  name: 'Current Admin User',
  args: {
    user: { ...baseUser, role: 'admin' },
    currentUserId: 'user-1',
  },
};

/** User without last login and name */
export const NoLastLogin: Story = {
  name: 'No Last Login',
  args: {
    user: { ...baseUser, lastLoginAt: undefined, name: undefined },
    currentUserId: 'current-user-99',
  },
};
