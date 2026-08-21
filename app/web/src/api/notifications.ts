import { apiRequest } from './client';

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  linkPath: string | null;
  isRead: boolean;
  createdAt: string;
}

export function listNotifications(token: string) {
  return apiRequest<NotificationItem[]>('/notifications', { token });
}

export async function getUnreadCount(token: string): Promise<number> {
  const result = await apiRequest<{ count: number }>('/notifications/unread-count', { token });
  return result.count;
}

export function markNotificationRead(token: string, id: string) {
  return apiRequest(`/notifications/${id}/read`, { method: 'POST', token });
}

export function markAllNotificationsRead(token: string) {
  return apiRequest('/notifications/read-all', { method: 'POST', token });
}
