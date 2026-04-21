import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SensorData, SensorReading, ActuatorStatus, Alert } from '../models/api.models';
import { ApiError, HttpStatusCode } from '../models/api-error';

@Injectable({ providedIn: 'root' })
export class ApiService {

    private base = environment.apiUrl;

    constructor(private http: HttpClient) { }

    /**
     * Maneja errores HTTP y los convierte en ApiError con mensajes específicos
     */
    private handleHttpError(err: any, context: string, defaultMessage: string): ApiError {
        if (err instanceof HttpErrorResponse) {
            const statusCode = err.status;
            let userMessage = defaultMessage;

            switch (statusCode) {
                case HttpStatusCode.BAD_REQUEST:
                    userMessage = `Solicitud inválida: ${err.error?.message || 'Verifica los datos enviados'}`;
                    break;
                case HttpStatusCode.UNAUTHORIZED:
                    userMessage = 'No autorizado. Por favor, inicia sesión nuevamente';
                    break;
                case HttpStatusCode.FORBIDDEN:
                    userMessage = 'No tienes permisos para realizar esta acción';
                    break;
                case HttpStatusCode.NOT_FOUND:
                    userMessage = `${context} no encontrado`;
                    break;
                case HttpStatusCode.CONFLICT:
                    userMessage = `Conflicto: ${err.error?.message || 'Los datos ya existen'}`;
                    break;
                case HttpStatusCode.INTERNAL_SERVER_ERROR:
                    userMessage = 'Error del servidor. Intenta de nuevo más tarde';
                    break;
                case HttpStatusCode.SERVICE_UNAVAILABLE:
                    userMessage = 'Servicio no disponible. Intenta de nuevo más tarde';
                    break;
                case 0:
                    userMessage = 'Error de conexión. Verifica tu internet';
                    break;
                default:
                    userMessage = defaultMessage;
            }

            return new ApiError(
                statusCode,
                userMessage,
                err.message,
                err.url || undefined
            );
        }

        // Error no HTTP (timeout, red, etc.)
        return new ApiError(
            0,
            'Error de conexión. Verifica tu internet',
            err.message || String(err)
        );
    }

    /* ========== PLANT OPERATIONS ========== */

    /** Obtener todas las plantas disponibles */
    async getPlants(): Promise<any> {
        try {
            return await firstValueFrom(
                this.http.get(`${this.base}/plant`)
            );
        } catch (err) {
            const apiError = this.handleHttpError(err, 'Plantas', 'Error obteniendo catálogo de plantas');
            console.error(`[API] ${apiError.userMessage}`, apiError.technicalMessage);
            return { data: [] };
        }
    }

    /* ========== SENSOR DATA ENDPOINTS ========== */

    /** Datos más recientes de un box (dispositivo físico) */
    async getLatestByBox(boxId: string): Promise<SensorData> {
        try {
            const res = await firstValueFrom(
                this.http.get<any>(`${this.base}/sensors/latest/${boxId}`)
            );

            // Validar si la respuesta es null o vacía (ESP32 no ha enviado datos)
            if (!res || typeof res !== 'object') {
                console.warn(`[API] No hay datos disponibles para el box ${boxId}`);
                return { temp: 0, hum: 0, light: 0, water: 0, soilMoisture: 0, timestamp: new Date().toISOString() };
            }

            return {
                temp: res.temp || 0,
                hum: res.hum || 0,
                light: res.light || 0,
                water: res.water || 0,
                soilMoisture: res.soilMoisture || 0,
                timestamp: res.timestamp || new Date().toISOString()
            };
        } catch (err) {
            const apiError = this.handleHttpError(err, `Box ${boxId}`, 'Error obteniendo datos del sensor');
            console.error(`[API] ${apiError.userMessage}`, apiError.technicalMessage);
            // Retornar datos vacíos en lugar de fallar
            return { temp: 0, hum: 0, light: 0, water: 0, soilMoisture: 0, timestamp: new Date().toISOString() };
        }
    }

    /** Historial de un box ('24h', '7d', '30d') */
    async getHistoryByBox(boxId: string, period: '24h' | '7d' | '30d'): Promise<SensorReading[]> {
        try {
            const res = await firstValueFrom(
                this.http.get<SensorReading[]>(`${this.base}/sensors/history/${boxId}/${period}`)
            );
            return res;
        } catch (err) {
            const apiError = this.handleHttpError(err, `Historial del box ${boxId}`, 'Error obteniendo historial');
            console.error(`[API] ${apiError.userMessage}`, apiError.technicalMessage);
            return [];
        }
    }

