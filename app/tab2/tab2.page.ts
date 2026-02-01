import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonBadge,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonButton,
  IonIcon,
  IonMenuButton,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { NotificationService } from '../notifications/notification.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    CommonModule,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonButton,
    IonBadge,
    IonIcon,
    IonMenuButton,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab2Page {
  readonly unreadCount$ = this.notificationService.unreadCount$;

  constructor(private router: Router, private notificationService: NotificationService) {}

  onNotifications() {
    this.router.navigateByUrl('/notifications');
  }
}
