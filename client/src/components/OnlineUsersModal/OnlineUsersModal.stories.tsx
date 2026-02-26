import type { Meta, StoryObj } from '@storybook/react-webpack5';

import OnlineUsersModal from './OnlineUsersModal';

const meta: Meta<typeof OnlineUsersModal> = {
  title: 'Components/OnlineUsersModal/OnlineUsersModal',
  component: OnlineUsersModal,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof OnlineUsersModal>;

export const FewOnlineUsers: Story = {
  args: {
    onlineCount: 3,
    onlineUsers: ['john.doe@example.com', 'admin@example.com', 'alice@acme.io'],
  },
};

export const NoOnlineUser: Story = {
  args: {
    onlineCount: 0,
    onlineUsers: [],
  },
};

export const ManyOnlineUsers: Story = {
  args: {
    onlineCount: 12,
    onlineUsers: [
      'user1@example.com',
      'user2@example.com',
      'user3@example.com',
      'user4@example.com',
      'user5@example.com',
      'user6@example.com',
      'user7@example.com',
      'user8@example.com',
      'user9@example.com',
      'user10@example.com',
      'user11@example.com',
      'user12@example.com',
    ],
  },
};
