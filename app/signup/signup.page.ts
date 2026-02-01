import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-signup',
  templateUrl: 'signup.page.html',
  styleUrls: ['signup.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonButton,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonText,
    IonTitle,
    IonToolbar,
  ],
})
export class SignupPage {
  stepValue: 'personal' | 'electricity' = 'personal';
  personal = {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  };
  showPersonalErrors = false;
  showElectricityErrors = false;
  isSubmitting = false;
  signupError = '';
  private http = inject(HttpClient);
  private router = inject(Router);
  electricity = {
    consumerId: '',
    password: '',
    confirmPassword: '',
  };

  onStepChange(value?: unknown) {
    this.stepValue = value === 'electricity' ? 'electricity' : 'personal';
  }

  goToElectricity() {
    this.showPersonalErrors = true;
    if (!this.isPersonalValid()) {
      return;
    }
    this.stepValue = 'electricity';
  }

  private isPersonalValid() {
    const emailOk = this.isEmailValid();
    const phoneOk = this.isPhoneValid();
    const pinOk = this.isPincodeValid();
    return (
      this.personal.fullName.trim().length > 0 &&
      emailOk &&
      phoneOk &&
      this.personal.address.trim().length > 0 &&
      this.personal.city.trim().length > 0 &&
      pinOk
    );
  }

  isEmailValid() {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.personal.email);
  }

  isPhoneValid() {
    return /^\d{10}$/.test(String(this.personal.phone ?? '').trim());
  }

  isPincodeValid() {
    return /^\d{6}$/.test(String(this.personal.pincode ?? '').trim());
  }

  onPhoneInput() {
    this.personal.phone = this.sanitizeDigits(this.personal.phone, 10);
  }

  onPincodeInput() {
    this.personal.pincode = this.sanitizeDigits(this.personal.pincode, 6);
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

  onConsumerIdInput() {
    this.electricity.consumerId = this.sanitizeDigits(this.electricity.consumerId, 20);
  }

  hasConsumerId() {
    return String(this.electricity.consumerId ?? '').trim().length > 0;
  }

  private sanitizeDigits(value: string | number, maxLen: number) {
    const digitsOnly = String(value ?? '').replace(/\D+/g, '');
    return digitsOnly.slice(0, maxLen);
  }

  isPasswordMatch() {
    return (
      this.electricity.password.trim().length > 0 &&
      this.electricity.password === this.electricity.confirmPassword
    );
  }

  private isElectricityValid() {
    return (
      String(this.electricity.consumerId ?? '').trim().length > 0 &&
      this.electricity.password.trim().length > 0 &&
      this.electricity.confirmPassword.trim().length > 0 &&
      this.isPasswordMatch()
    );
  }

  signup() {
    this.showElectricityErrors = true;
    this.signupError = '';
    if (!this.isElectricityValid()) {
      return;
    }
    this.isSubmitting = true;
    const payload = {
      personal: { ...this.personal },
      electricity: {
        consumerId: this.electricity.consumerId,
        password: this.electricity.password,
      },
    };

    this.http.post(`${environment.apiUrl}/signup`, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigateByUrl('/signin');
      },
      error: () => {
        this.isSubmitting = false;
        this.signupError = 'Signup failed. Please try again.';
      },
    });
  }

  goToSignin() {
    this.router.navigateByUrl('/signin');
  }
}
