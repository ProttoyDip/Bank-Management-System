import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { UserRole, Notification } from '../types';
import notificationService from '../services/notificationService';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  loadNotifications: () => Promise<void>;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const inFlightRef = useRef(false);

  const role = user?.role as UserRole | undefined;
  const userId = user?.id;

  const getStorageKey = useCallback(() => {
    const roleKey = role?.toLowerCase() || 'guest';
    return `notifications_${roleKey}${userId ? `_${userId}` : ''}`;
  }, [role, userId]);

  const loadNotifications = useCallback(async () => {
    if (inFlightRef.current) {
      return;
    }

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
    inFlightRef.current = true;
    try {
      let fetched: Notification[];
      switch (role) {
        case 'Customer':
          fetched = await notificationService.getCustomerNotifications(userId!);
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

      // Merge with localStorage (preserve read status)
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
      inFlightRef.current = false;
      setLoading(false);
    }
  }, [role, userId, getStorageKey]);

  const markAsRead = useCallback((id: number) => {
    setNotifications(prev => {
      const updated = prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      );
      // Update storage
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

      // Update storage
      const storageKey = getStorageKey();
      const stored = localStorage.getItem(storageKey);
      const storedMap = stored ? JSON.parse(stored) as Record<number, boolean> : {};
      unreadIds.forEach(id => storedMap[id] = true);
      localStorage.setItem(storageKey, JSON.stringify(storedMap));

      return prev.map(notif => ({ ...notif, isRead: true }));
    });
  }, [getStorageKey]);

  // Initial load and polling
  useEffect(() => {
    if (user && role) {
      loadNotifications();
    } else {
      setNotifications([]);
      setLoading(false);
    }
  }, [loadNotifications, role, user]);

  // Poll less aggressively to avoid unnecessary API pressure
  useEffect(() => {
    if (!loading && notifications.length > 0) {
      const interval = setInterval(() => {
        loadNotifications();
      }, 120000);

      return () => clearInterval(interval);
    }
  }, [loadNotifications, loading, notifications.length]);

  const value: NotificationContextType = {
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

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

