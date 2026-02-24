import type { Meta, StoryObj } from '@storybook/react-webpack5';
import React, { useEffect, useRef } from 'react';

import {
  Notification as NotificationItem,
  NotificationProvider,
  NotificationType,
  useNotification,
} from '../../contexts/NotificationContext';
import Notification from './Notification';

const meta: Meta<typeof Notification> = {
  title: 'Components/Notification/Notification',
  component: Notification,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Notification>;

const NotificationSeeder: React.FC<{ items: NotificationItem[] }> = ({
  items,
}) => {
  const { notify } = useNotification();
  const seededRef = useRef(false);

  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;

    items.forEach((item) => {
      notify(item.message, item.type, 0);
    });
  }, [items, notify]);

  return null;
};

const renderWithNotifications = (items: NotificationItem[]) => (
  <NotificationProvider>
    <NotificationSeeder items={items} />
    <Notification />
  </NotificationProvider>
);

const buildItem = (
  id: string,
  type: NotificationType,
  message: string,
): NotificationItem => ({
  id,
  type,
  message,
});

export const Success: Story = {
  render: () =>
    renderWithNotifications([
      buildItem('success-1', 'success', 'Todo created successfully.'),
    ]),
};

export const Error: Story = {
  render: () =>
    renderWithNotifications([
      buildItem('error-1', 'error', 'Failed to save changes.'),
    ]),
};

export const AllTypes: Story = {
  render: () =>
    renderWithNotifications([
      buildItem('success-1', 'success', 'Saved successfully.'),
      buildItem('info-1', 'info', 'Sync in progress.'),
      buildItem('warning-1', 'warning', 'Token expires in 2 minutes.'),
      buildItem('error-1', 'error', 'Network connection lost.'),
    ]),
};
