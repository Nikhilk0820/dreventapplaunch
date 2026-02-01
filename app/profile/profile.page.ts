import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MenuController } from '@ionic/angular';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
  imports: [
    CommonModule,
    IonButton,
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
export class ProfilePage implements OnInit {
  profile: {
    fullName: string;
    consumerId: string;
    phone: string;
    email: string;
    address: string;
  } | null = null;
  loading = false;
  error = '';

  private http = inject(HttpClient);
  private router = inject(Router);
  private menu = inject(MenuController);

  ngOnInit() {
    this.fetchProfile();
  }

  ionViewWillEnter() {
    this.menu.enable(false);
  }

  ionViewWillLeave() {
    this.menu.enable(true);
  }

  goBack() {
    this.router.navigateByUrl('/tabs/tab1');
  }


  private fetchProfile() {
    const identifier = localStorage.getItem('profileIdentifier') || '';
    if (!identifier.trim()) {
      this.error = 'No user info found. Please sign in again.';
      return;
    }
    this.loading = true;
    this.http
      .get(`${environment.apiUrl}/profile`, { params: { identifier } })
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          this.profile = {
            fullName: res?.data?.fullName || '',
            consumerId: res?.data?.consumerId || '',
            phone: res?.data?.phone || '',
            email: res?.data?.email || '',
            address: res?.data?.address || '',
          };
        },
        error: () => {
          this.loading = false;
          this.error = 'Unable to load profile. Please try again.';
        },
      });
  }
}
