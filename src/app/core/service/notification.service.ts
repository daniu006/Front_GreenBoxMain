import { Injectable } from '@angular/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Platform } from '@ionic/angular/standalone';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private fcmToken: string | null = null;

    constructor(
        private apiService: ApiService,
        private authService: AuthService,
        private platform: Platform
    ) { }

    /**
     * Inicializa la configuración de notificaciones push
     */
    async initPush() {
        if (!this.platform.is('capacitor')) {
            console.warn('Push notifications only work on native devices');
            return;
        }

        const permission = await PushNotifications.requestPermissions();

        if (permission.receive === 'granted') {
            await PushNotifications.register();
        } else {
            alert('PERMISO DENEGADO para notificaciones.');
            return;
        }

        PushNotifications.addListener('registration', (token: Token) => {
            alert(`TOKEN GENERADO:\n${token.value.substring(0, 15)}...`);
            console.log('Push registration success:', token.value);
            this.fcmToken = token.value;
            localStorage.setItem('fcm_token', token.value);
            this.updateTokenInBackend(token.value);
        });

        PushNotifications.addListener('registrationError', (error: any) => {
            alert('ERROR GENERANDO TOKEN:\n' + JSON.stringify(error));
        });

        PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
            console.log('Push received:', notification);
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
            console.log('Push action:', notification);
        });
    }

    private async updateTokenInBackend(token: string) {
        const boxId = this.authService.getBoxId();
        if (boxId) {
            try {
                alert(`ENVIANDO TOKEN AL SERVIDOR...\nBox ID: ${boxId}`);
                const res = await this.apiService.updateBoxToken(boxId, token);
                alert(`✅ RESPUESTA SERVIDOR:\n${JSON.stringify(res)}`);
            } catch (error: any) {
                alert(`❌ ERROR EN SERVIDOR:\n${JSON.stringify(error)}`);
            }
        } else {
            alert('⚠️ ERROR: No hay Box ID en sesión. Haz login de nuevo.');
        }
    }

    async pushToken() {
        const token = this.fcmToken || localStorage.getItem('fcm_token');

        if (token) {
            alert('Enviando token existente...');
            this.fcmToken = token;
            await this.updateTokenInBackend(token);
        } else {
            alert('No hay token. Iniciando registro...');
            await this.initPush();
        }
    }
}
