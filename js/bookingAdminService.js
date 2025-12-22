/**
 * Servicio para gestionar bookings desde el panel de administración
 * @class BookingAdminService
 */
class BookingAdminService {
    constructor(authService) {
        this.api = new ApiService('https://localhost:44392/api/booking');
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
            'Authorization': `Bearer ${token}`
        };
    }

    /**
     * Obtiene una lista paginada de todos los bookings
     * @param {number} pageIndex - Índice de la página (1-based)
     * @param {number} pageSize - Tamaño de la página
     * @returns {Promise<Object>} Lista paginada de bookings
     */
    async getBookings(pageIndex = 1, pageSize = 15) {
        try {
            const result = await this.api.request(`?pageIndex=${pageIndex}&pageSize=${pageSize}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return result;
        } catch (error) {
            console.error('Error obteniendo bookings:', error);
            return {
                success: false,
                error: error.message || 'Error al obtener bookings'
            };
        }
    }

    /**
     * Obtiene bookings filtrados por estado
     * @param {string} status - Estado del booking (Pending, Confirmed, Cancelled, Completed)
     * @param {number} pageIndex - Índice de la página (1-based)
     * @param {number} pageSize - Tamaño de la página
     * @returns {Promise<Object>} Lista paginada de bookings filtrados
     */
    async getBookingsByStatus(status, pageIndex = 1, pageSize = 15) {
        try {
            const result = await this.api.request(`/status/${status}?pageIndex=${pageIndex}&pageSize=${pageSize}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return result;
        } catch (error) {
            console.error('Error obteniendo bookings por status:', error);
            return {
                success: false,
                error: error.message || 'Error al obtener bookings'
            };
        }
    }

    /**
     * Obtiene un booking específico por ID
     * @param {number} id - ID del booking
     * @returns {Promise<Object>} Detalles del booking
     */
    async getBookingById(id) {
        try {
            const result = await this.api.request(`/${id}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return result;
        } catch (error) {
            console.error('Error obteniendo booking por ID:', error);
            return {
                success: false,
                error: error.message || 'Error al obtener el booking'
            };
        }
    }

    /**
     * Actualiza el status de un booking
     * @param {number} id - ID del booking
     * @param {string} status - Nuevo status (Pending, Confirmed, Cancelled, Completed)
     * @returns {Promise<Object>} Booking actualizado
     */
    async updateBookingStatus(id, status) {
        try {
            const result = await this.api.request(`/${id}/status`, {
                method: 'PATCH',
                headers: this.getAuthHeaders(),
                body: { status: status }
            });

            return result;
        } catch (error) {
            console.error('Error actualizando status del booking:', error);
            return {
                success: false,
                error: error.message || 'Error al actualizar el status del booking'
            };
        }
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
     * @param {string} status - Estado del booking
     * @returns {string} Clase CSS de Bootstrap
     */
    getStatusBadgeClass(status) {
        const statusClasses = {
            'Pending': 'bg-warning text-dark',
            'Confirmed': 'bg-success',
            'Cancelled': 'bg-danger',
            'Completed': 'bg-secondary'
        };
        return statusClasses[status] || 'bg-info';
    }
}

// Exportar la clase para uso global
window.BookingAdminService = BookingAdminService;
