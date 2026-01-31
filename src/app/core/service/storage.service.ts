import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {

    constructor() { }

    /**
     * Guardar un valor en localStorage
     */
    set(key: string, value: any): void {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
        } catch (error) {
            console.error(`Error guardando en localStorage (${key}):`, error);
        }
    }

    /**
     * Obtener un valor de localStorage
     */
    get<T>(key: string): T | null {
        try {
            const item = localStorage.getItem(key);
            if (!item) return null;
            return JSON.parse(item) as T;
        } catch (error) {
            console.error(`Error leyendo de localStorage (${key}):`, error);
            return null;
        }
    }

    /**
     * Eliminar un valor de localStorage
     */
    remove(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error eliminando de localStorage (${key}):`, error);
        }
    }

    /**
     * Limpiar todo el localStorage
     */
    clear(): void {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error limpiando localStorage:', error);
        }
    }

    /**
     * Verificar si existe una clave en localStorage
     */
    has(key: string): boolean {
        return localStorage.getItem(key) !== null;
    }
}
