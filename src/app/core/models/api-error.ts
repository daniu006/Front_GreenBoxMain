/**
 * Clase de error personalizada para la API
 * Proporciona información detallada sobre errores HTTP
 */
export class ApiError extends Error {
    constructor(
        public statusCode: number,
        public userMessage: string,
        public technicalMessage?: string,
        public endpoint?: string
    ) {
        super(userMessage);
        this.name = 'ApiError';
    }

    /**
     * Determina si el error es recuperable (puede reintentar)
     */
    isRetryable(): boolean {
        return this.statusCode >= 500 || this.statusCode === 408 || this.statusCode === 429;
    }

    /**
     * Determina si el error es de autenticación
     */
    isAuthError(): boolean {
        return this.statusCode === 401 || this.statusCode === 403;
    }
}

/**
 * Códigos de error HTTP comunes
 */
export enum HttpStatusCode {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    INTERNAL_SERVER_ERROR = 500,
    SERVICE_UNAVAILABLE = 503
}
