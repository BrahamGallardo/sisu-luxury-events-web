/**
 * Servicio para gestionar paquetes de venues desde el panel de administración
 * @class VenuePackageAdminService
 */
class VenuePackageAdminService {
    constructor(authService) {
        this.api = new ApiService('https://localhost:44392/api/venuepackage');
        this.authService = authService;
    }

    /**
     * Obtiene el header de autorización con el token JWT
     * @private
     * @returns {Object} Headers con el token de autorización
     */
    getAuthHeaders() {
        const token = this.authService.getToken();
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Crea un nuevo paquete de venue (Admin)
     * @param {Object} packageData - Datos del paquete
     * @returns {Promise<Object>} Respuesta del servidor
     */
    async createVenuePackage(packageData) {
        try {
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

            const result = await this.api.request('', {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: dto
            });

            return result;
        } catch (error) {
            console.error('Error creating venue package:', error);
            return {
                success: false,
                error: error.message || 'Error al crear el paquete'
            };
        }
    }

    /**
     * Convierte los servicios al formato DTO esperado por el backend
     * @private
     * @param {Array} services - Servicios
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

        // Validar email si se proporciona
        if (packageData.venueEmail && packageData.venueEmail.trim().length > 0) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(packageData.venueEmail.trim())) {
                errors.push('Invalid email address');
            }
        }

        return errors;
    }

    /**
     * Obtiene una lista paginada de todos los paquetes de venues
     * @param {number} pageIndex - Índice de la página (1-based)
     * @param {number} pageSize - Tamaño de la página
     * @returns {Promise<Object>} Lista paginada de paquetes
     */
    async getVenuePackages(pageIndex = 1, pageSize = 15) {
        try {
            const result = await this.api.request(`?pageIndex=${pageIndex}&pageSize=${pageSize}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return result;
        } catch (error) {
            console.error('Error obteniendo paquetes de venues:', error);
            return {
                success: false,
                error: error.message || 'Error al obtener paquetes de venues'
            };
        }
    }

    /**
     * Obtiene paquetes filtrados por estado
     * @param {string} status - Estado del paquete (Pending, Confirmed, Cancelled, Completed)
     * @param {number} pageIndex - Índice de la página (1-based)
     * @param {number} pageSize - Tamaño de la página
     * @returns {Promise<Object>} Lista paginada de paquetes filtrados
     */
    async getVenuePackagesByStatus(status, pageIndex = 1, pageSize = 15) {
        try {
            const result = await this.api.request(`/status/${status}?pageIndex=${pageIndex}&pageSize=${pageSize}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return result;
        } catch (error) {
            console.error('Error obteniendo paquetes por status:', error);
            return {
                success: false,
                error: error.message || 'Error al obtener paquetes de venues'
            };
        }
    }

    /**
     * Obtiene un paquete específico por ID
     * @param {number} id - ID del paquete
     * @returns {Promise<Object>} Detalles del paquete
     */
    async getVenuePackageById(id) {
        try {
            const result = await this.api.request(`/${id}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return result;
        } catch (error) {
            console.error('Error obteniendo paquete por ID:', error);
            return {
                success: false,
                error: error.message || 'Error al obtener el paquete'
            };
        }
    }

    /**
     * Actualiza el status de un paquete
     * @param {number} id - ID del paquete
     * @param {string} status - Nuevo status (Pending, Confirmed, Cancelled, Completed)
     * @returns {Promise<Object>} Paquete actualizado
     */
    async updateVenuePackageStatus(id, status) {
        try {
            const result = await this.api.request(`/${id}/status`, {
                method: 'PATCH',
                headers: this.getAuthHeaders(),
                body: { status: status }
            });

            return result;
        } catch (error) {
            console.error('Error actualizando status del paquete:', error);
            return {
                success: false,
                error: error.message || 'Error al actualizar el status del paquete'
            };
        }
    }

    /**
     * Actualiza un paquete de venue completo (solo entidad, no servicios)
     * @param {number} id - ID del paquete
     * @param {Object} packageData - Datos actualizados del paquete
     * @returns {Promise<Object>} Paquete actualizado
     */
    async updateVenuePackage(id, packageData) {
        try {
            // Validar datos antes de enviar
            const validationErrors = this.validatePackageDataForUpdate(packageData);
            if (validationErrors.length > 0) {
                return {
                    success: false,
                    error: 'Package data validation failed',
                    validationErrors: validationErrors
                };
            }

            // Preparar el DTO (sin servicios ya que no los actualizamos)
            const dto = {
                id: id,
                venueName: packageData.venueName.trim(),
                venueAddress: packageData.venueAddress?.trim() || null,
                venueCity: packageData.venueCity?.trim() || null,
                venuePhone: packageData.venuePhone?.trim() || null,
                venueEmail: packageData.venueEmail?.trim() || null,
                contactName: packageData.contactName?.trim() || null,
                packageName: packageData.packageName.trim(),
                description: packageData.description?.trim() || null,
                notes: packageData.notes?.trim() || null,
                status: packageData.status || 'Pending'
            };

            const result = await this.api.request(`/${id}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: dto
            });

            return result;
        } catch (error) {
            console.error('Error actualizando paquete de venue:', error);
            return {
                success: false,
                error: error.message || 'Error al actualizar el paquete'
            };
        }
    }

    /**
     * Valida los datos del paquete para actualización (sin validar servicios)
     * @private
     * @param {Object} packageData - Datos del paquete a validar
     * @returns {Array} Lista de errores de validación
     */
    validatePackageDataForUpdate(packageData) {
        const errors = [];

        if (!packageData.venueName || packageData.venueName.trim().length === 0) {
            errors.push('Venue name is required');
        }

        if (!packageData.packageName || packageData.packageName.trim().length === 0) {
            errors.push('Package name is required');
        }

        // Validar email si se proporciona
        if (packageData.venueEmail && packageData.venueEmail.trim().length > 0) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(packageData.venueEmail.trim())) {
                errors.push('Invalid email address');
            }
        }

        // Validar status si se proporciona
        if (packageData.status) {
            const validStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];
            if (!validStatuses.includes(packageData.status)) {
                errors.push(`Invalid status. Valid values are: ${validStatuses.join(', ')}`);
            }
        }

        return errors;
    }

    /**
     * Formatea una fecha a formato legible
     * @param {string} dateString - Fecha en formato ISO
     * @returns {string} Fecha formateada
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    /**
     * Formatea una fecha y hora a formato legible
     * @param {string} dateString - Fecha en formato ISO
     * @returns {string} Fecha y hora formateadas
     */
    formatDateTime(dateString) {
        const date = new Date(dateString);
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    }

    /**
     * Obtiene la clase CSS para el badge de estado
     * @param {string} status - Estado del paquete
     * @returns {string} Clase CSS de Bootstrap
     */
    getStatusBadgeClass(status) {
        const statusClasses = {
            'Pending': 'bg-warning text-dark',
            'Confirmed': 'bg-info',
            'Cancelled': 'bg-danger',
            'Completed': 'bg-success'
        };
        return statusClasses[status] || 'bg-info';
    }
}

// Exportar la clase para uso global
window.VenuePackageAdminService = VenuePackageAdminService;

