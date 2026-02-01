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

        // Solicitar permisos
        const permission = await PushNotifications.requestPermissions();

        if (permission.receive === 'granted') {
            // Registrar dispositivo en FCM
            await PushNotifications.register();
        } else {
            console.error('Push notification permission denied');
            return;
        }

        // Escuchar cuando el token se genera
        PushNotifications.addListener('registration', (token: Token) => {
            console.log('Push registration success, token: ' + token.value);
            this.fcmToken = token.value;
            localStorage.setItem('fcm_token', token.value); // Persistir token
            this.updateTokenInBackend(token.value);
        });

        // Escuchar errores de registro
        PushNotifications.addListener('registrationError', (error: any) => {
            console.error('Error on registration: ' + JSON.stringify(error));
        });

        // Escuchar cuando llega una notificación (app en primer plano)
        PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
            console.log('Push received: ' + JSON.stringify(notification));
        });

        // Escuchar cuando el usuario toca la notificación
        PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
            console.log('Push action performed: ' + JSON.stringify(notification));
        });
    }

    /**
     * Envía el token al backend para guardarlo en la Box actual
     */
    private async updateTokenInBackend(token: string) {
        const boxId = this.authService.getBoxId();
        if (boxId) {
            try {
                await this.apiService.updateBoxToken(boxId, token);
                console.log('FCM Token updated in backend successfully for Box:', boxId);
            } catch (error) {
                console.error('Error updating FCM Token in backend:', error);
            }
        } else {
            console.warn('Cannot update FCM Token: No boxId found in session yet.');
        }
    }

    /**
     * Intenta enviar el token guardado al backend (útil después del login)
     */
    async pushToken() {
        // Intentar recuperar de memoria o localStorage
        const token = this.fcmToken || localStorage.getItem('fcm_token');

        if (token) {
            console.log('Pushing existing token to backend...');
            this.fcmToken = token; // Sincronizar memoria
            await this.updateTokenInBackend(token);
        } else {
            console.log('No token found. Requesting permission/registration again...');
            // Si no hay token, intentar inicializar de nuevo para obtenerlo
            await this.initPush();
        }
    }
}
