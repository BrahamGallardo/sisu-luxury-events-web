/**
 * Servicio para manejar las operaciones de Event Booking
 * @class BookingService
 */
class BookingService {
    /**
     * Constructor del servicio de booking
     * @param {ApiService} apiService - Instancia del servicio API genérico
     */
    constructor(apiService) {
        this.api = apiService;
        this.endpoint = '/api/Booking';
    }

    /**
     * Crea una nueva reserva de evento
     * @param {Object} bookingData - Datos de la reserva
     * @param {string} bookingData.fullName - Nombre completo del cliente
     * @param {string} bookingData.email - Email del cliente
     * @param {string} bookingData.phone - Teléfono del cliente
     * @param {string} bookingData.city - Ciudad (opcional)
     * @param {string} bookingData.eventType - Tipo de evento
     * @param {string} bookingData.eventDate - Fecha del evento (ISO string)
     * @param {string} bookingData.eventTime - Hora del evento (opcional)
     * @param {number} bookingData.guestCount - Número de invitados
     * @param {string} bookingData.venue - Lugar del evento (opcional)
     * @param {string} bookingData.budget - Presupuesto (opcional)
     * @param {string} bookingData.hearAbout - Cómo se enteró (opcional)
     * @param {string} bookingData.additionalDetails - Detalles adicionales (opcional)
     * @param {Array} bookingData.services - Lista de servicios reservados
     * @param {string} bookingData.captchaToken - Token de reCAPTCHA
     * @returns {Promise<Object>} Respuesta del servidor
     */
    async createBooking(bookingData) {
        // Validar datos antes de enviar
        const validationErrors = this.validateBookingData(bookingData);
        if (validationErrors.length > 0) {
            return {
                success: false,
                error: 'Booking data validation failed',
                validationErrors: validationErrors
            };
        }

        // Preparar servicios en el formato esperado por el backend
        const services = this.mapServicesToDto(bookingData.services);

        // Preparar el DTO (sin captchaToken)
        const dto = {
            fullName: bookingData.fullName.trim(),
            email: bookingData.email.trim(),
            phone: bookingData.phone.trim(),
            city: bookingData.city?.trim() || null,
            eventType: bookingData.eventType.trim(),
            eventDate: bookingData.eventDate,
            eventTime: this.parseTimeSpan(bookingData.eventTime),
            guestCount: parseInt(bookingData.guestCount) || 0,
            venue: bookingData.venue?.trim() || null,
            budget: bookingData.budget?.trim() || null,
            hearAbout: bookingData.hearAbout?.trim() || null,
            additionalDetails: bookingData.additionalDetails?.trim() || null,
            status: 'Pending',
            services: services
        };

        // Preparar el request con DTO y captchaToken separados
        const requestData = {
            dto: dto,
            captchaToken: bookingData.captchaToken || null
        };

        try {
            const response = await this.api.post(this.endpoint, requestData);
            return response;
        } catch (error) {
            return {
                success: false,
                error: 'Error creating booking',
                details: error.message
            };
        }
    }

    /**
     * Convierte los servicios del carrito al formato DTO esperado por el backend
     * @private
     * @param {Array} services - Servicios del carrito
     * @returns {Array} Servicios en formato BookingServiceDto
     */
    mapServicesToDto(services) {
        if (!services || !Array.isArray(services)) {
            return [];
        }

        return services.map(service => {
            // Mapear extras
            const extras = service.extras && Array.isArray(service.extras)
                ? service.extras.map(extra => ({
                    bookingServiceId: 0, // Se asignará en el backend
                    extraId: extra.id || extra.extraId || '',
                    name: extra.name || ''
                }))
                : [];

            return {
                eventBookingId: 0, // Se asignará en el backend
                serviceId: service.id || '',
                name: service.name || '',
                type: service.type || '',
                image: service.image || null,
                quantity: parseInt(service.quantity) || 1,
                duration: parseInt(service.duration) || 0,
                notes: service.notes?.trim() || null,
                extras: extras
            };
        });
    }

    /**
     * Convierte un string de tiempo a formato TimeSpan aceptado por .NET
     * @private
     * @param {string} timeString - Tiempo en formato HH:MM
     * @returns {string|null} Tiempo en formato TimeSpan (HH:MM:SS) o null
     */
    parseTimeSpan(timeString) {
        if (!timeString || timeString.trim() === '') {
            return null;
        }

        // Si ya viene en formato HH:MM, agregar :00 para segundos
        const timeParts = timeString.trim().split(':');
        if (timeParts.length === 2) {
            return `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}:00`;
        } else if (timeParts.length === 3) {
            return timeString.trim();
        }

        return null;
    }

    /**
     * Valida los datos de la reserva
     * @private
     * @param {Object} data - Datos a validar
     * @returns {Array<string>} Array de errores de validación
     */
    validateBookingData(data) {
        const errors = [];

        // Validar fullName
        if (!data.fullName || data.fullName.trim() === '') {
            errors.push('Full name is required');
        } else if (data.fullName.trim().length > 100) {
            errors.push('Full name cannot exceed 100 characters');
        }

        // Validar email
        if (!data.email || data.email.trim() === '') {
            errors.push('Email is required');
        } else if (!this.isValidEmail(data.email.trim())) {
            errors.push('Invalid email format');
        }

        // Validar phone
        if (!data.phone || data.phone.trim() === '') {
            errors.push('Phone is required');
        } else if (data.phone.trim().length > 20) {
            errors.push('Phone cannot exceed 20 characters');
        }

        // Validar eventType
        if (!data.eventType || data.eventType.trim() === '') {
            errors.push('Event type is required');
        }

        // Validar eventDate
        if (!data.eventDate || data.eventDate.trim() === '') {
            errors.push('Event date is required');
        } else {
            const eventDate = new Date(data.eventDate);
            if (isNaN(eventDate.getTime())) {
                errors.push('Invalid event date format');
            } else {
                // Validar que la fecha sea futura
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (eventDate < today) {
                    errors.push('Event date must be in the future');
                }
            }
        }

        // Validar guestCount
        const guestCount = parseInt(data.guestCount);
        if (isNaN(guestCount) || guestCount <= 0) {
            errors.push('Guest count must be greater than zero');
        }

        // Validar services
        if (!data.services || !Array.isArray(data.services) || data.services.length === 0) {
            errors.push('At least one service is required');
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
                error: 'Unable to verify service status',
                details: error.message
            };
        }
    }
}

// Exportar la clase para uso global
window.BookingService = BookingService;
