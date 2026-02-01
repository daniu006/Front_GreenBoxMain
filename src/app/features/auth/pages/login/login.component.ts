import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonInput,
  IonButton,
  IonIcon,
  IonContent,
  IonLabel,
  IonItem,
  IonSpinner
} from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import {
  lockClosedOutline,
  keyOutline,
  arrowForwardOutline,
  alertCircle,
  checkmarkCircle,
  shieldCheckmarkOutline
} from 'ionicons/icons';
import { AuthService } from '../../../../core/service/auth.service';
import { NotificationService } from '../../../../core/service/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonInput,
    IonButton,
    IonIcon,
    IonContent,
    IonLabel,
    IonItem,
    IonSpinner
  ]
})
export class LoginComponent implements OnInit {
  accessCode: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  messageType: 'error' | 'success' = 'error';

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    addIcons({ lockClosedOutline, keyOutline, arrowForwardOutline, shieldCheckmarkOutline, alertCircle, checkmarkCircle });
  }

  ngOnInit() {
    // Check if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  }

  async onLogin() {
    if (!this.accessCode || this.accessCode.trim() === '') {
      this.showMessage('Por favor ingresa tu código de acceso', 'error');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const result = await this.authService.login(this.accessCode);

      if (result.success) {
        this.showMessage('¡Acceso exitoso!', 'success');

        // Sincronizar token de notificaciones una vez que tenemos boxId
        this.notificationService.pushToken();

        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1000);
      } else {
        this.showMessage(result.message || 'Código de acceso inválido', 'error');
      }

    } catch (error) {
      console.error('Error en login:', error);
      this.showMessage('Error de conexión. Intenta de nuevo', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  private showMessage(message: string, type: 'error' | 'success') {
    this.errorMessage = message;
    this.messageType = type;

    if (type === 'success') {
      setTimeout(() => {
        this.errorMessage = '';
      }, 3000);
    }
  }
}
