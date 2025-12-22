/**
 * Servicio para manejar las operaciones de Contact Us
 * @class ContactService
 */
class ContactService {
    /**
     * Constructor del servicio de contacto
     * @param {ApiService} apiService - Instancia del servicio API genérico
     */
    constructor(apiService) {
        this.api = apiService;
        this.endpoint = '/api/Contact';
    }

    /**
     * Envía un mensaje de contacto
     * @param {Object} contactData - Datos del formulario de contacto
     * @param {string} contactData.name - Nombre del usuario
     * @param {string} contactData.email - Email del usuario
     * @param {string} contactData.subject - Asunto del mensaje
     * @param {string} contactData.message - Mensaje del usuario
     * @returns {Promise<Object>} Respuesta del servidor
     */
    async sendMessage(contactData) {
        // Validar datos antes de enviar
        const validationErrors = this.validateContactData(contactData);
        if (validationErrors.length > 0) {
            return {
                success: false,
                error: 'Datos de contacto inválidos',
                validationErrors: validationErrors
            };
        }

        // Preparar el DTO (sin captchaToken)
        const dto = {
            name: contactData.name.trim(),
            email: contactData.email.trim(),
            subject: contactData.subject.trim(),
            message: contactData.message.trim()
        };

        // Preparar el request con DTO y captchaToken separados
        const requestData = {
            dto: dto,
            captchaToken: contactData.captchaToken || null
        };

        try {
            const response = await this.api.post(this.endpoint, requestData);
            return response;
        } catch (error) {
            return {
                success: false,
                error: 'Error al enviar el mensaje',
                details: error.message
            };
        }
    }

    /**
     * Valida los datos del formulario de contacto
     * @private
     * @param {Object} data - Datos a validar
     * @returns {Array<string>} Array de errores de validación
     */
    validateContactData(data) {
        const errors = [];

        // Validar nombre
        if (!data.name || data.name.trim() === '') {
            errors.push('El nombre es requerido');
        } else if (data.name.trim().length > 100) {
            errors.push('El nombre no puede exceder 100 caracteres');
        }

        // Validar email
        if (!data.email || data.email.trim() === '') {
            errors.push('El email es requerido');
        } else if (!this.isValidEmail(data.email.trim())) {
            errors.push('El formato del email no es válido');
        }

        // Validar asunto
        if (!data.subject || data.subject.trim() === '') {
            errors.push('El asunto es requerido');
        } else if (data.subject.trim().length > 200) {
            errors.push('El asunto no puede exceder 200 caracteres');
        }

        // Validar mensaje
        if (!data.message || data.message.trim() === '') {
            errors.push('El mensaje es requerido');
        } else if (data.message.trim().length > 2000) {
            errors.push('El mensaje no puede exceder 2000 caracteres');
        }

        return errors;
    }

    /**
     * Valida el formato de un email
     * @private
     * @param {string} email - Email a validar
     * @returns {boolean} True si el email es válido
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Verifica el estado de salud del endpoint
     * @returns {Promise<Object>} Estado del servicio
     */
    async healthCheck() {
        try {
            const response = await this.api.get(`${this.endpoint}/health`);
            return response;
        } catch (error) {
            return {
                success: false,
                error: 'No se pudo verificar el estado del servicio',
                details: error.message
            };
        }
    }
}

// Exportar la clase para uso global
window.ContactService = ContactService;
