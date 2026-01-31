import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {

    private readonly BOX_ID_KEY = 'selectedBoxId';
    private readonly ACCESS_CODE_KEY = 'accessCode';

    constructor(
        private apiService: ApiService,
        private storage: StorageService,
        private router: Router
    ) { }

    /**
     * Validar código de acceso y hacer login
     */
    async login(code: string): Promise<{ success: boolean; message?: string }> {
        try {
            const result = await this.apiService.validateCode(code);

            if (result.valid && result.boxId) {
                // Guardar credenciales
                this.storage.set(this.BOX_ID_KEY, result.boxId);
                this.storage.set(this.ACCESS_CODE_KEY, code);
                return { success: true };
            } else {
                return { success: false, message: 'Código de acceso inválido' };
            }
        } catch (error) {
            console.error('[Auth] Error en login:', error);
            return { success: false, message: 'Error de conexión. Intenta de nuevo' };
        }
    }

    /**
     * Cerrar sesión
     */
    logout(): void {
        this.storage.remove(this.BOX_ID_KEY);
        this.storage.remove(this.ACCESS_CODE_KEY);
        this.router.navigate(['/login']);
    }

    /**
     * Verificar si el usuario está autenticado
     */
    isAuthenticated(): boolean {
        return this.storage.has(this.BOX_ID_KEY);
    }

    /**
     * Obtener el boxId del usuario actual
     */
    getBoxId(): string | null {
        return this.storage.get<string>(this.BOX_ID_KEY);
    }

    /**
     * Obtener el código de acceso guardado
     */
    getAccessCode(): string | null {
        return this.storage.get<string>(this.ACCESS_CODE_KEY);
    }
}
