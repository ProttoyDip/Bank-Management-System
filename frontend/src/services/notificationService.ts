import api from "./api";
import { Notification, NotificationType } from "../types";

function normalizeType(type: string): NotificationType {
  const value = String(type || "").trim().toLowerCase();
  if (value === "loan") return NotificationType.LOAN;
  if (value === "kyc") return NotificationType.SYSTEM;
  if (value === "transaction") return NotificationType.TRANSACTION;
  return NotificationType.SYSTEM;
}

function toNotification(item: any): Notification {
  return {
    id: Number(item.id),
    title: item.title || "Update",
    message: item.message || "You have a new update.",
    type: normalizeType(item.type),
    transactionId: item.transactionId ? Number(item.transactionId) : undefined,
    isRead: Boolean(item.isRead),
    createdAt: item.createdAt || new Date().toISOString(),
  };
}

export const notificationService = {
  async getNotifications(limit = 50): Promise<Notification[]> {
    const response = await api.get("/notifications", { params: { limit } });
    const rows = response.data?.data || [];
    return Array.isArray(rows) ? rows.map(toNotification) : [];
  },

  async markAsRead(id: number): Promise<void> {
    await api.put(`/notifications/${id}/read`);
  },
};

export default notificationService;

export function connectNotificationStream(
  onNotification: (notification: Notification) => void
): () => void {
  if (typeof window === "undefined" || !("EventSource" in window)) {
    return () => undefined;
  }

  const token = localStorage.getItem("token");
  const query = token ? `?token=${encodeURIComponent(token)}` : "";
  const source = new EventSource(`/api/notifications/stream${query}`, { withCredentials: true });

  source.addEventListener("notification", (event) => {
    const payload = JSON.parse((event as MessageEvent).data);
    onNotification(toNotification(payload));
  });

  source.onerror = () => {
    // Browser handles reconnect attempts automatically.
  };

  return () => source.close();
}
