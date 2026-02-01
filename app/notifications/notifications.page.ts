import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { NotificationItem, NotificationService } from './notification.service';

@Component({
  selector: 'app-notifications',
  templateUrl: 'notifications.page.html',
  styleUrls: ['notifications.page.scss'],
  imports: [
    CommonModule,
    IonBackButton,
    IonBadge,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonTitle,
    IonToolbar,
  ],
})
export class NotificationsPage {
  readonly notifications$ = this.notificationService.notifications$;

  constructor(private notificationService: NotificationService) {}

  markAsRead(item: NotificationItem) {
    if (!item.read) {
      this.notificationService.markAsRead(item.id);
    }
  }

  trackById(_: number, item: NotificationItem) {
    return item.id;
  }
}
