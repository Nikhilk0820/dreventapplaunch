import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
};

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'DR Event Starting Soon',
    message: 'Evening Peak Reduction starts in 30 minutes.',
    time: 'Just now',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Coins Earned',
    message: 'You earned +150 coins for completing the event.',
    time: '1h ago',
    read: false,
  },
  {
    id: 'notif-3',
    title: 'Level Up',
    message: 'You reached Silver status. Keep going!',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 'notif-4',
    title: 'New Offer',
    message: 'Redeem 500 coins for a mobile recharge.',
    time: '2 days ago',
    read: true,
  },
  {
    id: 'notif-5',
    title: 'New Offer',
    message: 'Redeem 500 coins for a mobile recharge.',
    time: '2 days ago',
    read: false,
  },
];

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  readonly notifications$ = this.notificationsSubject.asObservable();
  readonly unreadCount$ = this.notifications$.pipe(
    map((items) => items.filter((item) => !item.read).length),
  );

  markAsRead(id: string) {
    const current = this.notificationsSubject.value;
    const next = current.map((item) => (item.id === id ? { ...item, read: true } : item));
    this.notificationsSubject.next(next);
  }

  markAllRead() {
    const current = this.notificationsSubject.value;
    const next = current.map((item) => ({ ...item, read: true }));
    this.notificationsSubject.next(next);
  }
}
