import type { Meta, StoryObj } from '@storybook/react-webpack5';
import React from 'react';

import { AuthContext, AuthContextValue } from '../../contexts/AuthContext';
import { LoadingProvider } from '../../contexts/LoadingProvider';
import TokenRefreshModal from './TokenRefreshModal';

const meta: Meta<typeof TokenRefreshModal> = {
  title: 'Components/TokenRefreshModal/TokenRefreshModal',
  component: TokenRefreshModal,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TokenRefreshModal>;

const baseUser = {
  id: 'user-1',
  email: 'john.doe@example.com',
  role: 'user' as const,
  name: 'John Doe',
};

const TokenRefreshModalStoryWrapper: React.FC<{
  initiallyVisible: boolean;
}> = ({ initiallyVisible }) => {
  const [showRefreshModal, setShowRefreshModal] =
    React.useState(initiallyVisible);

  const authContextValue: AuthContextValue = {
    user: baseUser,
    loading: false,
    initialized: true,
    showRefreshModal,
    setShowRefreshModal,
    login: () => Promise.resolve({ success: true, user: baseUser }),
    logout: () => setShowRefreshModal(false),
    refresh: async () => {
      await Promise.resolve(setShowRefreshModal(false));
      return true;
    },
    onlineUsers: [],
    onlineCount: 0,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <LoadingProvider>
        <TokenRefreshModal />
      </LoadingProvider>
    </AuthContext.Provider>
  );
};

export const Visible: Story = {
  render: () => <TokenRefreshModalStoryWrapper initiallyVisible />,
};
