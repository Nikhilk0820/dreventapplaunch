import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { environment } from '../../environments/environment';
import { NotificationService } from '../notifications/notification.service';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  imports: [CommonModule, IonBadge, IonButton, IonCard, IonCardContent, IonChip, IonContent, IonHeader, IonIcon, IonMenuButton, IonTitle, IonToolbar],
})
export class Tab4Page implements OnInit {
  wallet = {
    coins: 0,
    tier: '',
    nextTier: '',
    nextTierThreshold: 0,
  };
  levels: Array<{ name: string; min: number; max: number | null; status: string }> = [];
  badges: Array<{ name: string; desc: string; status: string }> = [];
  progressPercent = 0;
  progressRemaining = 0;
  loading = false;
  error = '';

  private http = inject(HttpClient);
  readonly unreadCount$ = this.notificationService.unreadCount$;

  constructor(private router: Router, private notificationService: NotificationService) {}

  ngOnInit() {
    this.loadRewards();
  }

  onNotifications() {
    this.router.navigateByUrl('/notifications');
  }

  refreshRewards() {
    if (this.loading) {
      return;
    }
    this.loadRewards();
  }

  private loadRewards() {
    const consumerId = localStorage.getItem('consumerId') || '';
    if (!consumerId) {
      this.error = 'No consumer found. Please sign in again.';
      return;
    }
    this.error = '';
    this.loading = true;
    this.http
      .get(`${environment.apiUrl}/rewards/overview?consumerId=${encodeURIComponent(consumerId)}`)
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          const data = res?.data;
          if (!data) return;
          this.wallet = data.wallet || this.wallet;
          this.levels = Array.isArray(data.levels) ? data.levels : [];
          this.badges = Array.isArray(data.badges) ? data.badges : [];
          this.computeProgress();
        },
        error: () => {
          this.loading = false;
          this.error = 'Unable to load rewards.';
        },
      });
  }

  private computeProgress() {
    const current = this.levels.find((lvl) => lvl.status === 'current');
    const next = this.levels.find((lvl) => lvl.name === this.wallet.nextTier);
    if (!current || !next) {
      this.progressPercent = 100;
      this.progressRemaining = 0;
      return;
    }
    const span = Math.max(1, next.min - current.min);
    const progress = ((this.wallet.coins - current.min) / span) * 100;
    this.progressPercent = Math.max(0, Math.min(100, Math.round(progress)));
    this.progressRemaining = Math.max(0, next.min - this.wallet.coins);
  }

  formatCoins(value: number) {
    return value.toLocaleString();
  }

  badgeIcon(name: string) {
    const key = name.toLowerCase();
    if (key.includes('event')) return 'star-outline';
    if (key.includes('saver')) return 'ribbon-outline';
    if (key.includes('warrior')) return 'trophy-outline';
    if (key.includes('grid')) return 'shield-outline';
    if (key.includes('consistency')) return 'flash-outline';
    return 'star-outline';
  }
}
