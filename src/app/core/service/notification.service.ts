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

        try {
            const permission = await PushNotifications.requestPermissions();

            if (permission.receive !== 'granted') {
                console.warn('[Notifications] Permiso denegado para notificaciones push');
                return;
            }

            await PushNotifications.register();

            PushNotifications.addListener('registration', (token: Token) => {
                console.log('[Notifications] Token FCM generado correctamente');
                this.fcmToken = token.value;
                localStorage.setItem('fcm_token', token.value);
                this.updateTokenInBackend(token.value);
            });

            PushNotifications.addListener('registrationError', (error: any) => {
                console.error('[Notifications] Error generando token FCM:', error);
            });

            PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
                console.log('[Notifications] Notificación recibida:', notification.title);
            });

            PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
                console.log('[Notifications] Acción en notificación:', notification.actionId);
            });

        } catch (error) {
            console.error('[Notifications] Error inicializando push:', error);
        }
    }

    private async updateTokenInBackend(token: string) {
        const boxId = this.authService.getBoxId();
        if (!boxId) {
            console.warn('[Notifications] No hay boxId en sesión, no se puede registrar token');
            return;
        }

        try {
            await this.apiService.updateBoxToken(boxId, token);
            console.log('[Notifications] Token registrado en el servidor correctamente');
        } catch (error) {
            // Error silencioso — no interrumpir la experiencia del usuario
            // por un fallo en el registro del token
            console.error('[Notifications] Error registrando token en servidor:', error);
        }
    }

    async pushToken() {
        const token = this.fcmToken || localStorage.getItem('fcm_token');

        if (token) {
            this.fcmToken = token;
            await this.updateTokenInBackend(token);
        } else {
            await this.initPush();
        }
    }
}
