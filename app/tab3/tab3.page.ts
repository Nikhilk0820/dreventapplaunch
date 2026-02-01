import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonMenuButton,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { NotificationService } from '../notifications/notification.service';
import { DayAheadService, EventWindow } from '../services/day-ahead.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    CommonModule,
    IonBadge,
    IonButton,
    IonCard,
    IonCardContent,
    IonChip,
    IonContent,
    IonHeader,
    IonIcon,
    IonLabel,
    IonMenuButton,
    IonSegment,
    IonSegmentButton,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab3Page {
  segmentValue: 'active' | 'history' = 'active';
  readonly unreadCount$ = this.notificationService.unreadCount$;
  eventWindowLabel = '--:-- - --:--';
  eventStatusText = 'Loading';
  eventStatusColor: 'success' | 'medium' | 'warning' | 'danger' = 'medium';
  eventDetailLabel = '--';
  private eventWindow: EventWindow | null = null;

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private dayAheadService: DayAheadService
  ) {}

  ionViewWillEnter() {
    this.loadEventWindow();
  }

  onSegmentChange(value?: unknown) {
    this.segmentValue = value === 'history' ? 'history' : 'active';
  }

  onNotifications() {
    this.router.navigateByUrl('/notifications');
  }

  private loadEventWindow() {
    this.dayAheadService.getSchedule().subscribe({
      next: (data) => {
        const window = this.dayAheadService.computeEventWindow(data, 4, 3);
        if (!window) {
          this.eventWindowLabel = '--:-- - --:--';
          this.eventStatusText = 'Unavailable';
          this.eventStatusColor = 'medium';
          this.eventDetailLabel = 'No schedule data';
          return;
        }
        this.eventWindow = window;
        this.eventWindowLabel = `${this.formatTime(window.start)} - ${this.formatTime(window.end)}`;
        this.updateStatusLabels(window);
      },
      error: () => {
        this.eventWindowLabel = '--:-- - --:--';
        this.eventStatusText = 'Unavailable';
        this.eventStatusColor = 'medium';
        this.eventDetailLabel = 'Failed to load schedule';
      },
    });
  }

  private updateStatusLabels(window: EventWindow) {
    const now = new Date();
    if (now < window.start) {
      this.eventStatusText = 'Upcoming';
      this.eventStatusColor = 'warning';
      this.eventDetailLabel = this.formatCountdown(window.start, 'starts in');
      return;
    }
    if (now >= window.start && now <= window.end) {
      this.eventStatusText = 'Live';
      this.eventStatusColor = 'success';
      this.eventDetailLabel = this.formatCountdown(window.end, 'remaining');
      return;
    }
    this.eventStatusText = 'Completed';
    this.eventStatusColor = 'medium';
    this.eventDetailLabel = 'Event ended';
  }

  private formatCountdown(target: Date, suffix: string) {
    const totalMinutes = Math.max(0, Math.floor((target.getTime() - Date.now()) / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const parts = [];
    if (hours > 0) {
      parts.push(`${hours}h`);
    }
    parts.push(`${minutes}m`);
    return `${parts.join(' ')} ${suffix}`;
  }

  private formatTime(date: Date) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: false });
  }
}
