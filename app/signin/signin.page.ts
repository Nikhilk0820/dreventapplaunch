import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonText,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-signin',
  templateUrl: 'signin.page.html',
  styleUrls: ['signin.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonButton,
    IonCard,
    IonCardContent,
    IonContent,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonText,
  ],
})
export class SigninPage {
  identifier = '';
  password = '';
  forgotIdentifier = '';
  newPassword = '';
  showForgot = false;
  isSubmitting = false;
  loginError = '';
  forgotError = '';
  private http = inject(HttpClient);

  constructor(private router: Router) {}

  onSignup() {
    this.router.navigateByUrl('/signup');
  }

  toggleForgot() {
    this.showForgot = !this.showForgot;
    this.loginError = '';
    this.forgotError = '';
  }

  onIdentifierInput() {
    this.identifier = this.sanitizeDigits(this.identifier, 20);
  }

  onForgotIdentifierInput() {
    this.forgotIdentifier = this.sanitizeDigits(this.forgotIdentifier, 20);
  }

  onNumericKeydown(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
      'Home',
      'End',
    ];
    if (allowedKeys.includes(event.key)) {
      return;
    }
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  private sanitizeDigits(value: string | number, maxLen: number) {
    const digitsOnly = String(value ?? '').replace(/\D+/g, '');
    return digitsOnly.slice(0, maxLen);
  }

  login() {
    this.loginError = '';
    if (!this.identifier.trim() || !this.password.trim()) {
      this.loginError = 'Please enter your identifier and password.';
      return;
    }
    this.isSubmitting = true;
    const payload = {
      identifier: this.identifier,
      password: this.password,
    };
    this.http.post(`${environment.apiUrl}/login`, payload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        const identifier =
          res?.data?.phone || res?.data?.consumerId || this.identifier;
        localStorage.setItem('profileIdentifier', String(identifier || ''));
        if (res?.data?.consumerId) {
          localStorage.setItem('consumerId', String(res.data.consumerId));
        }
        this.router.navigateByUrl('/tabs/tab1');
      },
      error: (err) => {
        this.isSubmitting = false;
        const status = err?.status;
        if (status === 401) {
          this.loginError = 'Invalid phone/consumer number or password.';
        } else {
          this.loginError = 'Login failed. Please try again.';
        }
      },
    });
  }

  updatePassword() {
    this.forgotError = '';
    if (!this.forgotIdentifier.trim() || !this.newPassword.trim()) {
      this.forgotError = 'Please enter your identifier and new password.';
      return;
    }
    this.isSubmitting = true;
    const payload = {
      identifier: this.forgotIdentifier,
      newPassword: this.newPassword,
    };
    this.http.post(`${environment.apiUrl}/forgot-password`, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showForgot = false;
        this.forgotIdentifier = '';
        this.newPassword = '';
      },
      error: () => {
        this.isSubmitting = false;
        this.forgotError = 'Password update failed. Please try again.';
      },
    });
  }
}
