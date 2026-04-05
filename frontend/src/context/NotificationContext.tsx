import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { UserRole, Notification } from '../types';
import notificationService, { connectNotificationStream } from '../services/notificationService';
import { useAuth } from './AuthContext';

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  loadNotifications: () => Promise<void>;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const role = user?.role as UserRole | undefined;
  const loadNotifications = useCallback(async () => {
    if (!user || !role) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const fetched = await notificationService.getNotifications();
      setNotifications(fetched);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [role, user]);

  const markAsRead = useCallback((id: number) => {
    setNotifications(prev => {
      const hasTarget = prev.some((item) => item.id === id && !item.isRead);
      if (!hasTarget) {
        return prev;
      }
      notificationService.markAsRead(id).catch((error) => {
        console.error('Failed to mark notification as read:', error);
      });
      return prev.map(notif => (notif.id === id ? { ...notif, isRead: true } : notif));
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const unreadIds = prev.filter(n => !n.isRead).map(n => Number(n.id));
      if (unreadIds.length === 0) return prev;
      Promise.all(unreadIds.map((id) => notificationService.markAsRead(id))).catch((error) => {
        console.error('Failed to mark all notifications as read:', error);
      });
      return prev.map(notif => ({ ...notif, isRead: true }));
    });
  }, []);

  const upsertNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => {
      if (prev.some((item) => String(item.id) === String(notification.id))) {
        return prev;
      }
      return [notification, ...prev].slice(0, 50);
    });
  }, []);

  useEffect(() => {
    if (user && role) {
      loadNotifications();
    } else {
      setNotifications([]);
      setLoading(false);
    }
  }, [loadNotifications, role, user]);

  useEffect(() => {
    if (!user || !role) {
      return;
    }

    const interval = setInterval(() => {
      loadNotifications();
    }, 60000);

    return () => clearInterval(interval);
  }, [loadNotifications, role, user]);

  useEffect(() => {
    if (!user || !role) {
      return;
    }

    const disconnect = connectNotificationStream((notification) => {
      upsertNotification(notification);
    });

    return disconnect;
  }, [role, upsertNotification, user]);

  const value = {
    notifications,
    unreadCount: notifications.filter(n => !n.isRead).length,
    loading,
    loadNotifications,
    markAsRead,
    markAllAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
