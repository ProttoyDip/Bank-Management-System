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
  const [kycCache, setKycCache] = useState<{ timestamp: number } | null>(null);
  const { user } = useAuth();

  const role = user?.role as UserRole | undefined;
  const userId = user?.id;

  const getStorageKey = useCallback(() => {
    const roleKey = role?.toLowerCase() || 'guest';
    return `notifications_${roleKey}${userId ? `_${userId}` : ''}`;
  }, [role, userId]);

  const loadNotifications = useCallback(async () => {
    if (!user || !role) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    if (role === 'Customer' && !userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let fetched: Notification[];
      const customerSkipKyc = role === 'Customer' && kycCache !== null && Date.now() - kycCache.timestamp < 300000;

      switch (role) {
        case 'Customer':
          fetched = await notificationService.getCustomerNotifications(userId!, { skipKyc: customerSkipKyc });
          if (!customerSkipKyc) {
            setKycCache({ timestamp: Date.now() });
          }
          break;
        case 'Admin':
          fetched = await notificationService.getAdminNotifications();
          break;
        case 'Employee':
          fetched = await notificationService.getEmployeeNotifications();
          break;
        default:
          fetched = [];
      }

      const storageKey = getStorageKey();
      const stored = localStorage.getItem(storageKey);
      const storedMap = stored ? JSON.parse(stored) as Record<number, boolean> : {};

      const merged = fetched.map(notif => ({
        ...notif,
        isRead: storedMap[notif.id] || notif.isRead
      }));

      setNotifications(merged);
      localStorage.setItem(storageKey, JSON.stringify(storedMap));
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [role, userId, getStorageKey]);

  const markAsRead = useCallback((id: number) => {
    setNotifications(prev => {
      const updated = prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      );
      const storageKey = getStorageKey();
      const stored = localStorage.getItem(storageKey);
      const storedMap = stored ? JSON.parse(stored) as Record<number, boolean> : {};
      storedMap[id] = true;
      localStorage.setItem(storageKey, JSON.stringify(storedMap));
      return updated;
    });
  }, [getStorageKey]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const unreadIds = prev.filter(n => !n.isRead).map(n => n.id);
      if (unreadIds.length === 0) return prev;

      const storageKey = getStorageKey();
      const stored = localStorage.getItem(storageKey);
      const storedMap = stored ? JSON.parse(stored) as Record<number, boolean> : {};
      unreadIds.forEach(id => storedMap[id] = true);
      localStorage.setItem(storageKey, JSON.stringify(storedMap));

      return prev.map(notif => ({ ...notif, isRead: true }));
    });
  }, [getStorageKey]);

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

    const disconnect = connectNotificationStream((notification) => {
      upsertNotification(notification);
    });

    return disconnect;
  }, [role, upsertNotification, user]);

  useEffect(() => {
    if (!loading && notifications.length > 0) {
      const interval = setInterval(() => {
        loadNotifications();
      }, 300000); // poll every 5 minutes

      return () => clearInterval(interval);
    }
  }, [loadNotifications, loading, notifications.length]);

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
