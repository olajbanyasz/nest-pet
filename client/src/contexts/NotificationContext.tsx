import React, { createContext, useCallback, useContext, useState } from 'react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

interface NotificationContextValue {
  notifications: Notification[];
  notify: (message: string, type: NotificationType, duration?: number) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined,
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback(
    (id: string) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    },
    [setNotifications],
  );

  const notify = useCallback(
    (message: string, type: NotificationType, duration: number = 3000) => {
      const id = `${Date.now()}-${Math.random()}`;
      const notification: Notification = { id, type, message, duration };

      setNotifications((prev) => [...prev, notification]);

      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }
    },
    [removeNotification],
  );

  return (
    <NotificationContext.Provider
      value={{ notifications, notify, removeNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextValue => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return ctx;
};
