/**
 * Servicio para gestionar paquetes de venues desde el frontend público
 * @class VenuePackageService
 */
class VenuePackageService {
    /**
     * Constructor del servicio de venue package
     * @param {ApiService} apiService - Instancia del servicio API genérico
     */
    constructor(apiService) {
        this.api = apiService || new ApiService('https://localhost:44392/api/venuepackage');
        this.endpoint = '/api/VenuePackage';
    }

    /**
     * Crea un nuevo paquete de venue
     * @param {Object} packageData - Datos del paquete
     * @param {string} packageData.venueName - Nombre del venue
     * @param {string} packageData.venueAddress - Dirección del venue (opcional)
     * @param {string} packageData.venueCity - Ciudad del venue (opcional)
     * @param {string} packageData.venuePhone - Teléfono del venue (opcional)
     * @param {string} packageData.venueEmail - Email del venue (opcional)
     * @param {string} packageData.contactName - Nombre del contacto (opcional)
     * @param {string} packageData.packageName - Nombre del paquete
     * @param {string} packageData.description - Descripción del paquete (opcional)
     * @param {string} packageData.notes - Notas adicionales (opcional)
     * @param {Array} packageData.services - Lista de servicios en el paquete
     * @returns {Promise<Object>} Respuesta del servidor
     */
    async createVenuePackage(packageData) {
        // Validar datos antes de enviar
        const validationErrors = this.validatePackageData(packageData);
        if (validationErrors.length > 0) {
            return {
                success: false,
                error: 'Package data validation failed',
                validationErrors: validationErrors
            };
        }

        // Preparar servicios en el formato esperado por el backend
        const services = this.mapServicesToDto(packageData.services);

        // Preparar el DTO
        const dto = {
            venueName: packageData.venueName.trim(),
            venueAddress: packageData.venueAddress?.trim() || null,
            venueCity: packageData.venueCity?.trim() || null,
            venuePhone: packageData.venuePhone?.trim() || null,
            venueEmail: packageData.venueEmail?.trim() || null,
            contactName: packageData.contactName?.trim() || null,
            packageName: packageData.packageName.trim(),
            description: packageData.description?.trim() || null,
            notes: packageData.notes?.trim() || null,
            status: 'Pending',
            services: services
        };

        try {
            const response = await this.api.post(this.endpoint, dto);
            return response;
        } catch (error) {
            return {
                success: false,
                error: 'Error creating venue package',
                details: error.message
            };
        }
    }

    /**
     * Convierte los servicios del carrito al formato DTO esperado por el backend
     * @private
     * @param {Array} services - Servicios del carrito
     * @returns {Array} Servicios en formato VenuePackageProductDto
     */
    mapServicesToDto(services) {
        if (!services || !Array.isArray(services)) {
            return [];
        }

        return services.map(service => ({
            venuePackageId: 0, // Se asignará en el backend
            serviceId: service.id || '',
            name: service.name || '',
            type: service.type || '',
            image: service.image || null,
            quantity: parseInt(service.quantity) || 1,
            duration: service.duration ? parseInt(service.duration) : null,
            notes: service.notes?.trim() || null
        }));
    }

    /**
     * Valida los datos del paquete antes de enviarlos
     * @private
     * @param {Object} packageData - Datos del paquete a validar
     * @returns {Array} Lista de errores de validación
     */
    validatePackageData(packageData) {
        const errors = [];

        if (!packageData.venueName || packageData.venueName.trim().length === 0) {
            errors.push('Venue name is required');
        }

        if (!packageData.packageName || packageData.packageName.trim().length === 0) {
            errors.push('Package name is required');
        }

        if (!packageData.services || !Array.isArray(packageData.services) || packageData.services.length === 0) {
            errors.push('At least one service is required');
        }

        return errors;
    }
}

// Exportar la clase para uso global
window.VenuePackageService = VenuePackageService;

