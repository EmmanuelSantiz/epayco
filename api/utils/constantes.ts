export class Constantes {
    // API version prefix
    static readonly API_VERSION = 'v1';
    
    // Base routes
    static readonly BASE_ROUTE = `/api/${Constantes.API_VERSION}`;
    
    // Client routes
    static readonly CLIENTES = {
        BASE: `${Constantes.BASE_ROUTE}/clientes`,
    };
    
    // Wallet routes
    static readonly BILLETERA = {
        BASE: `${Constantes.BASE_ROUTE}/billetera`,
        RECARGAR: `/recargar`,
        CONSULTAR_SALDO: `/saldo`,
    };

    // Sessions routes
    static readonly SESSIONS = {
        BASE: `${Constantes.BASE_ROUTE}/session`,
    };
    
    // Transaction routes
    static readonly TRANSACCIONES = {
        BASE: `${Constantes.BASE_ROUTE}/transacciones`,
        PAGO: `/pago`,
        CONFIRMAR: `/confirmar`,
    };
    
    // Health check route
    static readonly HEALTH = '/health';

    // Documentation
    static readonly API_DOC = '/api-docs';
    
    // Status codes
    static readonly STATUS_CODES = {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        INTERNAL_SERVER_ERROR: 500
    };

    static readonly MESSAGES = {
        SUCCESS: 'Operación exitosa',
        ERROR: 'Error en la operación',
        NOT_FOUND: 'Recurso no encontrado',
        BAD_REQUEST: 'Solicitud incorrecta',
        UNAUTHORIZED: 'No autorizado',
        FORBIDDEN: 'Acceso denegado',
        INTERNAL_SERVER_ERROR: 'Error interno del servidor'
    };
    // API documentation
    static readonly ERROR_CUSTOM_MESSAGES = {
        REQUERIDOS: 'Uno o mas campos son requeridos',
        BODY_VACIO: 'El cuerpo de la petición está vacío',
    };
    
    // Constructor is empty as all properties are static
    constructor() {}
}