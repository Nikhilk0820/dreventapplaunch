import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  IonButton,
  IonBadge,
  IonCard,
  IonCardContent,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonToolbar,
} from '@ionic/angular/standalone';
import { environment } from '../../environments/environment';
import { NotificationService } from '../notifications/notification.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [CommonModule, IonButton, IonBadge, IonCard, IonCardContent, IonChip, IonContent, IonHeader, IonIcon, IonMenuButton, IonToolbar],
})
export class Tab1Page {
  currentConsumption = '0.00';
  lastUpdatedLabel = '--:--';
  averageConsumption = '0.00';
  trendLabel = 'from avg';
  trendValue = '0%';
  trendClass = 'neutral';
  chartXLabels: string[] = [];
  chartYLabels: string[] = [];
  chartPath = '';
  chartAreaPath = '';
  chartPoints: { x: number; y: number }[] = [];
  chartData: { x: number; y: number; time: string; value: string }[] = [];
  chartLegend: { time: string; value: string }[] = [];
  private refreshTimer?: number;
  private refreshTimeout?: number;
  private http = inject(HttpClient);

  readonly unreadCount$ = this.notificationService.unreadCount$;

  constructor(private router: Router, private notificationService: NotificationService) {}

  ionViewWillEnter() {
    this.clearRefreshTimers();
    this.loadUsage();
    this.scheduleRefresh();
  }

  ionViewWillLeave() {
    this.clearRefreshTimers();
  }

  onNotifications() {
    this.router.navigateByUrl('/notifications');
  }

  onJoinEvent() {
    this.router.navigateByUrl('/tabs/tab3');
  }

  private loadUsage() {
    const consumerId = localStorage.getItem('consumerId') || '';
    if (!consumerId) {
      return;
    }
    this.http.get(`${environment.apiUrl}/usage?limit=5&consumerId=${encodeURIComponent(consumerId)}`).subscribe({
      next: (res: any) => {
        const raw = Array.isArray(res?.data) ? res.data : [];
        const data = raw
          .slice()
          .sort((a: any, b: any) => {
            const at = new Date(String(a.timestamp || '').replace(' ', 'T')).getTime();
            const bt = new Date(String(b.timestamp || '').replace(' ', 'T')).getTime();
            return at - bt;
          })
          .slice(-5);
        if (!data.length) {
          return;
        }
        const last = data[data.length - 1];
        this.currentConsumption = Number(last.kWh).toFixed(2);
        this.lastUpdatedLabel = this.formatTime(last.timestamp);
        this.chartXLabels = data.map((d: any) => this.formatTime(d.timestamp));
        this.chartLegend = data.map((d: any) => ({
          time: this.formatTime(d.timestamp),
          value: Number(d.kWh).toFixed(2),
        }));
        this.updateChart(data);
        this.updateAverage(data);
      },
    });
  }

  private scheduleRefresh() {
    const now = new Date();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ms = now.getMilliseconds();
    const minutesToNextHalf = minutes < 30 ? 30 - minutes : 60 - minutes;
    const delay = (minutesToNextHalf * 60 - seconds) * 1000 - ms;
    this.refreshTimeout = window.setTimeout(() => {
      this.loadUsage();
      this.refreshTimer = window.setInterval(() => this.loadUsage(), 30 * 60 * 1000);
    }, Math.max(1000, delay));
  }

  private clearRefreshTimers() {
    if (this.refreshTimer) {
      window.clearInterval(this.refreshTimer);
      this.refreshTimer = undefined;
    }
    if (this.refreshTimeout) {
      window.clearTimeout(this.refreshTimeout);
      this.refreshTimeout = undefined;
    }
  }

  private updateChart(data: Array<{ timestamp: string; kWh: number }>) {
    const values = data.map((d) => Number(d.kWh));
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const width = 320;
    const height = 140;
    const paddingX = 10;
    const paddingTop = 20;
    const paddingBottom = 20;
    const chartW = width - paddingX * 2;
    const chartH = height - paddingTop - paddingBottom;

    this.chartPoints = values.map((value, index) => {
      const x = paddingX + (chartW * index) / (values.length - 1 || 1);
      const y = paddingTop + ((max - value) / range) * chartH;
      return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
    });

    if (!this.chartPoints.length) {
      this.chartPath = '';
      this.chartAreaPath = '';
      return;
    }

    this.chartPath = this.chartPoints
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');

    const first = this.chartPoints[0];
    const last = this.chartPoints[this.chartPoints.length - 1];
    const baselineY = paddingTop + chartH;
    this.chartAreaPath = `${this.chartPath} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;

    const steps = 5;
    this.chartYLabels = Array.from({ length: steps }, (_, i) => {
      const value = max - (range * i) / (steps - 1);
      return value.toFixed(2);
    });

    this.chartData = this.chartPoints.map((point, index) => ({
      x: point.x,
      y: point.y,
      time: this.chartXLabels[index] || '',
      value: values[index].toFixed(2),
    }));
  }

  private updateAverage(data: Array<{ kWh: number }>) {
    const values = data.map((d) => Number(d.kWh));
    const avg = values.reduce((sum, v) => sum + v, 0) / (values.length || 1);
    const current = Number(this.currentConsumption);
    const delta = avg === 0 ? 0 : ((current - avg) / avg) * 100;
    this.averageConsumption = avg.toFixed(2);
    this.trendValue = `${delta >= 0 ? '+' : ''}${delta.toFixed(0)}%`;
    if (delta > 0.5) {
      this.trendClass = 'up';
    } else if (delta < -0.5) {
      this.trendClass = 'down';
    } else {
      this.trendClass = 'neutral';
    }
  }

  private formatTime(timestamp: string) {
    const date = new Date(timestamp.replace(' ', 'T'));
    if (Number.isNaN(date.getTime())) {
      return '--:--';
    }
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: false });
  }
}