    /* ========== ACTUATOR STATUS ========== */

    /** Obtener estado de actuadores (LED y Bomba) */
    async getActuatorStatus(boxId: string): Promise<ActuatorStatus | null> {
        try {
            const res = await firstValueFrom(
                this.http.get<ActuatorStatus>(`${this.base}/sensors/actuators/${boxId}`)
            );

            // Validar si la respuesta es null o no tiene los campos requeridos
            if (!res || typeof res !== 'object') {
                console.warn(`[API] No hay datos de actuadores para el box ${boxId}`);
                return null;
            }

            // Validar que tenga los campos mínimos requeridos
            if (typeof res.led !== 'boolean' || typeof res.pump !== 'boolean') {
                console.warn(`[API] Respuesta de actuadores incompleta para el box ${boxId}`, res);
                return null;
            }

            return res;
        } catch (err) {
            const apiError = this.handleHttpError(err, `Actuadores del box ${boxId}`, 'Error obteniendo estado de actuadores');
            console.error(`[API] ${apiError.userMessage}`, apiError.technicalMessage);
            return null;
        }
    }

    /** Control manual de actuadores */
    async controlActuators(boxId: string, manualLed?: boolean, manualPump?: boolean) {
        const payload: any = {};
        if (manualLed !== undefined) payload.manualLed = manualLed;
        if (manualPump !== undefined) payload.manualPump = manualPump;

        console.log(`[API] 🔧 PATCH /box/${boxId} →`, payload);

        try {
            const res = await firstValueFrom(
                this.http.patch(`${this.base}/box/${boxId}`, payload)
            );
            console.log(`[API] ✅ Respuesta controlActuators:`, res);
            return res;
        } catch (err) {
            const apiError = this.handleHttpError(err, `Control de actuadores`, 'Error controlando actuadores');
            console.error(`[API] ❌ Error controlActuators:`, apiError.userMessage, apiError.technicalMessage);
            throw apiError;
        }
    }

    /* ========== AUTHENTICATION ========== */

    /** Validar código de acceso (login) */
    async validateCode(code: string): Promise<{ valid: boolean; boxId?: string }> {
        try {
            console.log('[API] 🔐 Validando código:', code);
            console.log('[API] 📡 URL del backend:', `${this.base}/auth/validate`);
            console.log('[API] 📤 Payload enviado:', { code });

            const res = await firstValueFrom(
                this.http.post<{ valid: boolean; boxId?: string }>(`${this.base}/auth/validate`, { code })
            );

            console.log('[API] 📥 Respuesta del backend:', res);

            // Si es válido y tiene boxId, guardarlo en localStorage
            if (res.valid && res.boxId) {
                console.log('[API] ✅ Código válido. BoxId:', res.boxId);
                localStorage.setItem('selectedBoxId', res.boxId);
            } else {
                console.warn('[API] ❌ Código inválido o sin boxId:', res);
            }

            return res;
        } catch (err) {
            const apiError = this.handleHttpError(err, 'Código de acceso', 'Error validando código');
            console.error(`[API] 💥 Error en validateCode:`, JSON.stringify({
                userMessage: apiError.userMessage,
                technicalMessage: apiError.technicalMessage,
                statusCode: apiError.statusCode,
                endpoint: apiError.endpoint,
                originalError: err
            }, null, 2));

            // Siempre retornar inválido en caso de error
            return { valid: false };
        }
    }

    /* ========== GUIDE OPERATIONS ========== */

    /** Obtener los pasos de guía para una planta específica */
    async getGuidesByPlant(plantId: number): Promise<any[]> {
        try {
            const res: any = await firstValueFrom(
                this.http.get(`${this.base}/guide/plant/${plantId}`)
            );
            // El endpoint retorna { message, data: GuideStep[], total }
            return Array.isArray(res?.data) ? res.data : [];
        } catch (err) {
            const apiError = this.handleHttpError(err, `Guía de planta ${plantId}`, 'Error obteniendo pasos de la guía');
            console.error(`[API] ${apiError.userMessage}`, apiError.technicalMessage);
            return [];
        }
    }

    /* ========== BOX OPERATIONS ========== */

