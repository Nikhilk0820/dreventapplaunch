import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import {
  IonApp,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonRouterOutlet,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  arrowBackOutline,
  calendarOutline,
  cartOutline,
  closeOutline,
  flashOutline,
  giftOutline,
  gridOutline,
  locationOutline,
  logOutOutline,
  notificationsOutline,
  personOutline,
  phonePortraitOutline,
  refreshOutline,
  ribbonOutline,
  shieldOutline,
  starOutline,
  statsChartOutline,
  timeOutline,
  trendingDownOutline,
  trophyOutline,
  walletOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [
    IonApp,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonList,
    IonMenu,
    IonMenuToggle,
    IonRouterOutlet,
    IonTitle,
    IonToolbar,
  ],
})
export class AppComponent {
  constructor(private router: Router, private menu: MenuController) {
    addIcons({
      alertCircleOutline,
      arrowBackOutline,
      calendarOutline,
      cartOutline,
      closeOutline,
      flashOutline,
      giftOutline,
      gridOutline,
      locationOutline,
      logOutOutline,
      notificationsOutline,
      personOutline,
      phonePortraitOutline,
      refreshOutline,
      'refresh-outline': refreshOutline,
      ribbonOutline,
      shieldOutline,
      starOutline,
      statsChartOutline,
      timeOutline,
      trendingDownOutline,
      trophyOutline,
      walletOutline,
    });
  }

  onLogout() {
    this.menu.close();
    localStorage.removeItem('profileIdentifier');
    localStorage.removeItem('consumerId');
    localStorage.removeItem('authToken');
    this.router.navigateByUrl('/signin', { replaceUrl: true });
  }

  onProfile() {
    this.menu.close();
    this.router.navigateByUrl('/profile');
  }

}
