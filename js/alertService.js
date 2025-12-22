/**
 * Servicio genérico para manejar alertas con SweetAlert2
 * @class AlertService
 */
class AlertService {
    constructor() {
        this.defaultConfig = {
            customClass: {
                confirmButton: 'btn btn-primary px-4',
                cancelButton: 'btn btn-secondary px-4',
                popup: 'swal-elegant'
            },
            buttonsStyling: false,
            confirmButtonColor: '#c59c6c',
            cancelButtonColor: '#6c757d'
        };
    }

    /**
     * Muestra una alerta de éxito
     * @param {string} title - Título de la alerta
     * @param {string} message - Mensaje de la alerta
     * @param {Object} options - Opciones adicionales
     * @returns {Promise} Promesa de SweetAlert2
     */
    success(title, message = '', options = {}) {
        return Swal.fire({
            icon: 'success',
            title: title,
            text: message,
            timer: options.timer || 3000,
            timerProgressBar: true,
            showConfirmButton: options.showConfirmButton !== false,
            ...this.defaultConfig,
            ...options
        });
    }

    /**
     * Muestra una alerta de error
     * @param {string} title - Título de la alerta
     * @param {string} message - Mensaje de la alerta
     * @param {Object} options - Opciones adicionales
     * @returns {Promise} Promesa de SweetAlert2
     */
    error(title, message = '', options = {}) {
        return Swal.fire({
            icon: 'error',
            title: title,
            text: message,
            showConfirmButton: true,
            ...this.defaultConfig,
            ...options
        });
    }

    /**
     * Muestra una alerta de advertencia
     * @param {string} title - Título de la alerta
     * @param {string} message - Mensaje de la alerta
     * @param {Object} options - Opciones adicionales
     * @returns {Promise} Promesa de SweetAlert2
     */
    warning(title, message = '', options = {}) {
        return Swal.fire({
            icon: 'warning',
            title: title,
            text: message,
            showConfirmButton: true,
            ...this.defaultConfig,
            ...options
        });
    }

    /**
     * Muestra una alerta informativa
     * @param {string} title - Título de la alerta
     * @param {string} message - Mensaje de la alerta
     * @param {Object} options - Opciones adicionales
     * @returns {Promise} Promesa de SweetAlert2
     */
    info(title, message = '', options = {}) {
        return Swal.fire({
            icon: 'info',
            title: title,
            text: message,
            timer: options.timer || 3000,
            timerProgressBar: true,
            showConfirmButton: options.showConfirmButton !== false,
            ...this.defaultConfig,
            ...options
        });
    }

    /**
     * Muestra una alerta de confirmación
     * @param {string} title - Título de la confirmación
     * @param {string} message - Mensaje de la confirmación
     * @param {Object} options - Opciones adicionales
     * @returns {Promise<boolean>} Promesa que resuelve true si confirma, false si cancela
     */
    async confirm(title, message = '', options = {}) {
        const result = await Swal.fire({
            icon: 'question',
            title: title,
            text: message,
            showCancelButton: true,
            confirmButtonText: options.confirmButtonText || 'Yes, confirm',
            cancelButtonText: options.cancelButtonText || 'Cancel',
            ...this.defaultConfig,
            ...options
        });

        return result.isConfirmed;
    }

    /**
     * Muestra una alerta de confirmación con advertencia
     * @param {string} title - Título de la confirmación
     * @param {string} message - Mensaje de la confirmación
     * @param {Object} options - Opciones adicionales
     * @returns {Promise<boolean>} Promesa que resuelve true si confirma, false si cancela
     */
    async confirmDelete(title = 'Are you sure?', message = 'This action cannot be undone', options = {}) {
        const result = await Swal.fire({
            icon: 'warning',
            title: title,
            text: message,
            showCancelButton: true,
            confirmButtonText: options.confirmButtonText || 'Yes, delete it',
            cancelButtonText: options.cancelButtonText || 'Cancel',
            reverseButtons: true,
            ...this.defaultConfig,
            customClass: {
                ...this.defaultConfig.customClass,
                confirmButton: 'btn btn-danger px-4',
                cancelButton: 'btn btn-secondary px-4'
            },
            ...options
        });

        return result.isConfirmed;
    }

    /**
     * Muestra un toast (notificación pequeña)
     * @param {string} message - Mensaje del toast
     * @param {string} icon - Tipo de icono (success, error, warning, info)
     * @param {Object} options - Opciones adicionales
     * @returns {Promise} Promesa de SweetAlert2
     */
    toast(message, icon = 'success', options = {}) {
        return Swal.fire({
            toast: true,
            position: options.position || 'top-end',
            icon: icon,
            title: message,
            showConfirmButton: false,
            timer: options.timer || 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            },
            ...options
        });
    }

    /**
     * Muestra un loading/spinner
     * @param {string} title - Título del loading
     * @param {string} message - Mensaje del loading
     * @returns {void}
     */
    loading(title = 'Please wait...', message = 'Processing your request') {
        Swal.fire({
            title: title,
            text: message,
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }

    /**
     * Cierra cualquier alerta abierta
     * @returns {void}
     */
    close() {
        Swal.close();
    }

    /**
     * Alerta de servicio agregado al evento
     * @param {string} serviceName - Nombre del servicio
     * @returns {Promise} Promesa de SweetAlert2
     */
    serviceAdded(serviceName) {
        return this.toast(
            `${serviceName} added to your event!`,
            'success',
            { timer: 2500 }
        );
    }

    /**
     * Alerta de servicio eliminado del evento
     * @param {string} serviceName - Nombre del servicio
     * @returns {Promise} Promesa de SweetAlert2
     */
    serviceRemoved(serviceName) {
        return this.toast(
            `${serviceName} removed from your event`,
            'info',
            { timer: 2500 }
        );
    }

    /**
     * Confirmación antes de eliminar un servicio
     * @param {string} serviceName - Nombre del servicio
     * @returns {Promise<boolean>} True si confirma, false si cancela
     */
    async confirmRemoveService(serviceName) {
        return await this.confirm(
            'Remove Service?',
            `Are you sure you want to remove "${serviceName}" from your event?`,
            {
                confirmButtonText: 'Yes, remove it',
                cancelButtonText: 'Keep it',
                icon: 'question'
            }
        );
    }

    /**
     * Alerta de formulario enviado exitosamente
     * @param {string} title - Título personalizado
     * @param {string} message - Mensaje personalizado
     * @returns {Promise} Promesa de SweetAlert2
     */
    formSubmitted(title = 'Success!', message = 'Your request has been submitted successfully') {
        return Swal.fire({
            icon: 'success',
            title: title,
            html: message,
            showConfirmButton: true,
            confirmButtonText: 'Great!',
            ...this.defaultConfig
        });
    }

    /**
     * Alerta de validación de formulario
     * @param {Array<string>} errors - Array de errores de validación
     * @returns {Promise} Promesa de SweetAlert2
     */
    validationError(errors) {
        const errorList = errors.map(error => `• ${error}`).join('<br>');

        return Swal.fire({
            icon: 'error',
            title: 'Please check the following:',
            html: `<div class="text-start">${errorList}</div>`,
            showConfirmButton: true,
            confirmButtonText: 'OK',
            ...this.defaultConfig
        });
    }

    /**
     * Alerta personalizada con HTML
     * @param {Object} config - Configuración completa de SweetAlert2
     * @returns {Promise} Promesa de SweetAlert2
     */
    custom(config) {
        return Swal.fire({
            ...this.defaultConfig,
            ...config
        });
    }
}

// Crear instancia global
window.alertService = new AlertService();

// Exportar la clase
window.AlertService = AlertService;
