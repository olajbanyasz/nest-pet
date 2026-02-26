import type { Meta, StoryObj } from '@storybook/react-webpack5';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import {
  AuthContext,
  AuthContextValue,
  User,
} from '../../contexts/AuthContext';
import NavigationBar from './NavigationBar';

const meta: Meta<typeof NavigationBar> = {
  title: 'Components/NavigationBar/NavigationBar',
  component: NavigationBar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NavigationBar>;

const buildAuthValue = (user: User): AuthContextValue => ({
  user,
  loading: false,
  initialized: true,
  showRefreshModal: false,
  setShowRefreshModal: () => {},
  login: () => Promise.resolve({ success: true, user }),
  logout: () => {},
  refresh: () => Promise.resolve(true),
  onlineUsers: [],
  onlineCount: 0,
});

const userAuthValue = buildAuthValue({
  id: 'user-1',
  email: 'john.doe@example.com',
  role: 'user',
  name: 'John Doe',
});

const adminAuthValue = buildAuthValue({
  id: 'admin-1',
  email: 'admin@example.com',
  role: 'admin',
  name: 'Admin User',
});

export const UserOnTodos: Story = {
  name: 'User - Todos Active',
  render: () => (
    <AuthContext.Provider value={userAuthValue}>
      <MemoryRouter initialEntries={['/todos']}>
        <NavigationBar />
      </MemoryRouter>
    </AuthContext.Provider>
  ),
};

export const AdminOnDashboard: Story = {
  name: 'Admin - Dashboard Active',
  render: () => (
    <AuthContext.Provider value={adminAuthValue}>
      <MemoryRouter initialEntries={['/dashboard']}>
        <NavigationBar />
      </MemoryRouter>
    </AuthContext.Provider>
  ),
};

export const UserOnStream: Story = {
  name: 'User - Stream Active',
  render: () => (
    <AuthContext.Provider value={userAuthValue}>
      <MemoryRouter initialEntries={['/stream']}>
        <NavigationBar />
      </MemoryRouter>
    </AuthContext.Provider>
  ),
};
