import { createContext } from "react";
import type { Notification } from "../types";

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  loadNotifications: () => Promise<void>;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
