/**
 * Notification feed wire contract.
 * `createdAt` is an ISO string — the route serializes dates explicitly.
 */

export interface AppNotification {
  id: string;
  type: 'recommendation' | 'activity';
  title: string;
  body: string;
  href?: string;
  createdAt: string;
}

export interface NotificationsResponse {
  items: AppNotification[];
  unread: number;
}
