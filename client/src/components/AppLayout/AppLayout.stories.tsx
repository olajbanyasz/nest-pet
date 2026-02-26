import type { Meta, StoryObj } from '@storybook/react-webpack5';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { AuthContext, AuthContextValue } from '../../contexts/AuthContext';
import { LoadingProvider } from '../../contexts/LoadingProvider';
import AppLayout from './AppLayout';

const meta: Meta<typeof AppLayout> = {
  title: 'Components/AppLayout/AppLayout',
  component: AppLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof AppLayout>;

const baseUser = {
  id: 'user-1',
  email: 'john.doe@example.com',
  role: 'user' as const,
  name: 'John Doe',
};

const authContextValue: AuthContextValue = {
  user: baseUser,
  loading: false,
  initialized: true,
  showRefreshModal: false,
  setShowRefreshModal: () => {},
  login: () => Promise.resolve({ success: true, user: baseUser }),
  logout: () => {},
  refresh: () => Promise.resolve(true),
  onlineUsers: [],
  onlineCount: 0,
};

const MockPageContent: React.FC = () => (
  <div
    style={{
      maxWidth: '800px',
      margin: '24px auto',
      padding: '24px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      background: '#fff',
    }}
  >
    <h2 style={{ marginTop: 0 }}>Outlet Content</h2>
    <p>This is mock page content rendered through the layout outlet.</p>
  </div>
);

export const Default: Story = {
  render: () => (
    <AuthContext.Provider value={authContextValue}>
      <LoadingProvider>
        <MemoryRouter initialEntries={['/todos']}>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route path="todos" element={<MockPageContent />} />
              <Route path="*" element={<MockPageContent />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </LoadingProvider>
    </AuthContext.Provider>
  ),
};