    /** Actualizar la planta de un box */
    async updateBoxPlant(boxId: string, plantId: number): Promise<any> {
        try {
            return await firstValueFrom(
                this.http.patch(`${this.base}/box/${boxId}`, { plantId })
            );
        } catch (err) {
            const apiError = this.handleHttpError(err, `Box ${boxId}`, `Error actualizando planta (ID: ${plantId})`);
            console.error(`[API] ${apiError.userMessage}`, apiError.technicalMessage);
            throw apiError;
        }
    }

    /** Actualizar el token de notificaciones de un box */
    async updateBoxToken(boxId: string, fcmToken: string): Promise<any> {
        try {
            return await firstValueFrom(
                this.http.post(`${this.base}/box/${boxId}/token`, { token: fcmToken, isLoggedIn: true })
            );
        } catch (err) {
            const apiError = this.handleHttpError(err, `Box ${boxId}`, 'Error actualizando token de notificaciones');
            console.error(`[API] ${apiError.userMessage}`, apiError.technicalMessage);
            throw apiError;
        }
    }

    /** Obtener información completa del box */
    async getBoxInfo(boxId: string): Promise<any> {
        try {
            return await firstValueFrom(
                this.http.get(`${this.base}/box/${boxId}`)
            );
        } catch (err) {
            const apiError = this.handleHttpError(err, `Box ${boxId}`, 'Error obteniendo información del box');
            console.error(`[API] ${apiError.userMessage}`, apiError.technicalMessage);
            throw apiError;
        }
    }

    /* ========== ALERT OPERATIONS ========== */

    /** Obtener todas las alertas (historial) de un box */
    async getNotifications(boxId: string): Promise<Alert[]> {
        try {
            const response: any = await firstValueFrom(
                this.http.get(`${this.base}/alert/box/${boxId}`)
            );

            // Manejar respuesta estilo backend nestjs { data: [...], ... }
            const alerts = Array.isArray(response) ? response : (response.data || []);

            if (!Array.isArray(alerts)) {
                console.warn('Respuesta de alertas no contiene un array válido:', response);
                return [];
            }

            return alerts;
        } catch (err) {
            const apiError = this.handleHttpError(err, `Alertas del box ${boxId}`, 'Error obteniendo historial de alertas');
            console.error(`[API] ${apiError.userMessage}`, apiError.technicalMessage);
            return [];
        }
    }

    /** Obtener alertas activas (no resueltas) de un box */
    async getActiveNotifications(boxId: string): Promise<Alert[]> {
        try {
            const response: any = await firstValueFrom(
                this.http.get(`${this.base}/alert/box/${boxId}/active`)
            );

            // Manejar respuesta { data: [...], ... }
            const alerts = Array.isArray(response) ? response : (response.data || []);

            if (!Array.isArray(alerts)) {
                return [];
            }
            return alerts;
        } catch (err) {
            const apiError = this.handleHttpError(err, `Alertas activas`, 'Error obteniendo alertas activas');
            console.error(`[API] ${apiError.userMessage}`, apiError.technicalMessage);
            return [];
        }
    }

    /** Marcar una alerta como resuelta */
    async markNotificationAsRead(notificationId: number): Promise<any> {
        try {
            return await firstValueFrom(
                this.http.patch(`${this.base}/alert/${notificationId}/resolve`, {})
            );
        } catch (err) {
            const apiError = this.handleHttpError(err, `Alerta ${notificationId}`, 'Error resolviendo la alerta');
            console.error(`[API] ${apiError.userMessage}`, apiError.technicalMessage);
            throw apiError;
        }
    }

    /** Marcar todas las alertas como leídas */
    async markAllNotificationsAsRead(boxId: string): Promise<any> {
        try {
            return await firstValueFrom(
                this.http.patch(`${this.base}/alert/box/${boxId}/resolve-all`, {})
            );
        } catch (err) {
            const apiError = this.handleHttpError(err, `Box ${boxId}`, 'Error al marcar todas las alertas como leídas');
            console.error(`[API] ${apiError.userMessage}`, apiError.technicalMessage);
            throw apiError;
        }
    }

    /** Eliminar una alerta */
    async deleteNotification(notificationId: number): Promise<any> {
        try {
            return await firstValueFrom(
                this.http.delete(`${this.base}/alert/${notificationId}`)
            );
        } catch (err) {
            const apiError = this.handleHttpError(err, `Alerta ${notificationId}`, 'Error eliminando alerta');
            console.error(`[API] ${apiError.userMessage}`, apiError.technicalMessage);
            throw apiError;
        }
    }
}
