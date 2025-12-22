/**
 * Servicio genérico para realizar peticiones AJAX a la API
 * @class ApiService
 */
class ApiService {
    /**
     * Constructor del servicio API
     * @param {string} baseUrl - URL base de la API
     */
    constructor(baseUrl) {
        this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    }

    /**
     * Realiza una petición HTTP genérica
     * @private
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} options - Opciones de la petición
     * @returns {Promise<Object>} Respuesta de la API
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;

        const config = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        if (options.body) {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);

            // Parsear la respuesta como JSON
            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            // Si la respuesta no es exitosa, lanzar error
            if (!response.ok) {
                throw {
                    status: response.status,
                    statusText: response.statusText,
                    data: data
                };
            }

            return {
                success: true,
                data: data,
                status: response.status
            };

        } catch (error) {
            // Si es un error de red o timeout
            if (!error.status) {
                return {
                    success: false,
                    error: 'Error de conexión con el servidor',
                    details: error.message
                };
            }

            // Si es un error HTTP
            return {
                success: false,
                status: error.status,
                error: error.statusText,
                data: error.data
            };
        }
    }

    /**
     * Realiza una petición GET
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} params - Parámetros query string
     * @returns {Promise<Object>} Respuesta de la API
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;

        return await this.request(url, { method: 'GET' });
    }

    /**
     * Realiza una petición POST
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} body - Cuerpo de la petición
     * @returns {Promise<Object>} Respuesta de la API
     */
    async post(endpoint, body) {
        return await this.request(endpoint, {
            method: 'POST',
            body: body
        });
    }

    /**
     * Realiza una petición PUT
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} body - Cuerpo de la petición
     * @returns {Promise<Object>} Respuesta de la API
     */
    async put(endpoint, body) {
        return await this.request(endpoint, {
            method: 'PUT',
            body: body
        });
    }

    /**
     * Realiza una petición PATCH
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} body - Cuerpo de la petición
     * @returns {Promise<Object>} Respuesta de la API
     */
    async patch(endpoint, body) {
        return await this.request(endpoint, {
            method: 'PATCH',
            body: body
        });
    }

    /**
     * Realiza una petición DELETE
     * @param {string} endpoint - Endpoint de la API
     * @returns {Promise<Object>} Respuesta de la API
     */
    async delete(endpoint) {
        return await this.request(endpoint, {
            method: 'DELETE'
        });
    }
}

// Exportar la clase para uso global
window.ApiService = ApiService;
